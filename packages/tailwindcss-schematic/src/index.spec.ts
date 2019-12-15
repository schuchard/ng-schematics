import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import test from 'ava';
import { JsonObject } from '@angular-devkit/core';
import { Paths } from './index';
const webpackConfigPath = `/${Paths.WebpackConfig}`;
const tailwindConfigPath = `/${Paths.TailwindConfig}`;
const tailwindStylesPath = `/${Paths.TailwindStyles}`;
const angularBuilder = '@angular-builders/custom-webpack';

test("run against the default project if one isn't provided", async (t) => {
  const { files } = await runSchematic();

  t.assert(files.includes('/projects/bar/src/main.ts'));
});

test('run against a specific project', async (t) => {
  const { files } = await getApplicationTree();

  t.assert(files.includes('/bar/src/main.ts'));
});

test('add package.json dependencies', async (t) => {
  const tree = await runSchematic();

  const pkgJson = JSON.parse(tree.readContent('/package.json'));

  t.assert(pkgJson.dependencies.tailwindcss);
});

test('add package.json devDependencies', async (t) => {
  const tree = await runSchematic();

  const pkgJson = JSON.parse(tree.readContent('/package.json'));

  t.assert(pkgJson.devDependencies[angularBuilder]);
  t.assert(pkgJson.devDependencies['@fullhuman/postcss-purgecss']);
});

test('should update angular.json with custom-webpack builder config', async (t) => {
  const tree = await runSchematic();

  const ng = JSON.parse(tree.readContent('/angular.json'));

  t.is(`${angularBuilder}:browser`, ng.projects.bar.architect.build.builder);
  t.is(`${angularBuilder}:dev-server`, ng.projects.bar.architect.serve.builder);
  t.deepEqual(
    {
      path: webpackConfigPath.slice(1),
    },
    ng.projects.bar.architect.build.options.customWebpackConfig
  );
  t.deepEqual(
    {
      path: webpackConfigPath.slice(1),
    },
    ng.projects.bar.architect.serve.options.customWebpackConfig
  );
  t.deepEqual(
    ['projects/bar/src/styles.css', 'projects/bar/src/tailwind.scss'],
    ng.projects.bar.architect.build.options.styles
  );
});

test('add the webpack config to the root', async (t) => {
  const { files } = await runSchematic();

  t.assert(files.includes(tailwindConfigPath));
});

test('add the tailwind config to the root', async (t) => {
  const { files } = await runSchematic();

  t.assert(files.includes(webpackConfigPath));
});

test("don't add the webpack.config if it already exists", async (t) => {
  const webpackAssert = 'webpack config content';
  let tree = await getWorkspaceTree();

  tree.create(webpackConfigPath, webpackAssert);

  const schematicTree = await runSchematic({}, 'ng-add', tree);

  t.is(webpackAssert, schematicTree.readContent(webpackConfigPath));
  t.assert(tree.files.includes(webpackConfigPath));

  // assert the actual file contents are present
  t.assert(schematicTree.readContent(tailwindConfigPath).startsWith('module.exports'));
  t.assert(tree.files.includes(tailwindConfigPath));
});

test("don't add the tailwind.config if it already exists", async (t) => {
  const tailwindAssert = 'tailwind css content';
  let tree = await getWorkspaceTree();

  tree.create(tailwindConfigPath, tailwindAssert);

  const schematicTree = await runSchematic({}, 'ng-add', tree);

  t.is(tailwindAssert, schematicTree.readContent(tailwindConfigPath));
  t.assert(tree.files.includes(tailwindConfigPath));

  // assert the actual file contents are present
  t.assert(schematicTree.readContent(webpackConfigPath).startsWith('const purgecss'));
  t.assert(tree.files.includes(webpackConfigPath));
});

test("don't add the tailwind.scss if it already exists", async (t) => {
  const tailwindAssert = 'tailwind.scss content';
  const workspaceTailwindStylePath = `/projects/bar/src${tailwindStylesPath}`;
  let tree = await getWorkspaceTree();

  tree.create(workspaceTailwindStylePath, tailwindAssert);

  const schematicTree = await runSchematic({}, 'ng-add', tree);

  t.is(tailwindAssert, schematicTree.readContent(workspaceTailwindStylePath));
  t.assert(tree.files.includes(workspaceTailwindStylePath));
});

test('add project specific tailwind.scss file', async (t) => {
  const { files } = await runSchematic();

  t.assert(files.includes('/projects/bar/src/tailwind.scss'));
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

async function getApplicationTree() {
  const schematicRunner = new SchematicTestRunner('@schematics/angular', '');
  const defaultOptions = {
    name: 'foo',
    directory: 'bar',
    version: '6.0.0',
  };
  return await schematicRunner.runSchematicAsync('ng-new', defaultOptions).toPromise();
}

async function runSchematic(options: JsonObject = {}, command = 'ng-add', tree?: UnitTestTree) {
  const schematicRunner = new SchematicTestRunner(
    'tailwindcss-schematic',
    require.resolve('../collection.json')
  );

  return await schematicRunner
    .runSchematicAsync(command, options, tree || (await getWorkspaceTree()))
    .toPromise();
}
