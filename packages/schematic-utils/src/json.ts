import { Tree, SchematicsException } from '@angular-devkit/schematics';
import { JsonAstObject, parseJsonAst, JsonParseMode, JsonValue } from '@angular-devkit/core';
import { merge } from 'lodash';
import { PkgJson } from './npm';

export function mergePackageJson(
  tree: Tree,
  mergeObject: JsonValue,
  path = PkgJson.Path
): JsonValue {
  const pj = parseJsonAtPath(tree, path);

  return merge(pj, mergeObject);
}

// export function addPropertyToPackageJson(
//   tree: Tree,
//   context: SchematicContext,
//   propertyName: string,
//   propertyValue: { [key: string]: any }
// ) {
//   const packageJsonAst = parseJsonAtPath(tree, pkgJson.Path);
//   const pkgNode = findPropertyInAstObject(packageJsonAst, propertyName);
//   const recorder = tree.beginUpdate(pkgJson.Path);

//   if (!pkgNode) {
//     // outer node missing, add key/value
//     appendPropertyInAstObject(
//       recorder,
//       packageJsonAst,
//       propertyName,
//       propertyValue,
//       Configs.JsonIndentLevel
//     );
//   } else if (pkgNode.kind === 'object') {
//     // property exists, update values
//     for (let [key, value] of Object.entries(propertyValue)) {
//       const innerNode = findPropertyInAstObject(pkgNode, key);

//       if (!innerNode) {
//         // script not found, add it
//         context.logger.debug(`creating ${key} with ${value}`);

//         insertPropertyInAstObjectInOrder(recorder, pkgNode, key, value, Configs.JsonIndentLevel);
//       } else {
//         // script found, overwrite value
//         context.logger.debug(`overwriting ${key} with ${value}`);

//         const { end, start } = innerNode;

//         recorder.remove(start.offset, end.offset - start.offset);
//         recorder.insertRight(start.offset, JSON.stringify(value));
//       }
//     }
//   }

//   tree.commitUpdate(recorder);
// }

export function parseJsonAtPath(tree: Tree, path: string): JsonAstObject {
  const buffer = tree.read(path);

  if (buffer === null) {
    throw new SchematicsException('Could not read package.json.');
  }

  const content = buffer.toString();

  const json = parseJsonAst(content, JsonParseMode.Strict);
  if (json.kind != 'object') {
    throw new SchematicsException('Invalid package.json. Was expecting an object');
  }

  return json;
}

// export function appendPropertyInAstObject(
//   recorder: UpdateRecorder,
//   node: JsonAstObject,
//   propertyName: string,
//   value: JsonValue,
//   indent: number
// ) {
//   const indentStr = _buildIndent(indent);

//   if (node.properties.length > 0) {
//     // Insert comma.
//     const last = node.properties[node.properties.length - 1];
//     recorder.insertRight(last.start.offset + last.text.replace(/\s+$/, '').length, ',');
//   }

//   recorder.insertLeft(
//     node.end.offset - 1,
//     '  ' +
//       `"${propertyName}": ${JSON.stringify(value, null, 2).replace(/\n/g, indentStr)}` +
//       indentStr.slice(0, -2)
//   );
// }
