import { run } from "./parser";

function main() {
  const schemas = run();

  const specs = schemas.reduce((prev: any[], current) => {
    const exist = prev.find(p => {
      return isSamePath(p.path, current.path);
    });
    if (exist) {
      exist.schemas.push(current);
      return prev;
    }
    prev.push({ path: current.path, schemas: [current] });
    return prev;
  }, []);

  const base = {
    swagger: "2.0",
    info: {
      title: "Agreed",
      description: "Generate from agreed-typed",
      version: "1.0"
    },
    paths: specs.reduce((p, c) => {
      return {
        ...p,
        ...generatePath(c)
      };
    }, {})
  };
  process.stdout.write(JSON.stringify(base, null, 4));
}

function generatePath(schema: { path: string[]; schemas: object[] }) {
  const pathParam = schema.path.reduce(
    (p, c) => {
      if (c.startsWith(":")) {
        const placeholder = c.slice(1);
        p.name += `/{${placeholder}}`;
        p.params.push(placeholder);
        return p;
      }
      p.name += "/" + c;
      return p;
    },
    { name: "", params: [] }
  );

  const schemas = schema.schemas.reduce((p, c: any) => {
    const {
      query,
      method,
      headers,
      body
    } = c.schema.properties.request.properties;
    if (p[method.enum[0]]) {
      // tslint:disable-next-line
      console.error("generator duplicated specs");
      process.exit(1);
    }
    let parameters = [
      ...parsePathParam(pathParam.params),
      ...parseProperties(query, "query"),
      ...parseProperties(headers, "header")
    ];

    if (body && body.properties) {
      parameters = parameters.concat(parseBody(body));
    }
    const responses = parseResponse(c.schema.properties.response);
    p[method.enum[0].toLowerCase()] = { parameters, responses };

    return p;
  }, {});

  return { [pathParam.name]: schemas };
}

function parseBody(body: object): object {
  return {
    in: "body",
    name: "request body",
    required: true,
    schema: body
  };
}

function parseResponse(resp: any): object {
  const body = !resp.properties.body.anyOf
    ? { success: resp.properties.body }
    : resp.properties.body.anyOf.reduce((p, c) => {
        if (Object.keys(c.properties).includes("errorCode")) {
          p.error = c;
          return p;
        }
        p.success = c;
        return p;
      }, {});
  return resp.properties.statusCode.enum.reduce((p, c) => {
    if (c >= 400 && !body.error) {
      return p;
    }
    p[`${c}`] = {
      description: "test",
      schema: c >= 400 ? body.error : body.success
    };
    return p;
  }, {});
}

function parsePathParam(paths: string[]): object[] {
  return paths.map(p => {
    return {
      in: "path",
      name: p,
      required: true,
      type: "string"
    };
  });
}

function parseProperties(query, inname): object[] {
  const { properties } = query;
  return Object.keys(properties).map(k => {
    if (properties[k].enum) {
      return {
        in: inname,
        required: query.required.includes(k),
        type: properties[k].type,
        name: k,
        enum: properties[k].enum,
        default: properties[k].enum[0]
      };
    }
    return {
      in: inname,
      required: query.required.includes(k),
      type: properties[k].type,
      name: k
    };
  });
}

function isSamePath(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let equal = true;
  a.forEach((r, i) => {
    const l = b[i];
    if (r === l) {
      return;
    }
    if (r.startsWith(":") && l.startsWith(":")) {
      return;
    }

    equal = false;
  });

  return equal;
}

main();
