import { readFileSync, writeFileSync } from 'fs';
import {
  createSourceFile,
  isVariableStatement,
  ScriptTarget,
  SourceFile,
  transform,
  TransformationContext,
  TransformerFactory,
  isVariableDeclaration,
  VisitResult,
  Node,
  isIdentifier,
  visitEachChild,
  visitNode,
  createPrinter,
  NewLineKind,
  EmitHint,
} from 'typescript';

const filename = process.argv[2];
console.log(`transforming ${filename}`);

function readCodeInFile(filename: string): SourceFile {
  return createSourceFile(
    filename,
    readFileSync(filename, 'utf8'),
    ScriptTarget.Latest
  );
}

const writeFile = (updatedFile: string, fileName: string): void => {
  console.log('Updating file ', `${fileName}:`);
  if (updatedFile) {
    try {
      writeFileSync(fileName, updatedFile);
    } catch (err) {
      console.log('Update failed with error: ', err);
    }
  }
};

const writeCodeToString = (code: SourceFile) => {
  const printer = createPrinter({ newLine: NewLineKind.LineFeed });
  return printer.printNode(EmitHint.Unspecified, code, code);
};

const removeConstVariable: TransformerFactory<SourceFile> = (
  context: TransformationContext
) => (sourceFile) => {
  const visitor = (node: Node): VisitResult<Node> => {
    if (
      isVariableStatement(node) &&
      node.declarationList.declarations.some(
        (varDecl) =>
          isVariableDeclaration(varDecl) &&
          isIdentifier(varDecl.name) &&
          varDecl.name.escapedText === 'variable'
      )
    ) {
      console.log(
        `->> in Node with name \`${
          (node.declarationList.declarations[0].name as any).escapedText
        }\``
      );
      return undefined;
    }
    return visitEachChild(node, visitor, context);
  };

  return visitNode(sourceFile, visitor);
};

try {
  const result = transform(readCodeInFile(filename), [removeConstVariable]);

  writeFile(writeCodeToString(result.transformed[0]), filename);
} catch (error) {
  console.error({ error });
  throw error;
}
