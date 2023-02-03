import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { JsonObject } from '@angular-devkit/core';

export async function getWorkspaceTree(opt?: {
  appName?: string;
  workspaceOptions?: Record<string, any>;
  appOptions?: Record<string, any>;
}): Promise<UnitTestTree> {
  const ngRunner = new SchematicTestRunner('@schematics/angular', '');

  const workspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '8.0.0',
    defaultProject: opt?.appName || 'bar',
    ...opt?.workspaceOptions,
  };

  const appOptions = {
    name: opt?.appName || 'bar',
    inlineTemplate: false,
    routing: false,
    skipTests: false,
    skipPackageJson: false,
    ...opt?.appOptions,
  };

  let appTree = await ngRunner.runSchematicAsync('workspace', workspaceOptions).toPromise();
  appTree = await ngRunner.runSchematicAsync('application', appOptions, appTree).toPromise();

  return appTree;
}

export async function getApplicationTree(opt?: {
  appOptions?: Record<string, any>;
  command?: string;
}): Promise<UnitTestTree> {
  const schematicRunner = new SchematicTestRunner('@schematics/angular', '');
  const defaultOptions = {
    name: 'foo',
    directory: 'bar',
    version: '6.0.0',
    ...opt?.appOptions,
  };
  return await schematicRunner
    .runSchematicAsync(opt?.command || 'ng-new', defaultOptions)
    .toPromise();
}

export async function runSchematic(opt?: {
  schematicOptions: JsonObject;
  name: string;
  command?: string;
  tree?: UnitTestTree;
  collectionPath?: string;
}): Promise<UnitTestTree> {
  const schematicRunner = new SchematicTestRunner(
    name,
    require.resolve(opt?.collectionPath || '../collection.json')
  );

  return await schematicRunner
    .runSchematicAsync(
      opt?.command || 'ng-add',
      opt?.schematicOptions,
      opt?.tree || (await getWorkspaceTree())
    )
    .toPromise();
}
