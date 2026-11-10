import { Pipe, PipeTransform } from '@angular/core';

/**
 * @author l.piciollo
 * Pipe "decimalFix": fissa il numero di cifre decimali di un valore e permette di scegliere il separatore decimale
 * (virgola di default). Uso nei template: {{ valore | decimalFix:2:',' }}
 */
@Pipe({
  standalone: false,
  name: 'decimalFix',
})
export class DecimalFixPipe implements PipeTransform {
  /**
   * @author l.piciollo
   * Converte il valore in numero, applica toFixed e sostituisce il separatore decimale se richiesto.
   * @param value             :valore numerico o testuale (e' accettata la virgola come separatore)
   * @param decimals          :numero di cifre decimali (default 2)
   * @param decimalSeparator  :separatore decimale in uscita, '.' oppure ',' (default ',')
   * @returns numero formattato come stringa; stringa vuota se il valore e' assente, il valore originale se non numerico
   */
  transform(
    value: string | number | null | undefined,
    decimals = 2,
    decimalSeparator: '.' | ',' = ',',
  ): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const normalized = typeof value === 'string'
      ? value.replace(',', '.')
      : value;

    const numericValue = Number(normalized);

    if (isNaN(numericValue)) {
      return String(value);
    }

    const result = numericValue.toFixed(decimals);

    return decimalSeparator === ','
      ? result.replace('.', ',')
      : result;
  }
}