import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import test from 'ava';

const schematicRunner = new SchematicTestRunner(
  '@schuchard/tailwind-schematic',
  require.resolve('../collection.json')
);

test("run against the default project if one isn't provided", async (t) => {
  const { files } = await runSchematic();

  // console.log('workspace ->', JSON.stringify(files, null, 2));
  t.assert(files.includes('/projects/bar/src/main.ts'));
});

test('run against a specific project', async (t) => {
  const { files } = await getApplicationTree();

  t.assert(files.includes('/bar/src/main.ts'));
});

test.todo('add package.json dependencies');
test.todo('add package.json devDependencies');

test.todo('should update angular.json with custom-webpack builder config');

test('add the webpack config to the root', async (t) => {
  const { files } = await runSchematic();

  t.assert(files.includes('/tailwind.config.js'));
});

test('add the tailwind config to the root', async (t) => {
  const { files } = await runSchematic();

  t.assert(files.includes('/webpack-config.js'));
});

test.todo("don't add the webpack config if it already exists");
test.todo("don't add the tailwind config if it already exists");

test.todo('add project specific tailwind.scss file');

async function getWorkspaceTree(appName = 'bar') {
  const ngRunner = new SchematicTestRunner('@schematics/angular', '');

  const workspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '6.0.0',
  };

  const appOptions = {
    name: appName,
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    skipTests: false,
    skipPackageJson: false,
  };

  let appTree = await ngRunner.runSchematicAsync('workspace', workspaceOptions).toPromise();
  appTree = await ngRunner.runSchematicAsync('application', appOptions, appTree).toPromise();

  return appTree;
}

async function getApplicationTree() {
  const schematicRunner = new SchematicTestRunner('@schematics/angular', '');
  const defaultOptions = {
    name: 'foo',
    directory: 'bar',
    version: '6.0.0',
  };
  return await schematicRunner.runSchematicAsync('ng-new', defaultOptions).toPromise();
}

async function runSchematic(options = {}, command = 'ng-add') {
  return await schematicRunner
    .runSchematicAsync(command, options, await getWorkspaceTree())
    .toPromise();
}
