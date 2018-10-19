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

  const mods = traverse(agreedRoot, 2);

  const filenames = mods.map(a => {
    return a.filename;
  });

  const typeNames = mods.reduce((p, a) => {
    p = p.concat(...a.asts.map(m => m.meta));
    return p;
  }, []);

  const schemas = generateSchema(filenames, typeNames, "/");

  process.stdout.write(JSON.stringify(schemas, null, 4));
  process.exit(1);

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

function traverse(mod, lim = 2) {
  const files = [];
  function traverseRec(module, asts, depth, limit) {
    if (depth >= limit || files.includes(module.filename)) {
      return asts;
    }
    files.push(module.filename);
    if (
      module.filename.endsWith(".ts") &&
      !module.filename.includes("node_modules")
    ) {
      const file = fs.readFileSync(module.filename, "utf-8");
      const ast = parse(file);

      const mods = (ast.body as any[]).reduce((prev, current) => {
        if (
          current.type !== "ExportNamedDeclaration" ||
          current.declaration.kind !== "type"
        ) {
          return prev;
        }

        const declarations = current.declaration.declarations;
        if (!declarations || !declarations[0]) {
          return prev;
        }
        if (
          declarations[0].init &&
          declarations[0].init.type === "TSTypeReference" &&
          declarations[0].init.typeName.name === "APIDef"
        ) {
          const pathType =
            declarations[0].init.typeParameters.params[1].typeName.elementTypes;

          const pathArr = pathType.map(p => {
            if (p.literal) {
              return p.literal.value; // string
            }
            return p.typeParameters.params[0].typeName.literal.value;
          });
          prev.push({
            meta: { name: declarations[0].id.name, path: pathArr },
            ast: current
          });
        }

        return prev;
      }, []);

      if (mods.length > 0) {
        asts.push({ filename: module.filename, asts: mods });
      }
    }

    module.children.forEach(m => {
      traverseRec(m, asts, depth + 1, limit);
    });

    return asts;
  }

  return traverseRec(mod, [], 0, lim);
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
