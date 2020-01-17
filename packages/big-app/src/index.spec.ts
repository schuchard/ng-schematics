import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import test from 'ava';
import { JsonObject } from '@angular-devkit/core';

test('scaffolds the base files', async (t) => {
  const { files } = await runSchematic();

  console.log(files);

  t.assert(files.includes('/angular.json'));
  t.assert(files.includes('/projects/app-one/src/app/app.module.ts'));
  t.assert(files.includes('/projects/app-two/src/app/app.module.ts'));
  t.assert(files.includes('/projects/lib-one/src/lib/lib-one.module.ts'));
});

async function runSchematic(options: JsonObject = {}, command = 'ng-add'): Promise<UnitTestTree> {
  const schematicRunner = new SchematicTestRunner('big-app', require.resolve('../collection.json'));

  return await schematicRunner.runSchematicAsync(command, options).toPromise();
}
