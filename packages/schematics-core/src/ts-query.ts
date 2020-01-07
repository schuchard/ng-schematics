import { tsquery } from '@phenomnomnominal/tsquery';

export interface IDecoratorQueries {
  type: string;
  query: string;
}

export function getDecoratorsQuery(
  decorators = ['Component', 'Pipe', 'Directive', 'Service']
): IDecoratorQueries[] {
  return decorators.map((type) => ({ type, query: makeDecoratorQuery(type) }));
}

function makeDecoratorQuery(decorator: string) {
  return `Decorator > CallExpression > Identifier[name="${decorator}"]`;
}

export function astQuery({
  source,
  queries,
}: {
  source: Buffer | null;
  queries: IDecoratorQueries[];
}) {
  const ast = tsquery.ast((source && source.toString()) || '');
  return queries.filter((q) => tsquery(ast, q.query).length).map((q) => q.type);
}
