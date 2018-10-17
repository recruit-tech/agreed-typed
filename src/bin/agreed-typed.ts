#!/usr/bin/env node

import { generateSchema } from "../generate-schema";
import { generateSwagger } from "../generate-swagger";

function main() {
  const commands = {
    sw
  };
}

function sw() {
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

main();
