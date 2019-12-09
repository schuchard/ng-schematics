import { Tree } from '@angular-devkit/schematics';
import { virtualFs, workspaces } from '@angular-devkit/core';
import { parsePath } from './path';
import { WorkspaceDefinition } from '@angular-devkit/core/src/workspace';

export interface ProjectOptions {
  project: string;
  projectRoot: string;
  projectSourceRoot: string;
}

function createHost(tree: Tree): workspaces.WorkspaceHost {
  return {
    async readFile(path: string): Promise<string> {
      const data = tree.read(path);
      if (!data) {
        throw new Error('File not found.');
      }

      return virtualFs.fileBufferToString(data);
    },
    async writeFile(path: string, data: string): Promise<void> {
      return tree.overwrite(path, data);
    },
    async isDirectory(path: string): Promise<boolean> {
      // approximate a directory check
      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;
    },
    async isFile(path: string): Promise<boolean> {
      return tree.exists(path);
    },
  };
}
export async function getWorkspace(tree: Tree, path = '/'): Promise<WorkspaceDefinition> {
  const host = createHost(tree);

  const { workspace } = await workspaces.readWorkspace(path, host);

  return workspace;
}

export async function determineProject(
  tree: Tree,
  projectName?: string
): Promise<{ workspace: ProjectOptions }> {
  const ws = await getWorkspace(tree);

  const name: string = projectName || (ws.extensions.defaultProject as string);
  const project = ws.projects.get(name);

  if (!name || project === undefined) {
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
