import { resolve } from "path";
import * as ts from "typescript";
import * as TJS from "typescript-json-schema";

export interface Spec {
  name: string;
  path: string[];
  doc: object;
  schema: TJS.Definition;
}

export function generateSchema(fileNames, meta, baseDir?: string): Spec[] {
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
  program.getSourceFiles().forEach(sourceFile => {
    ts.forEachChild(sourceFile, n => {
      if (ts.isTypeAliasDeclaration(n)) {
        n.
      }
    });
  });
  const generator = TJS.buildGenerator(program, settings);
  return meta.map(m => {
    return {
      ...m,
      schema: generator.getSchemaForSymbol(m.name)
    };
  });
}
