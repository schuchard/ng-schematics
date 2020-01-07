import { getWorkspaceTree } from './test-utils';
import test from 'ava';

import { determineProject } from './workspace';

test('determineProject: find a projects name', async (t) => {
  const tree = await getWorkspaceTree({ appName: 'testApp' });

  const { projectName } = await determineProject(tree);

  t.is(projectName, 'testApp');
});

test('determineProject: find a projects root', async (t) => {
  const tree = await getWorkspaceTree();

  const { projectRoot } = await determineProject(tree);

  t.is(projectRoot, 'projects/bar');
});

test('determineProject: find a projects source root', async (t) => {
  const tree = await getWorkspaceTree();

  const { projectSourceRoot } = await determineProject(tree);

  t.is(projectSourceRoot, 'projects/bar/src');
});

test('determineProject: find a projects angular.json value', async (t) => {
  const tree = await getWorkspaceTree();

  const { projectConfig } = await determineProject(tree);

  t.assert(projectConfig.architect);
  t.is(projectConfig.prefix, 'app');
  t.is(projectConfig.root, 'projects/bar');
});

test("determineProject: find the tree's angular.json value", async (t) => {
  const tree = await getWorkspaceTree();

  const { angularConfig } = await determineProject(tree);

  t.assert(angularConfig.projects);
  t.is(angularConfig.defaultProject, 'bar');
  t.is(angularConfig.newProjectRoot, 'projects');
});
