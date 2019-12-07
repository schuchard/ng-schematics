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
  getWorkspace,
  mergeJsonTree,
  NodeDependencyType,
  parseJsonAtPath,
  parsePath,
  addPackageJsonDep,
} from '@schuchard/schematic-utils';
import { concat, Observable } from 'rxjs';

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
  return () => {
    return chain([
      mergeWith(apply(url('./files/root'), [move('./')])),
      mergeWith(apply(url('./files/project'), [move(options.projectSourceRoot)])),
    ]);
  };
}
