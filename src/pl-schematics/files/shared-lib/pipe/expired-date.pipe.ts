import { Pipe, PipeTransform } from '@angular/core';

/**
 * @author l.piciollo
 * Pipe "expiredDate": indica se una data e' piu' vecchia di un certo numero di minuti rispetto ad adesso
 * (es. per verificare la scadenza di un token o di un dato in cache). Uso nei template: {{ data | expiredDate:30 }}
 */
@Pipe({
  standalone: false,
  name: 'expiredDate',
})
export class ExpiredDatePipe implements PipeTransform {
  /**
   * @author l.piciollo
   * Calcola i minuti trascorsi dalla data e li confronta con la soglia.
   * @param value    :data da valutare (stringa, timestamp o Date)
   * @param minutes  :soglia in minuti oltre la quale la data e' considerata scaduta (default 30)
   * @returns true se la data e' scaduta; false se e' recente, assente o non valida
   */
  transform(
    value: string | number | Date | null | undefined,
    minutes = 30,
  ): boolean {
    if (value === null || value === undefined || value === '') {
      return false;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) {
      return false;
    }

    const diffMs = new Date().getTime() - date.getTime();
    const diffMinutes = diffMs / 1000 / 60;

    return diffMinutes > minutes;
  }
}