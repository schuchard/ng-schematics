import { ProjectDefinition } from '@angular-devkit/core/src/workspace';
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import {
  getLatestNodeVersion,
  getWorkspace,
  mergePackageJson,
  NodeDependencyType,
  NodePackage,
  PkgJson,
  parseJsonAtPath,
} from '@schuchard/schematic-utils';
import { concat, Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

interface SchematicOptions {
  project: string;
  inlineStyles: boolean;
}

export function tailwindSchematic(_options: SchematicOptions): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    await determineProject(tree, _options);

    return chain([updateDependencies(), updateAngularJson(_options)]);
  };
}

async function determineProject(
  tree: Tree,
  _options: SchematicOptions
): Promise<{ project: ProjectDefinition; targetProject: string }> {
  const workspace = await getWorkspace(tree);

  const targetProject: string = _options.project || (workspace.extensions.defaultProject as string);
  const project = workspace.projects.get(targetProject);

  if (project === undefined) {
    throw new Error('No project found in workspace');
  }

  _options.project = targetProject;

  return { project, targetProject };
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

function updateAngularJson(_options: SchematicOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    // todo determine the angular.json path
    const angularJson = parseJsonAtPath(tree, './angular.json');
    console.log('angularJson ->', JSON.stringify(angularJson, null, 2));
    return tree;
  };
}
