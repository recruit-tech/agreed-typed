import { run } from "./parser";

function main() {
  const schemas = run();
  console.log(schemas);
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

main();
