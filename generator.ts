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

  console.log(specs);

  // const base = {
  //   swagger: "2.0",
  //   info: {
  //     title: "Agreed",
  //     description: "Generate from agreed-typed",
  //     version: "1.0"
  //   },
  //   produces: ["application/json"],
  //   host: "localhost:3000",
  //   paths: []
  // };

  // const paths = schemas.map(generatePath);

  // base.paths = paths;
}

// function generatePath(schema) {}

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
