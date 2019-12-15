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
  TailwindStyles = 'tailwind.scss',
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
    const stylesheetPath = parsePath(`${projectSourceRoot}/${Paths.TailwindStyles}`).path;
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
  return (tree: Tree, context: SchematicContext) => {
    return chain([
      mergeWith(
        apply(url('./files/root'), [
          filterExistingPath(tree, Paths.WebpackConfig, context),
          filterExistingPath(tree, Paths.TailwindConfig, context),
          move('./'),
        ])
      ),
      mergeWith(
        apply(url('./files/project'), [
          filterExistingPath(tree, `${options.projectSourceRoot}/${Paths.TailwindStyles}`, context),
          move(options.projectSourceRoot),
        ])
      ),
    ]);
  };
}
