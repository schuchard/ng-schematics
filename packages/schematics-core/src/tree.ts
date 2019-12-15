import { Tree, filter, noop, Rule } from '@angular-devkit/schematics';
import { basename } from 'path';

/**
 * Don't add file at `path` if it already exists
 */
export function filterExistingPath(tree: Tree, path: string): Rule {
  return tree.exists(path)
    ? filter((schematicPath) => !schematicPath.endsWith(basename(path)))
    : noop();
}
