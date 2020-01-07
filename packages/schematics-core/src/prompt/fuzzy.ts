import * as inquirer from 'inquirer';
import * as fuzzy from 'fuzzy';
import stripAnsi from 'strip-ansi';

export type InquirerSearchSource = (previousAnswers: any, input: string) => Promise<any>;
export interface IFuzzySearch {
  displayString: string;
}
export interface IMapAstQuery extends IFuzzySearch {
  path: string;
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
  return async (input: string) => {
    input = input || '';

    const results = await fuzzy
      .filter(input, choices, {
        extract: (el) => el.displayString, // displayed during autocomplete selection
      })
      .map(function({ original, string }: fuzzy.FilterResult<IFuzzySearch>) {
        return {
          value: original, // entire object
          name: stripAnsi(string),
          short: stripAnsi(string),
        };
      });

    return results || [];
  };
}

export function autoCompletePrompt<T extends Record<string, any>>(
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
