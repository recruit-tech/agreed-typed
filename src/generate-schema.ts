import * as fs from "fs";
import { resolve } from "path";
import * as ts from "typescript";
import * as TJS from "typescript-json-schema";

export interface Spec {
  name: string;
  path: string[];
  doc: object;
  schema: TJS.Definition;
}

// export function generateSchema(fileNames, meta, baseDir?: string): Spec[] {
export function generateSchema(fileNames, meta): Spec[] {
  const settings: TJS.PartialArgs = { required: true };
  const compilerOptions: TJS.CompilerOptions = {
    noEmit: true,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
    allowUnusedLabels: true
  };

  const res = p => resolve(p);

  const sources = fileNames.map(res).reduce((p, f) => {
    const src = fs.readFileSync(f).toString("utf-8");
    const sourceFile = ts.createSourceFile(
      f,
      src,
      ts.ScriptTarget.ES2015,
      true,
      ts.ScriptKind.TS
    );

    const result = ts.transform(sourceFile, [transformer]);
    p[f] = result.transformed[0];
    result.dispose();
    return p;
  }, {});

  const host = ts.createCompilerHost(compilerOptions);
  const orgSourceFile = host.getSourceFile;
  host.getSourceFile = (
    fileName: string,
    languageVersion: ts.ScriptTarget,
    onError?: (message: string) => void,
    shouldCreateNewSourceFile?: boolean
  ): ts.SourceFile | undefined => {
    if (sources[fileName]) {
      // console.log(ts.createPrinter().printFile(sources[fileName]));
      return sources[fileName];
    }
    return orgSourceFile(
      fileName,
      languageVersion,
      onError,
      shouldCreateNewSourceFile
    );
  };
  host.getSourceFileByPath = undefined;

  const program = ts.createProgram(fileNames, compilerOptions, host);
  const typeChecker = program.getTypeChecker();

  program.getSourceFiles().forEach(sourceFile => {
    function inspect(node: ts.Node, tc: ts.TypeChecker) {
      if (
        node.kind === ts.SyntaxKind.ClassDeclaration ||
        node.kind === ts.SyntaxKind.InterfaceDeclaration ||
        node.kind === ts.SyntaxKind.EnumDeclaration ||
        node.kind === ts.SyntaxKind.TypeAliasDeclaration
      ) {
        const symbol: ts.Symbol = (node as any).symbol;
        const fullyQualifiedName = tc.getFullyQualifiedName(symbol);
        const typeName = fullyQualifiedName.replace(/".*"\./, "");
        if (typeName === "CreateRequestBody") {
          // console.log((node as any).type.members);
          console.log(tc.getTypeAtLocation.toString());
          const sym = (node as any).symbol;
          console.log(sym);
          tc.getTypeAtLocation(node);
        }
      } else {
        ts.forEachChild(node, n => inspect(n, tc));
      }
    }
    inspect(sourceFile, typeChecker);
  });

  const generator = TJS.buildGenerator(program, settings);
  return meta.map(m => {
    return {
      ...m,
      schema: generator.getSchemaForSymbol(m.name)
    };
  });
}

const transformer = <T extends ts.Node>(context: ts.TransformationContext) => (
  rootNode: T
) => {
  function visit(node: ts.Node): ts.Node {
    node = ts.visitEachChild(node, visit, context);
    if (!ts.isTypeReferenceNode(node)) {
      return node;
    }
    const tr = node as ts.TypeReferenceNode;
    if ((tr.typeName as any).escapedText === "Placeholder") {
      delete tr.typeArguments[0].pos;
      delete tr.typeArguments[0].end;
      return tr.typeArguments[0];
    }
    return node;
  }
  return ts.visitNode(rootNode, visit);
};
