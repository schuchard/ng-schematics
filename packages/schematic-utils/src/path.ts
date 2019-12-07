import { Path, dirname as dirName, normalize, basename, PathFragment } from '@angular-devkit/core';

export interface Location {
  dirname: string;
  path: string;
  filename: PathFragment;
}

export function parsePath(path: string): Location {
  const nPath = normalize(path as Path);
  return {
    dirname: dirName(nPath) as string,
    path: normalize(nPath) as string,
    filename: basename(nPath),
  };
}
