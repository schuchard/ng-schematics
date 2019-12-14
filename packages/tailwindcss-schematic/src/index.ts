import {
  apply,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  addPackageJsonDep,
  determineProject,
  filterExistingPath,
  mergeJsonTree,
  NodeDependencyType,
  parseJsonAtPath,
  parsePath,
  applyLintFix,
} from '@schuchard/schematics-core';
import { concat, Observable } from 'rxjs';

export const enum Paths {
  WebpackConfig = 'webpack.config.js',
  TailwindConfig = 'tailwind.config.js',
}

interface SchematicOptions {
  project: string;
  webpackConfigPath: string;
  projectRoot: string;
  projectSourceRoot: string;
}

export function tailwindSchematic(options: SchematicOptions): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    const { workspace } = await determineProject(tree, options.project);
    options = { ...options, ...workspace };

    return chain([
      updateDependencies(),
      updateAngularJson(options),
      addFiles(options),
      applyLintFix(),
    ]);
  };
}

function updateDependencies(): Rule {
  return (tree: Tree, context: SchematicContext): Observable<Tree> => {
    context.logger.debug('Updating dependencies...');
    context.addTask(new NodePackageInstallTask());

    return concat(
      addPackageJsonDep(tree, NodeDependencyType.Default, [{ name: 'tailwindcss' }]),
      addPackageJsonDep(tree, NodeDependencyType.Dev, [
        { name: '@angular-builders/custom-webpack' },
        { name: '@fullhuman/postcss-purgecss' },
      ])
    );
  };
}

function updateAngularJson(options: SchematicOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const angularJson = parseJsonAtPath(tree, './angular.json') as any;
    const { project, projectSourceRoot } = options;
    const stylesheetPath = parsePath(`${projectSourceRoot}/tailwind.scss`).path;
    const webpackConfig = {
      customWebpackConfig: {
        path: Paths.WebpackConfig,
      },
    };
    const builder = '@angular-builders/custom-webpack';

    const updates = {
      projects: {
        [project]: {
          architect: {
            build: {
              builder: `${builder}:browser`,
              options: {
                ...webpackConfig,
                styles: [stylesheetPath],
              },
            },
            serve: {
              builder: `${builder}:dev-server`,
              options: {
                ...webpackConfig,
              },
            },
          },
        },
      },
    };

    return mergeJsonTree(tree, './angular.json', angularJson, updates);
  };
}

function addFiles(options: SchematicOptions): Rule {
  return (tree: Tree) => {
    return chain([
      mergeWith(
        apply(url('./files/root'), [
          filterExistingPath(tree, Paths.WebpackConfig),
          filterExistingPath(tree, Paths.TailwindConfig),
          move('./'),
        ])
      ),
      mergeWith(apply(url('./files/project'), [move(options.projectSourceRoot)])),
    ]);
  };
}
