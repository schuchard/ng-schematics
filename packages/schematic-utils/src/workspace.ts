import { Tree } from '@angular-devkit/schematics/src/tree/interface';
import { getWorkspace } from './util';
import { parsePath } from './path';

export interface ProjectOptions {
  project: string;
  projectRoot: string;
  projectSourceRoot: string;
}

export async function determineProject(
  tree: Tree,
  projectName?: string
): Promise<{ workspace: ProjectOptions }> {
  const ws = await getWorkspace(tree);

  const name: string = projectName || (ws.extensions.defaultProject as string);
  const project = ws.projects.get(name);

  if (project === undefined) {
    throw new Error('No project found in workspace');
  }
  // update with project metadata
  const workspace = {
    project: name,
    projectRoot: parsePath(project.root).path,
    projectSourceRoot: parsePath(project.sourceRoot || '').path,
  };

  return { workspace };
}
