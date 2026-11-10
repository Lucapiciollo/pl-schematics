// src/pl-schematics/utils/ts-edit.utils.ts
//
// Piccole utility di editing testuale per file TypeScript generati da `ng new`
// (app.module.ts, app.config.ts, componente root). Non sono un parser TS
// completo: operano su pattern semplici e stabili (import nominali, array di
// proprieta' di @NgModule/@Component/ApplicationConfig) e sono idempotenti.
//
// Usate da update-app-shell.rule.ts, l'ultima rule della chain di index.ts.

/**
 * @author l.piciollo
 * Richiesta di import nominale: simboli da importare e modulo di provenienza.
 */
export interface ImportRequest {
  /** Nomi dei simboli da importare. */
  symbols: string[];
  /** Specifier del modulo da cui importare (pacchetto o percorso relativo). */
  from: string;
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Aggiunge (o completa) un import nominale. Se esiste gia' un import dallo
 * stesso specifier, i simboli mancanti vengono aggiunti a quello esistente.
 * @param content  :contenuto del file TypeScript
 * @param request  :simboli e modulo da importare
 * @returns il contenuto con l'import aggiunto/completato (invariato se gia' presente)
 */
export function addImports(content: string, request: ImportRequest): string {
  const escaped = request.from.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
  const existing = new RegExp(
    'import\\s*\\{([^}]*)\\}\\s*from\\s*([\'"])' + escaped + '\\2\\s*;?',
  );
  const match = content.match(existing);

  if (match) {
    const present = match[1]
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
    const missing = request.symbols.filter((symbol) => present.indexOf(symbol) < 0);

    if (!missing.length) {
      return content;
    }

    const merged = present.concat(missing).join(', ');

    return content.replace(
      existing,
      "import { " + merged + " } from '" + request.from + "';",
    );
  }

  const statement = "import { " + request.symbols.join(', ') + " } from '" + request.from + "';\n";
  const importRegex = /^import[\s\S]*?from\s*['"][^'"]+['"]\s*;?[ \t]*\r?\n/gm;
  let lastEnd = -1;
  let m: RegExpExecArray | null;

  while ((m = importRegex.exec(content)) !== null) {
    lastEnd = m.index + m[0].length;
  }

  if (lastEnd < 0) {
    return statement + content;
  }

  return content.slice(0, lastEnd) + statement + content.slice(lastEnd);
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Indice della parentesi di chiusura che bilancia quella aperta in `openIndex`
 * (gestisce annidamenti e stringhe).
 * @param content    :testo in cui cercare
 * @param openIndex  :indice del carattere di apertura ('[', '(' oppure '{')
 * @returns indice della parentesi di chiusura corrispondente, oppure -1 se non trovata
 */
export function findClosing(content: string, openIndex: number): number {
  const open = content.charAt(openIndex);
  const close = open === '[' ? ']' : open === '(' ? ')' : '}';
  let depth = 0;
  let quote: string | null = null;

  for (let i = openIndex; i < content.length; i++) {
    const ch = content.charAt(i);

    if (quote) {
      if (ch === '\\') {
        i++;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
    } else if (ch === open) {
      depth++;
    } else if (ch === close) {
      depth--;

      if (depth === 0) {
        return i;
      }
    }
  }

  return -1;
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Descrive l'aggiunta di elementi a una proprieta' di tipo array (es. imports, providers).
 */
export interface ArrayEdit {
  /** Nome della proprieta' (imports, providers, ...). */
  property: string;
  /** Espressioni da aggiungere. Una voce e' ignorata se `key` e' gia' presente nell'array. */
  items: { key: string; code: string }[];
  /**
   * Regex che individua dove inserire `property: [...]` se la proprieta' non
   * esiste; l'inserimento avviene subito dopo il match.
   */
  anchor: RegExp;
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Aggiunge elementi a una proprieta' array (es. imports di @NgModule, providers di
 * ApplicationConfig). Salta gli elementi la cui chiave e' gia' presente; se la proprieta'
 * non esiste la crea subito dopo il match di `anchor`. Lancia un errore se l'anchor non e' trovato.
 * @param content  :contenuto del file TypeScript
 * @param edit     :proprieta', elementi da aggiungere e ancora di inserimento
 * @returns il contenuto aggiornato (invariato se non c'e' nulla da aggiungere)
 */
export function addToArrayProperty(content: string, edit: ArrayEdit): string {
  const propRegex = new RegExp('(^|[\\s{,])' + edit.property + '\\s*:\\s*\\[');
  const propMatch = propRegex.exec(content);

  if (propMatch) {
    const openIndex = propMatch.index + propMatch[0].length - 1;
    const closeIndex = findClosing(content, openIndex);

    if (closeIndex < 0) {
      return content;
    }

    const inner = content.slice(openIndex + 1, closeIndex);
    const toAdd = edit.items.filter(
      (item) => !new RegExp('\\b' + item.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(inner),
    );

    if (!toAdd.length) {
      return content;
    }

    const trimmed = inner.replace(/\s+$/, '');
    const needsComma = trimmed.trim().length > 0 && !/,\s*$/.test(trimmed);
    const addition = toAdd.map((item) => '\n    ' + item.code).join(',');
    const rebuilt =
      trimmed + (needsComma ? ',' : '') + addition + '\n  ';

    return content.slice(0, openIndex + 1) + rebuilt + content.slice(closeIndex);
  }

  const anchorMatch = edit.anchor.exec(content);

  if (!anchorMatch) {
    throw new Error(
      'Cannot add "' + edit.property + '": anchor ' + edit.anchor + ' not found in the target file.',
    );
  }

  const insertAt = anchorMatch.index + anchorMatch[0].length;
  const body = edit.items.map((item) => '\n    ' + item.code).join(',');

  return (
    content.slice(0, insertAt) +
    '\n  ' + edit.property + ': [' + body + '\n  ],' +
    content.slice(insertAt)
  );
}
