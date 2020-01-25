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
        ['am', 'bm', 'cm', 'dm', 'em'].map((module) => {
          return chain([
            scaffoldModule({ project: 'app-one', route: module, routing: true }),
            ...['ac', 'bc'].map((component) =>
              scaffoldComponent({ name: component, module, project: 'app-one' })
            ),
          ]);
        })
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

function scaffoldComponent({
  name,
  module,
  project,
}: {
  name: string;
  module: string;
  project: string;
}): Rule {
  return externalSchematic('@schematics/angular', 'component', {
    name: name,
    ...(!!module && { module: `${module}` }),
    ...(!!project && { project }),
  });
}
