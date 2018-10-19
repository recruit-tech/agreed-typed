export function generateSwagger(specs) {
  const swagger = {
    swagger: "2.0",
    info: {
      title: "Agreed",
      description: "Generate via agreed-typed",
      version: "1.0"
    },
    paths: generatePath(specs)
  };

  return swagger;
}

function generatePath(specs) {
  const genpath = schema => {
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
  const body = !resp.anyOf
    ? { success: resp.properties }
    : resp.anyOf.reduce((p, c) => {
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
