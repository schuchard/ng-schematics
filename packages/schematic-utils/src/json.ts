import { Tree, SchematicsException, SchematicContext } from '@angular-devkit/schematics';
import { parseJsonAst, JsonParseMode, JsonObject } from '@angular-devkit/core';
import { PkgJson, NodeDependencyType, getLatestNodeVersion, NodePackage } from './npm';
import { isArray, mergeWith } from 'lodash';
import { of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

export function mergePackageJson(tree: Tree, mergeObject: JsonObject, path = PkgJson.Path): Tree {
  return mergeJsonTree(tree, path, parseJsonAtPath(tree, path), mergeObject);
}

export function parseJsonAtPath(tree: Tree, path: string): JsonObject {
  const buffer = tree.read(path);

  if (buffer === null) {
    throw new SchematicsException(`Could not JSON at ${path}`);
  }

  const content = buffer.toString();

  const json = parseJsonAst(content, JsonParseMode.Strict);

  if (json.kind != 'object') {
    throw new SchematicsException('Invalid json. Was expecting an object');
  }

  return json.value;
}

export function mergeJson(jsonA: JsonObject, JsonB: JsonObject) {
  return mergeWith(jsonA, JsonB, mergeCustomizer);
}

export function mergeCustomizer(objValue: JsonObject, srcValue: JsonObject) {
  if (isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}

// merge two objects at a given path and update the tree. One of the objects can be just the delta (lodash mergeWith)
export function mergeJsonTree(tree: Tree, path: string, jsonA: JsonObject, JsonB: JsonObject) {
  const jsonString = JSON.stringify(mergeJson(jsonA, JsonB), null, 2);

  tree.overwrite(path, jsonString);

  return tree;
}

export function addPackageJsonDep(
  tree: Tree,
  type: NodeDependencyType,
  deps: string[],
  path = PkgJson.Path,
  context?: SchematicContext
) {
  return of(...deps).pipe(
    concatMap((packageName: string) => getLatestNodeVersion(packageName)),
    map((packageFromRegistry: NodePackage) => {
      const { name, version } = packageFromRegistry;
      if (context) {
        context.logger.debug(`Adding ${name}:${version} to ${NodeDependencyType.Dev}`);
      }

      return mergePackageJson(tree, { [type]: { [name]: version } }, path);
    })
  );
}
