import * as inquirer from 'inquirer';
import * as fuzzy from 'fuzzy';
import stripAnsi from 'strip-ansi';
import { SchematicContext } from '@angular-devkit/schematics';

export type InquirerSearchSource = (previousAnswers: any, input: string) => Promise<any>;
export interface IFuzzySearch {
  displayString: string;
}
export interface IMapAstQuery extends IFuzzySearch {
  path: string;
  specPath: string;
  displayString: string;
  matches: string[];
  matchesLength: number;
  isMatch: boolean;
}

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

export function autoCompleteDecoratorFiles(choices: IMapAstQuery[]): Promise<IMapAstQuery> {
  return autoCompletePrompt<IMapAstQuery>(fuzzySearch({ choices }), {
    message: 'Select a Component, Pipe, Directive, or Service',
  });
}

export function fuzzySearch({ choices }: { choices: IFuzzySearch[] }) {
  return async (previousAnswers: any, input: string) => {
    input = input || '';

    const results = await fuzzy
      .filter(input, choices, {
        extract: (el) => el.displayString, // displayed during autocomplete selection
      })
      .map(function({ original, string }) {
        return {
          value: original, // entire object
          name: stripAnsi(string),
          short: stripAnsi(string),
        };
      });

    return results || [];
  };
}

export function autoCompletePrompt<T>(
  source: InquirerSearchSource,
  {
    message, // prompt for selection
    key = 'result', // selection will be under this key
    pageSize = 5,
    suggestOnly = false, // force a selection from available choices
  }: { message: string; key?: string; pageSize?: number; suggestOnly?: boolean }
) {
  return inquirer
    .prompt<T>([
      {
        type: 'autocomplete',
        name: key,
        suggestOnly,
        message,
        source,
        pageSize,
      },
    ])
    .then((answers: T) => {
      console.log('autoCompletePrompt: ', JSON.stringify(answers, null, 2));
      return answers[key];
    });
}

inquirer.registerPrompt('fileSystemSearch', require('inquirer-fuzzy-path'));
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
