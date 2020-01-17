import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import test from 'ava';
import { JsonObject } from '@angular-devkit/core';

test('run test', async (t) => {
  const { files } = await runSchematic();
  console.log(files);
  t.fail();
});

// async function getWorkspaceTree(appName = 'bar') {
//   const ngRunner = new SchematicTestRunner('@schematics/angular', '');

//   const workspaceOptions = {
//     name: 'workspace',
//     newProjectRoot: 'projects',
//     version: '6.0.0',
//     defaultProject: appName,
//   };

//   const appOptions = {
//     name: appName,
//     inlineTemplate: false,
//     routing: false,
//     skipTests: false,
//     skipPackageJson: false,
//   };

//   let appTree = await ngRunner.runSchematicAsync('workspace', workspaceOptions).toPromise();
//   appTree = await ngRunner.runSchematicAsync('application', appOptions, appTree).toPromise();

//   return appTree;
// }

// async function getApplicationTree() {
//   const schematicRunner = new SchematicTestRunner('@schematics/angular', '');
//   const defaultOptions = {
//     name: 'foo',
//     directory: 'bar',
//     version: '6.0.0',
//   };
//   return await schematicRunner.runSchematicAsync('ng-new', defaultOptions).toPromise();
// }

async function runSchematic(options: JsonObject = {}, command = 'ng-add'): Promise<UnitTestTree> {
  const schematicRunner = new SchematicTestRunner('big-app', require.resolve('../collection.json'));

  return await schematicRunner.runSchematicAsync(command, options).toPromise();
}
