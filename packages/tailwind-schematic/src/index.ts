import { Rule, SchematicContext, Tree, SchematicsException } from '@angular-devkit/schematics';
import { Observable, from, forkJoin, of, concat } from 'rxjs';
import { catchError, map, concatMap } from 'rxjs/operators';
import { ProjectDefinition } from '@angular-devkit/core/src/workspace';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import {
  getWorkspace,
  getLatestNodeVersion,
  NodePackage,
  NodeDependencyType,
  PkgJson,
  mergePackageJson,
} from '@schuchard/schematic-utils';

interface SchematicOptions {
  project: string;
  inlineStyles: boolean;
}

export function tailwindSchematic(_options: SchematicOptions): Rule {
  return (tree: Tree, _context: SchematicContext): Observable<Tree> => {
    return forkJoin(from(getProject(tree, _options)), updateDependencies()).pipe(
      catchError((err) => {
        throw new SchematicsException(err);
      }),
      map(() => {
        return tree;
      })
    );
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
