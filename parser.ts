import { Project, ScriptTarget, ts, TypeAliasDeclaration, StatementedNode } from "ts-simple-ast";

const fileNames = process.argv.slice(2);
fileNames.forEach(fileName => {
  const project = new Project({
    compilerOptions: {
      target: ScriptTarget.ES2015
    }
  });

  project.addExistingSourceFile(fileName);
  const sourceFile = project.getSourceFileOrThrow(fileName);
  const types :TypeAliasDeclaration[] = sourceFile.getStatements()
  .filter(s => {
    return ts.isTypeAliasDeclaration(s.compilerNode);
  })
  .map(s => s.compilerNode);

  types.forEach(t => {
  });
});
