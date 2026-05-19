// src/pl-schematics/utils/json.utils.ts

import { Tree } from '@angular-devkit/schematics';

export type JsonObject = Record<string, any>;

export function readJsonFile<T extends JsonObject = JsonObject>(
  host: Tree,
  path: string,
): T | null {
  const buffer = host.read(path);

  if (!buffer) {
    return null;
  }

  return JSON.parse(buffer.toString()) as T;
}

export function overwriteJsonFile(
  host: Tree,
  path: string,
  json: JsonObject,
): void {
  host.overwrite(path, JSON.stringify(json, null, 2));
}

export function ensureArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

export function pushIfMissing<T>(array: T[], value: T): void {
  if (array.indexOf(value) < 0) {
    array.push(value);
  }
}