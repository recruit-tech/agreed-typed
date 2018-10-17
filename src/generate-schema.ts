import { resolve } from "path";
import * as ts from "typescript";
import * as TJS from "typescript-json-schema";

type Spec = { name: string; path: string[]; schema: object };

export function generateSchema(fileNames, baseDir?: string): Spec[] {
  const typeNames = extractAPINames(fileNames);
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

export function extractAPINames(fileNames) {
  const exportAPINames = [];
  const program = ts.createProgram(fileNames, {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS
  });

  fileNames.forEach(fileName => {
    const sourceFile = program.getSourceFile(fileName);
    ts.forEachChild(sourceFile, (node: ts.Node) => {
      if (!isNodeExported(node) || !ts.isTypeAliasDeclaration(node)) {
        return;
      }
      const n: any = node.type;
      if (!n.typeName || n.typeName.escapedText !== "APIDef") {
        return;
      }
      const name = node.name.escapedText;
      const nodeType: any = node.type;
      const path = nodeType.typeArguments[1].elementTypes.map(t => {
        if (t.literal) {
          return t.literal.text;
        }

        if (t.typeArguments && t.typeArguments[0]) {
          // Capture Node
          return t.typeArguments[0].literal.text;
        }
        throw new Error("parser unknown state");
      });
      exportAPINames.push({ name, path });
    });
  });

  return exportAPINames;
}

function isNodeExported(node: any): boolean {
  return (
    (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0 ||
    (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
  );
}
