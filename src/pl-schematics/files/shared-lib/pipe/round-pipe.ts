import { Pipe, PipeTransform } from '@angular/core';

/**
 * @author l.piciollo
 * Pipe "round": arrotonda un valore numerico (anche testuale con la virgola) al numero di decimali richiesto.
 * Uso nei template: {{ valore | round:2 }}
 */
@Pipe({
  standalone: false,
  name: 'round',
})
export class RoundPipe implements PipeTransform {
  /**
   * @author l.piciollo
   * Converte il valore in numero e lo arrotonda con Math.round alla precisione indicata.
   * @param value     :valore numerico o testuale (e' accettata la virgola decimale)
   * @param decimals  :numero di cifre decimali da mantenere (default 0)
   * @returns numero arrotondato; null se il valore e' assente o non numerico
   */
  transform(
    value: string | number | null | undefined,
    decimals = 0,
  ): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numericValue = Number(
      typeof value === 'string' ? value.replace(',', '.') : value,
    );

    if (isNaN(numericValue)) {
      return null;
    }

    const factor = Math.pow(10, decimals);

    return Math.round(numericValue * factor) / factor;
  }
}