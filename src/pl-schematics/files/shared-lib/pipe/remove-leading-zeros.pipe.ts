import { Pipe, PipeTransform } from '@angular/core';

/**
 * @author l.piciollo
 * Pipe "removeLeadingZeros": elimina gli zeri iniziali da un codice o numero (es. "00123" diventa "123").
 * Uso nei template: {{ codice | removeLeadingZeros }}
 */
@Pipe({
  standalone: false,
  name: 'removeLeadingZeros',
})
export class RemoveLeadingZerosPipe implements PipeTransform {
  /**
   * @author l.piciollo
   * Rimuove gli zeri a sinistra; se il valore e' composto solo da zeri restituisce "0".
   * @param value  :codice o numero da ripulire
   * @returns valore senza zeri iniziali; stringa vuota se il valore e' assente
   */
  transform(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const result = String(value).replace(/^0+/, '');

    return result || '0';
  }
}