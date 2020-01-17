import { chain, Rule, SchematicContext, Tree, externalSchematic } from '@angular-devkit/schematics';
import { ProjectOptions } from '@schuchard/schematics-core';

interface SchematicOptions extends ProjectOptions {
  project: string;
}

export default function index(_options: SchematicOptions): Rule {
  return async (_tree: Tree, _context: SchematicContext) => {
    return chain([
      externalSchematic('@schematics/angular', 'workspace', {
        name: 'workspace',
        newProjectRoot: 'projects',
        version: '8.0.0',
      }),
      createApplication({ name: 'app-one' }),
      createApplication({ name: 'app-two' }),
      externalSchematic('@schematics/angular', 'library', {
        name: 'lib-one',
      }),
    ]);
  };
}

function createApplication(config: { name: string }): Rule {
  return chain([
    externalSchematic('@schematics/angular', 'application', {
      name: config.name,
      inlineTemplate: false,
      style: 'scss',
      routing: true,
      skipTests: false,
      skipPackageJson: false,
    }),
  ]);
}
