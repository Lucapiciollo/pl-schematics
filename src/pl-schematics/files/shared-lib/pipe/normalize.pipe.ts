import { Pipe, PipeTransform } from '@angular/core';

/**
 * @author l.piciollo
 * Pipe "normalize": normalizza un testo rimuovendo gli accenti (decomposizione NFD), gli spazi in eccesso e,
 * se richiesto, portandolo in minuscolo. Utile per confronti e ricerche. Uso nei template: {{ testo | normalize }}
 */
@Pipe({
  standalone: false,
  name: 'normalize',
})
export class NormalizePipe implements PipeTransform {
  /**
   * @author l.piciollo
   * Rimuove i segni diacritici, elimina gli spazi ai bordi e comprime gli spazi multipli.
   * @param value      :testo o numero da normalizzare
   * @param lowerCase  :se true converte il risultato in minuscolo (default true)
   * @returns testo normalizzato; stringa vuota se il valore e' assente
   */
  transform(
    value: string | number | null | undefined,
    lowerCase = true,
  ): string {
    if (value === null || value === undefined) {
      return '';
    }

    let result = String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/\s+/g, ' ');

    if (lowerCase) {
      result = result.toLowerCase();
    }

    return result;
  }
}