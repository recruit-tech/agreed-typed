import * as doctrine from "doctrine";
import * as minimist from "minimist";
import * as path from "path";
import { generateSchema } from "../generate-schema";
import { generateSwagger } from "../generate-swagger";
import { showHelp } from "../util";

import { Program } from "estree";
import * as fs from "fs";
import { parse } from "typescript-estree";
import { Definition } from "typescript-json-schema";
import { TSTypeReference } from "../expression-types";

const usage = `
Usage: agreed-typed gen-swagger [options]
Options:
  --path                             Agreed file path (required)
  --title                            swagger title
  --description                      swagger description
  --version                          document version
  --depth                            aggregate depth (default = 2)
  --dry-run                          dry-run mode (outputs on stdout)
  --output                           output filename (default schema.json)
  --help                             show help
Examples:
  agreed-typed gen-swagger --path ./agreed.ts --output schema.json
`.trim();

export function generate(arg) {
  const argv = minimist(arg, {
    string: ["path", "title", "description", "version", "depth", "output"],
    boolean: ["dry-run"]
  });

  if (argv.help) {
    showHelp(0, usage);
    return;
  }

  if (!argv.path) {
    showHelp(1, usage);
    return;
  }

  const depth = argv.depth ? Number(argv.depth) : 2;

  const agreedPath = path.resolve(process.cwd(), argv.path);
  require(agreedPath);

  const currentModule = require.main.children.find(
    m => m.filename === __filename
  );

  const agreedRoot = currentModule.children.find(
    m => m.filename === agreedPath
  );

  const mods = aggregateModules(agreedRoot, depth);

  const filenames = mods.map(a => {
    return a.filename;
  });

  const metaInfos = mods.reduce((p, a) => {
    p = p.concat(...a.asts.map(m => m.meta));
    return p;
  }, []);

  const schemas = generateSchema(filenames, metaInfos);

  const specs = schemas.reduce((prev: ReducedSpec[], current) => {
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

  const swagger = generateSwagger(
    specs,
    argv.title,
    argv.description,
    argv.version
  );

  if (argv["dry-run"]) {
    process.stdout.write(JSON.stringify(swagger, null, 4));
    return;
  }

  fs.writeFileSync(
    path.resolve(process.cwd(), argv.output || "schema.json"),
    JSON.stringify(swagger, null, 4)
  );
}

export interface ReducedSpec {
  path: string[];
  schemas: Array<{
    name: string;
    path: string[];
    doc: object;
    schema: Definition;
  }>;
}

function aggregateModules(mod: NodeModule, lim = 2) {
  const files = [];
  const rec = (module: NodeModule, asts, depth, limit) => {
    if (depth >= limit || files.includes(module.filename)) {
      return asts;
    }
    files.push(module.filename);
    if (
      module.filename.endsWith(".ts") &&
      !module.filename.includes("node_modules")
    ) {
      const file = fs.readFileSync(module.filename, "utf-8");
      const ast: Program = parse(file, { comment: true });

      const docs = ast.comments
        .filter(c => {
          return c.type === "Block";
        })
        .reduce((p, d) => {
          const comment = `/*${d.value}*/`;
          const docAST = doctrine.parse(comment, { unwrap: true });
          p[d.loc.end.line] = { ast: docAST };
          return p;
        }, {});

      const mods = ast.body.reduce((prev, current) => {
        if (current.type !== "ExportNamedDeclaration") {
          return prev;
        }
        if (current.declaration.type !== "VariableDeclaration") {
          return prev;
        }

        const declarations = current.declaration.declarations;
        if (!declarations || !declarations[0]) {
          return prev;
        }

        if (
          declarations[0].init &&
          (declarations[0].init.type as string) === "TSTypeReference" &&
          (declarations[0].init as any).typeName.name === "APIDef"
        ) {
          const init: TSTypeReference = declarations[0].init as any;
          const pathType = init.typeParameters.params[1].typeName.elementTypes;

          const pathArr = pathType.map(p => {
            if (p.literal) {
              return p.literal.value; // string
            }
            return p.typeParameters.params[0].typeName.literal.value;
          });
          const doc = docs[current.declaration.loc.start.line - 1];
          prev.push({
            meta: {
              name: (declarations[0].id as any).name,
              path: pathArr,
              doc
            },
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
      rec(m, asts, depth + 1, limit);
    });

    return asts;
  };

  return rec(mod, [], 0, lim);
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
