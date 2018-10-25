import { ReducedSpec } from "./commands/gen-swagger";

export function generateSwagger(
  specs: ReducedSpec[],
  title = "Agreed",
  description = "Generate via agreed-typed",
  version = "0.0.1"
) {
  const swagger = {
    swagger: "2.0",
    info: {
      title,
      description,
      version
    },
    paths: generatePath(specs)
  };

  return swagger;
}

function generatePath(specs: ReducedSpec[]) {
  const genpath = (schema: ReducedSpec) => {
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
        throw new Error("generator duplicated specs");
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
  };

  return specs.reduce((p, c) => {
    return {
      ...p,
      ...genpath(c)
    };
  }, {});
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
  const responses = resp.anyOf ? resp.anyOf.map(a => a.allOf) : [resp.allOf];
  return responses.reduce((p, c) => {
    const headers = c.find(r => r.properties.headers);
    const statusCode = c.find(r => r.properties.statusCode);
    const body = c.find(r => r.properties.body);

    const headerProps = headers ? headers.properties.headers.properties : {};
    const h = Object.keys(headerProps).reduce((m, current) => {
      return {
        ...m,
        [current]: {
          description: current,
          type: headerProps[current].type
        }
      };
    }, {});
    return {
      ...p,
      [`${statusCode.properties.statusCode.enum[0]}`]: {
        description: "test",
        headers: h, // headers ? parseProperties(headers, "header") : {},
        schema: body.properties.body
      }
    };
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
