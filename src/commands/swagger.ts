import * as minimist from "minimist";
import * as path from "path";
import { generateSchema } from "../generate-schema";
import { generateSwagger } from "../generate-swagger";
import { showHelp } from "../util";

import * as fs from "fs";
import { parse } from "typescript-estree";

const usage = `
Usage: agreed-typed gen-swagger [options]
Options:
  --path                             Agreed file path (required)
Examples:
  agreed-typed gen-swagger --path ./agreed.ts
`.trim();

export function generate(arg) {
  const argv = minimist(arg, {
    string: ["path"]
  });

  if (!argv.path) {
    showHelp(1, usage);
    return;
  }

  const agreedPath = path.resolve(process.cwd(), argv.path);
  require(agreedPath);
  const currentModule = require.main.children.find(
    m => m.filename === __filename
  );

  const agreedRoot = currentModule.children.find(
    m => m.filename === agreedPath
  );

  const agrees = agreedRoot.children
    .filter(m => {
      return m.filename.endsWith(".ts") && !m.filename.includes("node_modules");
    })
    .filter(m => {
      const file = fs.readFileSync(m.filename, "utf-8");
      const ast = parse(file);

      const asts = (ast.body as any[]).reduce((p, c) => {
        if (
          c.type !== "ExportNamedDeclaration" ||
          c.declaration.kind !== "type"
        ) {
          return p;
        }

        const declarations = c.declaration.declarations;
        if (!declarations || !declarations[0]) {
          return p;
        }
        if (
          declarations[0].init &&
          declarations[0].init.type === "TSTypeReference" &&
          declarations[0].init.typeName.name === "APIDef"
        ) {
          p.push(c);
        }

        return p;
      }, []);
      return asts.length > 0;
    });

  console.log(agrees);
  throw new Error("break");

  const filenames = process.argv.slice(2);
  const schemas = generateSchema(filenames, __dirname);

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

  const swagger = generateSwagger(specs);

  process.stdout.write(JSON.stringify(swagger, null, 4));
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
