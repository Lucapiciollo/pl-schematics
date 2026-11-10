// src/pl-schematics/utils/json.utils.ts

/**
 * @author l.piciollo
 * Utility per leggere e scrivere file JSON/JSONC (angular.json, package.json,
 * tsconfig.json) nel Tree dello schematic, preservando commenti e formattazione.
 * Non e' una rule della chain: e' usata da quasi tutte le rule update-* e dalle
 * utility di libreria/workspace.
 */

import { Tree } from '@angular-devkit/schematics';
import { applyEdits, modify, parse, ParseError, printParseErrorCode } from 'jsonc-parser';

/**
 * @author l.piciollo
 * Oggetto JSON generico (chiave stringa, valore qualsiasi).
 */
export type JsonObject = Record<string, any>;

/**
 * @author l.piciollo
 * Opzioni di formattazione usate per le modifiche JSON: 2 spazi, fine riga LF.
 */
const FORMATTING_OPTIONS = { insertSpaces: true, tabSize: 2, eol: '\n' };

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Parse tollerante (JSONC): accetta commenti e trailing comma, come il
 * tsconfig.json generato da `ng new`. Lancia un errore esplicito con il path
 * se il file e' realmente malformato.
 * @param content  :testo JSON/JSONC da interpretare
 * @param path     :percorso del file, usato solo nel messaggio di errore (default '<json>')
 * @returns l'oggetto ottenuto dal parse
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

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Legge un file JSON/JSONC dal Tree.
 * @param host  :Tree del workspace
 * @param path  :percorso del file (es. 'angular.json')
 * @returns l'oggetto interpretato, oppure null se il file non esiste
 */
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

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Type guard: indica se il valore e' un oggetto semplice (non null e non array).
 * @param value  :valore da controllare
 * @returns true se e' un oggetto semplice
 */
function isPlainObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Confronto di uguaglianza profonda basato sulla serializzazione JSON.
 * @param a  :primo valore
 * @param b  :secondo valore
 * @returns true se le due serializzazioni coincidono
 */
function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Calcola le sole modifiche necessarie per trasformare `before` in `after`
 * (ricorsivamente sugli oggetti, gli array vengono sostituiti per intero) e le
 * applica al testo originale: commenti e formattazione delle parti non toccate
 * restano invariati.
 * @param text    :testo originale del file
 * @param before  :valore interpretato del file prima delle modifiche
 * @param after   :valore desiderato dopo le modifiche
 * @param path    :percorso (chiavi/indici) del nodo corrente rispetto alla radice
 * @returns il testo aggiornato
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

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Scrive `json` nel file preservando commenti e formattazione delle parti non
 * modificate (il tsconfig.json di `ng new` contiene commenti a blocco).
 * Se il file non esiste lo crea.
 * @param host  :Tree del workspace
 * @param path  :percorso del file da scrivere
 * @param json  :contenuto desiderato del file
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

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Restituisce l'array ricevuto oppure un nuovo array vuoto se il valore non e' un array.
 * @param value  :valore (eventualmente undefined) letto dal JSON
 * @returns un array utilizzabile
 */
export function ensureArray<T>(value: T[] | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Aggiunge un valore all'array solo se non e' gia' presente.
 * @param array  :array da modificare in place
 * @param value  :valore da aggiungere
 */
export function pushIfMissing<T>(array: T[], value: T): void {
  if (array.indexOf(value) < 0) {
    array.push(value);
  }
}
