import { JsonObject, normalize } from '@angular-devkit/core';
import { ProjectDefinition } from '@angular-devkit/core/src/workspace';
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
  getLatestNodeVersion,
  getWorkspace,
  mergePackageJson,
  NodeDependencyType,
  NodePackage,
  parsePath,
  parseJsonAtPath,
  PkgJson,
} from '@schuchard/schematic-utils';
import { isArray, mergeWith as mergeWithLodash } from 'lodash';
import { concat, Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

const enum Paths {
  WebpackConfig = 'webpack-config.js',
}

interface SchematicOptions {
  project: string;
  webpackConfigPath: string;
  projectRoot: string;
  projectSourceRoot: string;
  inlineStyles: boolean;
}

export function tailwindSchematic(options: SchematicOptions): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    await determineProject(tree, options);

    return chain([updateDependencies(), updateAngularJson(options), addFiles(options)]);
  };
}

async function determineProject(
  tree: Tree,
  options: SchematicOptions
): Promise<{ project: ProjectDefinition }> {
  const workspace = await getWorkspace(tree);

  const projectName: string = options.project || (workspace.extensions.defaultProject as string);
  const project = workspace.projects.get(projectName);

  if (project === undefined) {
    throw new Error('No project found in workspace');
  }
  // update with project metadata
  options.project = projectName;
  options.projectRoot = parsePath(project.root).path;
  options.projectSourceRoot = parsePath(project.sourceRoot || '').path;

  return { project };
}

function updateDependencies(): Rule {
  return (tree: Tree, context: SchematicContext): Observable<Tree> => {
    context.logger.debug('Updating dependencies...');
    context.addTask(new NodePackageInstallTask());

    const addDependencies = of('tailwindcss').pipe(
      concatMap((packageName: string) => getLatestNodeVersion(packageName)),
      map((packageFromRegistry: NodePackage) => {
        const { name, version } = packageFromRegistry;
        context.logger.debug(`Adding ${name}:${version} to ${NodeDependencyType.Dev}`);

        tree.overwrite(
          PkgJson.Path,
          JSON.stringify(
            mergePackageJson(tree, { [NodeDependencyType.Default]: { [name]: version } }),
            null,
            2
          )
        );
        return tree;
      })
    );

    const addDevDependencies = of(
      '@angular-builders/custom-webpack',
      '@fullhuman/postcss-purgecss'
    ).pipe(
      concatMap((packageName: string) => getLatestNodeVersion(packageName)),
      map((packageFromRegistry: NodePackage) => {
        const { name, version } = packageFromRegistry;
        context.logger.debug(`Adding ${name}:${version} to ${NodeDependencyType.Dev}`);

        tree.overwrite(
          PkgJson.Path,
          JSON.stringify(
            mergePackageJson(tree, { [NodeDependencyType.Dev]: { [name]: version } }),
            null,
            2
          )
        );
        return tree;
      })
    );

    return concat(addDependencies, addDevDependencies);
  };
}

function updateAngularJson(options: SchematicOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const angularJson = parseJsonAtPath(tree, './angular.json') as any;
    const { project, projectRoot } = options;
    const stylesheetPath = normalize(`${projectRoot}/src/tailwind.scss`);
    const webpackConfig = {
      customWebpackConfig: {
        path: Paths.WebpackConfig,
      },
    };

    const updates = {
      projects: {
        [project]: {
          architect: {
            build: {
              builder: '@angular-builders/custom-webpack:browser',
              options: {
                ...webpackConfig,
                styles: [stylesheetPath],
              },
            },
            serve: {
              builder: '@angular-builders/custom-webpack:dev-server',
              options: {
                ...webpackConfig,
              },
            },
          },
        },
      },
    };

    tree.overwrite(
      './angular.json',
      JSON.stringify(mergeWithLodash(angularJson, updates, mergeCustomizer), null, 2)
    );
    return tree;
  };
}

function mergeCustomizer(objValue: JsonObject, srcValue: JsonObject) {
  if (isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}

function addFiles(options: SchematicOptions): Rule {
  return () => {
    return chain([
      mergeWith(apply(url('./files/root'), [move('./')])),
      mergeWith(apply(url('./files/project'), [move(options.projectSourceRoot)])),
    ]);
  };
}
