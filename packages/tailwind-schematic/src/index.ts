import {
  Rule,
  SchematicContext,
  Tree,
  chain,
  SchematicsException,
} from '@angular-devkit/schematics';
import { getWorkspace } from './util';
import { Observable, from, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ProjectDefinition } from '@angular-devkit/core/src/workspace';

interface SchematicOptions {
  project: string;
  inlineStyles: boolean;
}

export function tailwindSchematic(_options: SchematicOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    return chain([configOptions(_options)])(tree, _context);
  };
}

function configOptions(_options: SchematicOptions): Rule {
  return (tree, _context): Observable<Tree> => {
    return forkJoin(from(getProject(tree, _options))).pipe(
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

  const project = workspace.projects.get(_options.project as string);
  console.log('workspace ->', JSON.stringify(workspace, null, 2));
  if (project === undefined) {
    throw new Error('No project found in workspace');
  }

  return project;
}
