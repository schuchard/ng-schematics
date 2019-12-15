import { Tree, filter, noop, Rule, SchematicContext } from '@angular-devkit/schematics';
import { basename } from 'path';

/**
 * Don't add file at `path` if it already exists
 */
export function filterExistingPath(tree: Tree, path: string, context?: SchematicContext): Rule {
  return tree.exists(path)
    ? filter((schematicPath) => {
        const filename = basename(path);
        const fileExists = schematicPath.endsWith(filename);

        if (fileExists && context) {
          context.logger.warn(`Not adding ${filename}. File exists at ${path}`);
        }

        return !fileExists;
      })
    : noop();
}
