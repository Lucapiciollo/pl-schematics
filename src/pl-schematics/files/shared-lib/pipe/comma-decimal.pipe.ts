import { Pipe, PipeTransform } from '@angular/core';

/**
 * @author l.piciollo
 * Pipe "commaDecimal": sostituisce il separatore decimale punto con la virgola (formato italiano).
 * Uso nei template: {{ valore | commaDecimal }}. Restituisce stringa vuota per valori null/undefined/vuoti.
 */
@Pipe({
  standalone: false,
  name: 'commaDecimal',
})
export class CommaDecimalPipe implements PipeTransform {
  /**
   * @author l.piciollo
   * Converte il valore in stringa e sostituisce il (primo) punto con la virgola.
   * @param value  :valore numerico o testuale da formattare
   * @returns stringa con la virgola come separatore decimale, stringa vuota se il valore e' assente
   */
  transform(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    return String(value).replace('.', ',');
  }
}