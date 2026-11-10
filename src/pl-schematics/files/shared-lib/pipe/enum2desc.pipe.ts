import { Pipe, PipeTransform } from '@angular/core';

/**
 * @author l.piciollo
 * Elemento di una lista di decodifica (codice/descrizione) usato dalla pipe EnumToDescPipe.
 * Tutti i campi sono opzionali: la pipe confronta il valore con id, code, value o key e restituisce la prima
 * descrizione disponibile tra description, desc, label e name.
 */
export interface EnumDescriptionItem {
  /** identificativo dell'elemento, confrontato con il valore da decodificare */
  id?: string | number;
  /** codice dell'elemento, confrontato con il valore da decodificare */
  code?: string | number;
  /** valore dell'elemento, confrontato con il valore da decodificare */
  value?: string | number;
  /** chiave dell'elemento, confrontata con il valore da decodificare */
  key?: string | number;
  /** descrizione estesa restituita dalla pipe (prima scelta) */
  description?: string;
  /** descrizione abbreviata, usata se description e' assente */
  desc?: string;
  /** etichetta, usata se description e desc sono assenti */
  label?: string;
  /** nome, ultimo campo usato come descrizione */
  name?: string;
}

/**
 * @author l.piciollo
 * Pipe "enumToDesc": decodifica un codice nella relativa descrizione cercandolo in una lista di EnumDescriptionItem
 * oppure in una mappa chiave/descrizione. Uso nei template: {{ codice | enumToDesc:lista:'-' }}
 */
@Pipe({
  standalone: false,
  name: 'enumToDesc',
})
export class EnumToDescPipe implements PipeTransform {
  /**
   * @author l.piciollo
   * Cerca il valore nella lista (per id, code, value o key) o nella mappa e restituisce la descrizione trovata.
   * @param value         :codice da decodificare
   * @param items         :lista di EnumDescriptionItem oppure mappa chiave -> descrizione
   * @param defaultValue  :testo restituito se il valore o la descrizione non vengono trovati (default stringa vuota)
   * @returns la descrizione corrispondente oppure il valore di default
   */
  transform(
    value: string | number | null | undefined,
    items: EnumDescriptionItem[] | Record<string, string> | null | undefined,
    defaultValue = '',
  ): string {
    if (value === null || value === undefined || !items) {
      return defaultValue;
    }

    if (Array.isArray(items)) {
      const found = items.find((item: EnumDescriptionItem) => {
        return String(item.id) === String(value) ||
          String(item.code) === String(value) ||
          String(item.value) === String(value) ||
          String(item.key) === String(value);
      });

      if (!found) {
        return defaultValue;
      }

      return found.description ||
        found.desc ||
        found.label ||
        found.name ||
        defaultValue;
    }

    return items[String(value)] || defaultValue;
  }
}