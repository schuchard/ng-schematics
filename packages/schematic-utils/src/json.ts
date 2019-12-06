import { Tree, SchematicsException } from '@angular-devkit/schematics';
import { parseJsonAst, JsonParseMode, JsonValue, JsonObject } from '@angular-devkit/core';
import { merge } from 'lodash';
import { PkgJson } from './npm';

export function mergePackageJson(
  tree: Tree,
  mergeObject: JsonValue,
  path = PkgJson.Path
): JsonValue {
  return merge(parseJsonAtPath(tree, path), mergeObject);
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
