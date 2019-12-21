import { Tree, filter, noop, Rule, SchematicContext } from '@angular-devkit/schematics';
import * as path from 'path';

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
