import { resolve } from "path";
import * as ts from "typescript";
import * as TJS from "typescript-json-schema";

function main() {
  const fileNames = process.argv.slice(2);
  const agreedAPITypes = parse(fileNames);
  generateSchema(fileNames, agreedAPITypes);
}

function generateSchema(fileNames, typeNames) {
  const settings: TJS.PartialArgs = { required: true };
  const compilerOptions: TJS.CompilerOptions = { module: ts.ModuleKind.ES2015 };

  const res = f => {
    return resolve(f);
  };

  const program = TJS.getProgramFromFiles(
    fileNames.map(res),
    compilerOptions,
    __dirname
  );
  const generator = TJS.buildGenerator(program, settings);
  typeNames.forEach(t => {
    console.log(JSON.stringify(generator.getSchemaForSymbol(t)));
  });
}

function parse(fileNames) {
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
      exportAPINames.push(name);
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

main();
