import { Pipe, PipeTransform } from '@angular/core';

/**
 * @author l.piciollo
 * Pipe "firstChar": restituisce il primo carattere di un testo (utile per avatar o iniziali).
 * Uso nei template: {{ nome | firstChar }}
 */
@Pipe({
  standalone: false,
  name: 'firstChar',
})
export class FirstCharPipe implements PipeTransform {
  /**
   * @author l.piciollo
   * Elimina gli spazi iniziali e prende il primo carattere, in maiuscolo se richiesto.
   * @param value      :testo di partenza
   * @param uppercase  :se true il carattere viene reso maiuscolo (default true)
   * @param fallback   :testo restituito se il valore e' vuoto (default stringa vuota)
   * @returns il primo carattere oppure il valore di fallback
   */
  transform(
    value: string | null | undefined,
    uppercase = true,
    fallback = '',
  ): string {
    if (!value) {
      return fallback;
    }

    const char = String(value).trim().charAt(0);

    return uppercase ? char.toUpperCase() : char;
  }
}