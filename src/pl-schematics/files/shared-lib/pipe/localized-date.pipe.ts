import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

/**
 * @author l.piciollo
 * Pipe "localizedDate": formatta una data con il DatePipe di Angular usando un formato e un locale configurabili
 * (default dd/MM/yyyy, it-IT). Uso nei template: {{ data | localizedDate:'dd/MM/yyyy HH:mm' }}
 */
@Pipe({
  standalone: false,
  name: 'localizedDate',
})
export class LocalizedDatePipe implements PipeTransform {
  /**
   * @author l.piciollo
   * Costruttore: riceve il DatePipe di Angular (fornito da PipeModule) usato per la formattazione.
   * @param datePipe  :pipe Angular per la formattazione delle date
   */
  constructor(private readonly datePipe: DatePipe) {}

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Formatta la data con il formato, il locale e il fuso orario indicati.
   * @param value     :data da formattare (stringa, timestamp o Date)
   * @param format    :formato di uscita (default 'dd/MM/yyyy')
   * @param locale    :locale di formattazione (default 'it-IT')
   * @param timezone  :fuso orario opzionale
   * @returns data formattata; stringa vuota se il valore e' assente
   */
  transform(
    value: string | number | Date | null | undefined,
    format = 'dd/MM/yyyy',
    locale = 'it-IT',
    timezone?: string,
  ): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    return this.datePipe.transform(value, format, timezone, locale) || '';
  }
}