import { Tree, filter, noop, Rule, SchematicContext } from '@angular-devkit/schematics';
import * as path from 'path';
import * as ts from 'typescript';
import * as fs from 'fs';

/**
 * Don't add file at `path` if it already exists.
 */
export function filterExistingPath(tree: Tree, filePath: string, context?: SchematicContext): Rule {
  return tree.exists(filePath)
    ? filter((schematicPath) => {
        const filename = path.basename(filePath);
        const fileExists = schematicPath.endsWith(filename);

        if (fileExists && context) {
          context.logger.warn(`Not adding ${filename}. File exists at ${filePath}`);
        }

        return !fileExists;
      })
    : noop();
}

// return the matching nodes based on the predicate or all the nodes.
export function findSourceNodes(
  sourceFile: ts.SourceFile,
  filter: (node: ts.Node) => boolean,
  debug = false
): ts.Node[] {
  const nodes: ts.Node[] = [sourceFile];
  let result: ts.Node[] = [];

  while (nodes.length > 0) {
    const node = nodes.shift();

    if (node) {
      result.push(node);

      if (debug) {
        console.log(`kind:${node.kind}, syntaxKind: ${ts.SyntaxKind[node.kind]}`);
      }
      if (filter(node)) {
        result = [node];
        break;
      }

      if (node.getChildCount(sourceFile) >= 0) {
        nodes.unshift(...node.getChildren());
      }
    }
  }

  return result;
}

export function createOrUpdate(host: Tree, path: string, content: string) {
  if (host.exists(path)) {
    host.overwrite(path, content);
  } else {
    host.create(path, content);
  }
}

/**
 * Get a list of all file paths
 */
export function getAllFilePaths({
  nodePath = '.',
  excludePath = (nodePath) =>
    ['node_modules', 'dist', 'e2e'].some((dir) => nodePath.startsWith(dir)),
}: {
  nodePath?: string;
  excludePath?: (nodePath: string) => boolean;
}): string[] {
  try {
    if (excludePath(nodePath)) {
      return [];
    }

    return fs.readdirSync(nodePath).reduce((acc: string[], val: string): string[] => {
      const joinedPath = path.join(nodePath, val);

      return acc.concat(
        fs.statSync(joinedPath).isDirectory()
          ? [...getAllFilePaths({ nodePath: joinedPath })]
          : joinedPath
      );
    }, []);
  } catch (err) {
    if (err.code === 'ENOTDIR') {
      return [];
    }
    return [];
  }
}
