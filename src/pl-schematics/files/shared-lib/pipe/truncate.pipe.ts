import { Pipe, PipeTransform } from '@angular/core';

/**
 * @author l.piciollo
 * Pipe "truncate": tronca un testo oltre un numero massimo di caratteri aggiungendo un suffisso.
 * Uso nei template: {{ testo | truncate:50:'...' }}
 */
@Pipe({
  standalone: false,
  name: 'truncate',
})
export class TruncatePipe implements PipeTransform {
  /**
   * @author l.piciollo
   * Restituisce il testo intero se rientra nel limite, altrimenti i primi caratteri seguiti dal suffisso.
   * @param value  :testo o numero da troncare
   * @param limit  :numero massimo di caratteri mantenuti (default 50)
   * @param trail  :suffisso aggiunto al testo troncato (default '...')
   * @returns testo eventualmente troncato; stringa vuota se il valore e' assente
   */
  transform(
    value: string | number | null | undefined,
    limit = 50,
    trail = '...',
  ): string {
    if (value === null || value === undefined) {
      return '';
    }

    const text = String(value);

    if (text.length <= limit) {
      return text;
    }

    return text.substring(0, limit) + trail;
  }
}