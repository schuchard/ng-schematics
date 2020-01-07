import { getWorkspaceTree } from './test-utils';
import test from 'ava';

import { getWorkspaceConfig } from './workspace';

test('find a projects name', async (t) => {
  const tree = await getWorkspaceTree({ appName: 'testApp' });

  const { projectName } = await getWorkspaceConfig(tree);

  t.is(projectName, 'testApp');
});

test('find a projects root', async (t) => {
  const tree = await getWorkspaceTree();

  const { projectRoot } = await getWorkspaceConfig(tree);

  t.is(projectRoot, 'projects/bar');
});

test('find a projects source root', async (t) => {
  const tree = await getWorkspaceTree();

  const { projectSourceRoot } = await getWorkspaceConfig(tree);

  t.is(projectSourceRoot, 'projects/bar/src');
});

test('find a projects angular.json value', async (t) => {
  const tree = await getWorkspaceTree();

  const { projectConfig } = await getWorkspaceConfig(tree);

  t.assert(projectConfig.architect);
  t.is(projectConfig.prefix, 'app');
  t.is(projectConfig.root, 'projects/bar');
});

test("find the tree's angular.json value", async (t) => {
  const tree = await getWorkspaceTree();

  const { angularConfig } = await getWorkspaceConfig(tree);

  t.assert(angularConfig.projects);
  t.is(angularConfig.defaultProject, 'bar');
  t.is(angularConfig.newProjectRoot, 'projects');
});
