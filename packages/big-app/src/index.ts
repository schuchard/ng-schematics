import { chain, Rule, SchematicContext, Tree, externalSchematic } from '@angular-devkit/schematics';

interface SchematicOptions {
  modules: string;
  components: string;
}

const strId = require('incstr');

export default function index(_options: SchematicOptions): Rule {
  const modules = getPositiveNumber(_options.modules);
  const components = getPositiveNumber(_options.components);

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
        generateIdentifiers(modules, 'mod').map((module) => {
          return chain([
            scaffoldModule({ project: 'app-one', route: module, routing: true }),
            ...generateIdentifiers(components, 'comp').map((component) =>
              scaffoldComponent({ name: `${module}-${component}`, module, project: 'app-one' })
            ),
            // root component for lazy module
            scaffoldComponent({
              name: `${module}-component`,
              module,
              project: 'app-one',
              options: { flat: true },
            }),
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
  options,
}: {
  name: string;
  module: string;
  project: string;
  options?: any;
}): Rule {
  return externalSchematic('@schematics/angular', 'component', {
    name: name,
    ...(module && { module: `${module}` }),
    ...(project && { project }),
    ...(project && module && { path: `projects/${project}/src/app/${module}` }),
    ...options,
  });
}

function getPositiveNumber(input: string): number {
  const number = Math.abs(parseInt(input, 10));

  if (Number.isNaN(number)) {
    throw new Error(`${input} is not a valid number`);
  }

  return number;
}

export function generateIdentifiers(count: number, type: 'mod' | 'comp'): string[] {
  const incstr = strId.idGenerator({
    suffix: `-${type}`,
    numberlike: false,
    alphabet: 'abcdefghijklmnopqrstuvwxyz',
  });

  return Array.from(new Array(count), () => incstr());
}
