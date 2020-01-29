import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import test from 'ava';
import { JsonObject } from '@angular-devkit/core';
import { generateIdentifiers, getPositiveNumber } from './index';

test('scaffolds the base files', async (t) => {
  const { files } = await runSchematic({ modules: '3', components: '4' });

  t.assert(files.includes('/angular.json'));
  t.assert(files.includes('/projects/app-one/src/app/app.module.ts'));
  t.assert(files.includes('/projects/app-two/src/app/app.module.ts'));
  t.assert(files.includes('/projects/lib-one/src/lib/lib-one.module.ts'));
});

test('adds each module', async (t) => {
  t.plan(9);

  const { files } = await runSchematic({ modules: '3', components: '4' });

  ['a', 'b', 'c'].forEach((mod) => testModuleFiles(mod));

  function testModuleFiles(mod: string) {
    t.assert(files.includes(`/projects/app-one/src/app/${mod}-mod/${mod}-mod-routing.module.ts`));
    t.assert(files.includes(`/projects/app-one/src/app/${mod}-mod/${mod}-mod.module.ts`));
    t.assert(files.includes(`/projects/app-one/src/app/${mod}-mod/${mod}-mod.component.ts`));
  }
});

test('adds components to each module', async (t) => {
  t.plan(12);

  const { files } = await runSchematic({ modules: '3', components: '4' });

  ['a', 'b', 'c'].forEach((mod) => {
    ['a', 'b', 'c', 'd'].forEach((comp) => hasComponentFile(mod, comp));
  });

  function hasComponentFile(mod: string, comp: string) {
    t.assert(
      files.includes(
        `/projects/app-one/src/app/${mod}-mod/${mod}-mod-${comp}-comp/${mod}-mod-${comp}-comp.component.ts`
      )
    );
  }
});

test('generate names should create unique ids a-mod', (t) => {
  t.is(generateIdentifiers(100, 'mod')[0], 'a-mod');
});

test('generate names should create unique ids z-mod', (t) => {
  t.is(generateIdentifiers(100, 'mod')[25], 'z-mod');
});

test('generate names should create unique ids aa-mod', (t) => {
  t.is(generateIdentifiers(100, 'mod')[26], 'aa-mod');
});

test('generate names should create unique ids af-mod', (t) => {
  t.is(generateIdentifiers(100, 'mod')[52], 'ba-mod');
});

test('getPositiveNumber should convert a string to a positive number', (t) => {
  t.is(getPositiveNumber('-1'), 1);
  t.is(getPositiveNumber('0'), 0);
  t.is(getPositiveNumber('1'), 1);
});

async function runSchematic(options: JsonObject = {}, command = 'ng-add'): Promise<UnitTestTree> {
  const schematicRunner = new SchematicTestRunner('big-app', require.resolve('../collection.json'));

  return await schematicRunner.runSchematicAsync(command, options).toPromise();
}
