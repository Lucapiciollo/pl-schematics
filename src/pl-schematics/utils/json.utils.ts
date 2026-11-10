// src/pl-schematics/utils/json.utils.ts

import { Tree } from '@angular-devkit/schematics';
import { applyEdits, modify, parse, ParseError, printParseErrorCode } from 'jsonc-parser';

export type JsonObject = Record<string, any>;

const FORMATTING_OPTIONS = { insertSpaces: true, tabSize: 2, eol: '\n' };

/**
 * @author l.piciollo
 * Parse tollerante (JSONC): accetta commenti e trailing comma, come il
 * tsconfig.json generato da `ng new`. Lancia un errore esplicito con il path
 * se il file e' realmente malformato.
 */
export function parseJsonc<T extends JsonObject = JsonObject>(
  content: string,
  path: string = '<json>',
): T {
  const errors: ParseError[] = [];
  const result = parse(content, errors, { allowTrailingComma: true });

  if (errors.length > 0) {
    throw new Error(
      'Invalid JSON in "' + path + '": ' + printParseErrorCode(errors[0].error) +
        ' at offset ' + errors[0].offset + '.',
    );
  }

  return result as T;
}

export function readJsonFile<T extends JsonObject = JsonObject>(
  host: Tree,
  path: string,
): T | null {
  const buffer = host.read(path);

  if (!buffer) {
    return null;
  }

  return parseJsonc<T>(buffer.toString(), path);
}

function isPlainObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Calcola le sole modifiche necessarie per trasformare `before` in `after`
 * (ricorsivamente sugli oggetti, gli array vengono sostituiti per intero) e le
 * applica al testo originale: commenti e formattazione delle parti non toccate
 * restano invariati.
 */
function applyDiff(
  text: string,
  before: unknown,
  after: unknown,
  path: (string | number)[],
): string {
  if (isPlainObject(before) && isPlainObject(after)) {
    let current = text;

    Object.keys(before).forEach((key) => {
      if (!(key in after)) {
        current = applyEdits(
          current,
          modify(current, [...path, key], undefined, { formattingOptions: FORMATTING_OPTIONS }),
        );
      }
    });

    Object.keys(after).forEach((key) => {
      if (!(key in before)) {
        current = applyEdits(
          current,
          modify(current, [...path, key], after[key], { formattingOptions: FORMATTING_OPTIONS }),
        );
      } else if (!deepEqual(before[key], after[key])) {
        current = applyDiff(current, before[key], after[key], [...path, key]);
      }
    });

    return current;
  }

  if (deepEqual(before, after)) {
    return text;
  }

  return applyEdits(
    text,
    modify(text, path, after, { formattingOptions: FORMATTING_OPTIONS }),
  );
}

/**
 * @author l.piciollo
 * Scrive `json` nel file preservando commenti e formattazione delle parti non
 * modificate (il tsconfig.json di `ng new` contiene commenti /* *\/).
 */
export function overwriteJsonFile(
  host: Tree,
  path: string,
  json: JsonObject,
): void {
  const buffer = host.read(path);

  if (!buffer) {
    host.create(path, JSON.stringify(json, null, 2) + '\n');
    return;
  }

  const original = buffer.toString();
  const before = parseJsonc(original, path);
  const updated = applyDiff(original, before, json, []);

  if (updated !== original) {
    host.overwrite(path, updated);
  }
}

export function ensureArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

export function pushIfMissing<T>(array: T[], value: T): void {
  if (array.indexOf(value) < 0) {
    array.push(value);
  }
}
