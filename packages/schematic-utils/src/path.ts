import { Path, basename, dirname, join, normalize } from '@angular-devkit/core';

export interface Location {
  name: string;
  path: Path;
}

export function parseName(path: string, name: string): Location {
  const nameWithoutPath = basename(normalize(name));
  const namePath = dirname(join(normalize(path), name) as Path);

  return {
    name: nameWithoutPath,
    path: normalize('/' + namePath),
  };
}

export function normalizePath(path: string): string {
  const namePath = normalize(path);
  return normalize(`${namePath}`);
}
