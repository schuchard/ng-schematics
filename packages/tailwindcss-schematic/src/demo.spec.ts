import test from 'ava';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { JsonObject } from '@angular-devkit/core';

const demoAssert = '<div class="font-sans bg-gray-200 flex flex-col min-h-screen w-full">';

test('add demo markup to default html', async (t) => {
  const tree = await runSchematic();
  const path = '/projects/bar/src/app/app.component.html';

  t.assert(tree.files.includes(path));
  t.assert(tree.readContent(path).includes(demoAssert));
});

test('add demo markup at specific path', async (t) => {
  const path = '/projects/bar/src/app/testDir/test.html';
  let tree = await getWorkspaceTree();

  tree.create(path, 'some html');

  const schematicTree = await runSchematic({ path }, 'demo', tree);

  t.assert(schematicTree.files.includes(path));
  t.assert(tree.readContent(path).includes(demoAssert));
});

async function getWorkspaceTree(appName = 'bar') {
  const ngRunner = new SchematicTestRunner('@schematics/angular', '');

  const workspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '6.0.0',
    defaultProject: appName,
  };

  const appOptions = {
    name: appName,
    inlineTemplate: false,
    routing: false,
    skipTests: false,
    skipPackageJson: false,
  };

  let appTree = await ngRunner.runSchematicAsync('workspace', workspaceOptions).toPromise();
  appTree = await ngRunner.runSchematicAsync('application', appOptions, appTree).toPromise();

  return appTree;
}

async function runSchematic(
  options: JsonObject = { path: '' },
  command = 'demo',
  tree?: UnitTestTree
) {
  const schematicRunner = new SchematicTestRunner(
    'tailwindcss-schematic',
    require.resolve('../collection.json')
  );

  return await schematicRunner
    .runSchematicAsync(command, options, tree || (await getWorkspaceTree()))
    .toPromise();
}
