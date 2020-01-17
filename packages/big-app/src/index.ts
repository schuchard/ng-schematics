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
      chain(
        ['a', 'b', 'c', 'd', 'e'].map((route) => scaffoldModule({ project: 'app-one', route }))
      ),
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

function scaffoldModule(opt: {
  project: string;
  route?: string;
  name?: string;
  moduleName?: string;
  routing?: boolean;
}): Rule {
  return chain([
    externalSchematic('@schematics/angular', 'module', {
      routing: opt.routing,
      project: opt.project,
      route: opt.route ?? opt.project,
      module: opt.moduleName ?? 'app',
      name: opt.name ?? opt.route ?? opt.project,
    }),
  ]);
}
