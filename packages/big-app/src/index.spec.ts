import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import test from 'ava';
import { JsonObject } from '@angular-devkit/core';
import { generateNames } from './index';

test('scaffolds the base files', async (t) => {
  const { files } = await runSchematic({ modules: '3', components: '3' });

  // console.log(files);

  t.assert(files.includes('/angular.json'));
  t.assert(files.includes('/projects/app-one/src/app/app.module.ts'));
  t.assert(files.includes('/projects/app-two/src/app/app.module.ts'));
  t.assert(files.includes('/projects/lib-one/src/lib/lib-one.module.ts'));
});

async function runSchematic(options: JsonObject = {}, command = 'ng-add'): Promise<UnitTestTree> {
  const schematicRunner = new SchematicTestRunner('big-app', require.resolve('../collection.json'));

  return await schematicRunner.runSchematicAsync(command, options).toPromise();
}

test('generate names should create unique ids a-mod', (t) => {
  t.is(generateNames(100, 'mod')[0], 'a-mod');
});

test('generate names should create unique ids z-mod', (t) => {
  t.is(generateNames(100, 'mod')[25], 'z-mod');
});

test('generate names should create unique ids aa-mod', (t) => {
  t.is(generateNames(100, 'mod')[26], 'aa-mod');
});

test('generate names should create unique ids af-mod', (t) => {
  t.is(generateNames(100, 'mod')[52], 'ba-mod');
});
