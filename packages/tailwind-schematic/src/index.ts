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
} from '@schuchard/schematic-utils';
import { concat, Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

interface SchematicOptions {
  project: string;
  inlineStyles: boolean;
}

export function tailwindSchematic(_options: SchematicOptions): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    const f = await getProject(tree, _options);
    console.log('f ->', JSON.stringify(f, null, 2));

    return chain([updateDependencies()]);
  };
}

async function getProject(tree: Tree, _options: SchematicOptions): Promise<ProjectDefinition> {
  const workspace = await getWorkspace(tree);
  const targetProject: string = _options.project || (workspace.extensions.defaultProject as string);
  const project = workspace.projects.get(targetProject);

  console.log('targetProject -> ', targetProject);
  console.log('workspace ->', JSON.stringify(workspace, null, 2));

  if (project === undefined) {
    throw new Error('No project found in workspace');
  }

  return project;
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

    return concat(addDependencies);
  };
}
