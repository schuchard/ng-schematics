import inquirer from 'inquirer';
import { SchematicContext } from '@angular-devkit/schematics';

inquirer.registerPrompt('fuzzypath', require('inquirer-fuzzy-path'));

export interface IQueryFileSystem {
  isDir: boolean;
  dir: string;
  isSpec: boolean;
  path: string;
}

// lists entire filesystem
export function queryFileSystem({
  context,
  defaultSearch = '',
  rootPath = 'src',
}: {
  context: SchematicContext;
  defaultSearch?: string;
  rootPath?: string;
}) {
  // https://github.com/adelsz/inquirer-fuzzy-path
  return inquirer
    .prompt([
      {
        type: 'fileSystemSearch',
        name: 'path',
        excludePath: (nodePath: string) => nodePath.startsWith('node_modules'),
        // excludePath :: (String) -> Bool
        // excludePath to exclude some paths from the file-system scan
        itemType: 'any',
        // itemType :: 'any' | 'directory' | 'file'
        // specify the type of nodes to display
        // default value: 'any'
        // example: itemType: 'file' - hides directories from the item list
        rootPath,
        // rootPath :: String
        // Root search directory
        message: 'Select a target directory or spec file:',
        default: defaultSearch,
        suggestOnly: false,
        // suggestOnly :: Bool
        // Restrict prompt answer to available choices or use them as suggestions
        depthLimit: 50,
        // depthLimit :: integer >= 0
        // Limit the depth of sub-folders to scan
        // Defaults to infinite depth if undefined
      },
    ])
    .then(
      ({ path }: { path: string }): IQueryFileSystem => {
        if (!path) {
          context.logger.error('Must select a directory or file');
          throw new Error();
        }

        if (path.endsWith('.spec.ts')) {
          console.log(`file selected ${path}`);
        } else {
          console.log(`directory selected ${path}`);
        }

        return {
          path,
          // anything other than a spec file will be considered a directory
          isDir: !path.endsWith('.spec.ts'),
          isSpec: path.endsWith('.spec.ts'),
          // drop the file name to get just the directory: src/app/app.component.spec.ts > src/app
          dir: path
            .split('/')
            .slice(0, -1)
            .join('/'),
        };
      }
    );
}
