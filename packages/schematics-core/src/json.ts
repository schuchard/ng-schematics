import { Tree, SchematicsException, SchematicContext, Rule } from '@angular-devkit/schematics';
import { parseJsonAst, JsonParseMode, JsonObject } from '@angular-devkit/core';
import { PkgJson, NodeDependencyType, getLatestNodeVersion, NodePackage } from './npm';
import * as stripJsonComments from 'strip-json-comments';
import { isArray, mergeWith } from 'lodash';
import { of, Observable } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

export interface PackageJsonDep {
  name: string;
  version?: string;
}

/**
 * Serialize JSON.
 */
export function serializeJson(json: any): string {
  return `${JSON.stringify(json, null, 2)}\n`;
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

/**
 * Read a JSON file.
 */
export function readJsonInTree<T = any>(host: Tree, path: string): T {
  if (!host.exists(path)) {
    throw new Error(`Cannot find ${path}`);
  }
  const contents = stripJsonComments(host.read(path)!.toString('utf-8'));
  try {
    return JSON.parse(contents);
  } catch (e) {
    throw new Error(`Cannot parse ${path}: ${e.message}`);
  }
}

/**
 * This method is specifically for updating JSON in a Tree
 * @param path Path of JSON file in the Tree
 * @param callback Manipulation of the JSON data
 * @returns A rule which updates a JSON file file in a Tree
 */
export function updateJsonInTree<T = any, O = T>(
  path: string,
  callback: (json: T, context: SchematicContext) => O
): Rule {
  return (host: Tree, context: SchematicContext): Tree => {
    if (!host.exists(path)) {
      host.create(path, serializeJson(callback({} as T, context)));
      return host;
    }
    host.overwrite(path, serializeJson(callback(readJsonInTree(host, path), context)));
    return host;
  };
}

/**
 * Combine two JSON objects.
 * Recursively merges own and inherited enumerable string keyed properties of source objects into the destination object.
 */
export function mergeJson(jsonA: JsonObject, JsonB: JsonObject): JsonObject {
  return mergeWith(jsonA, JsonB, mergeCustomizer);
}

/**
 * Handle Arrays by concatenating source values to the destination.
 */
export function mergeCustomizer(objValue: JsonObject, srcValue: JsonObject): any[] | undefined {
  if (isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}

/**
 * Combine two JSON objects and update the tree.
 */
export function mergeJsonTree(
  tree: Tree,
  path: string,
  jsonA: JsonObject,
  JsonB: JsonObject
): Tree {
  const jsonString = JSON.stringify(mergeJson(jsonA, JsonB), null, 2);

  tree.overwrite(path, jsonString);

  return tree;
}

/**
 * Update the package.json with a mergeObject that defines the differences.
 */
export function mergePackageJson(tree: Tree, mergeObject: JsonObject, path = PkgJson.Path): Tree {
  return mergeJsonTree(tree, path, parseJsonAtPath(tree, path), mergeObject);
}

/**
 * Add a package json dependency (dev, devDep) setting version as the from npm.
 */
export function addPackageJsonDep(
  tree: Tree,
  type: NodeDependencyType,
  deps: PackageJsonDep[],
  path = PkgJson.Path,
  context?: SchematicContext
): Observable<Tree> {
  return of(...deps).pipe(
    concatMap((pkg) => (pkg.version ? of(pkg) : getLatestNodeVersion(pkg.name))),
    map((packageFromRegistry: NodePackage) => {
      const { name, version } = packageFromRegistry;
      if (context) {
        context.logger.debug(`Adding ${name}:${version} to ${type}`);
      }

      return mergePackageJson(tree, { [type]: { [name]: version } }, path);
    })
  );
}
