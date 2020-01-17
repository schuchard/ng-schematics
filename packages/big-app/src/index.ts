import { chain, Rule, SchematicContext, Tree, externalSchematic } from '@angular-devkit/schematics';
import { ProjectOptions } from '@schuchard/schematics-core';

interface SchematicOptions extends ProjectOptions {
  project: string;
}

export default function index(_options: SchematicOptions): Rule {
  return async (_tree: Tree, _context: SchematicContext) => {
    return chain([
      externalSchematic('@schematics/angular', 'ng-new', {
        name: 'workspace',
        version: '8.0.0',
        createApplication: false,
        routing: true,
        style: 'scss',
      }),
    ]);
  };
}
