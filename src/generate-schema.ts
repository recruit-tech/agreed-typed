import { resolve } from "path";
import * as ts from "typescript";
import { default as TJS, Definition } from "typescript-json-schema";

export interface Spec {
  name: string;
  path: string[];
  schema: Definition;
}

export function generateSchema(fileNames, typeNames, baseDir?: string): Spec[] {
  const settings: TJS.PartialArgs = { required: true };
  const compilerOptions: TJS.CompilerOptions = { module: ts.ModuleKind.ES2015 };

  const res = f => {
    return resolve(f);
  };

  const program = TJS.getProgramFromFiles(
    fileNames.map(res),
    compilerOptions,
    baseDir
  );
  const generator = TJS.buildGenerator(program, settings);
  return typeNames.map(t => {
    return {
      ...t,
      schema: generator.getSchemaForSymbol(t.name)
    };
  });
}
