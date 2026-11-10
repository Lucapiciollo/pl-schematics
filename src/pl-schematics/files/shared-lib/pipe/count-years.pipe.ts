import { Pipe, PipeTransform } from '@angular/core';

/**
 * @author l.piciollo
 * Funzione di supporto (non esportata) che converte un valore in Date.
 * @param value  :data come stringa, timestamp numerico o oggetto Date
 * @returns la data valida oppure null se il valore non e' convertibile
 */
function toDate(value: string | number | Date): Date | null {
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  const date = new Date(value);

  return isNaN(date.getTime()) ? null : date;
}

/************************************************************************************************************************/

/**
 * @author l.piciollo
 * Pipe "countYears": calcola gli anni compiuti tra una data e oggi (es. per calcolare l'eta').
 * Uso nei template: {{ dataNascita | countYears }}. Restituisce 0 se la data non e' valida o e' nel futuro.
 */
@Pipe({
  standalone: false,
  name: 'countYears',
})
export class CountYearsPipe implements PipeTransform {
  /**
   * @author l.piciollo
   * Calcola la differenza in anni interi rispetto ad oggi, scalando un anno se il compleanno non e' ancora passato.
   * @param value  :data di partenza (stringa, timestamp o Date)
   * @returns numero di anni completi trascorsi, 0 se il valore e' assente, non valido o futuro
   */
  transform(value: string | number | Date | null | undefined): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const date = toDate(value);

    if (!date) {
      return 0;
    }

    const today = new Date();
    let years = today.getFullYear() - date.getFullYear();

    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      years--;
    }

    return years < 0 ? 0 : years;
  }
}

/**
 * @author l.piciollo
 * Pipe "countDays": calcola il numero di giorni (in valore assoluto) tra due date; se la data finale manca usa oggi.
 * Uso nei template: {{ dataInizio | countDays:dataFine }}
 */
@Pipe({
  standalone: false,
  name: 'countDays',
})
export class CountDayPipe implements PipeTransform {
  /**
   * @author l.piciollo
   * Calcola i giorni interi tra le due date arrotondando per difetto la differenza in millisecondi.
   * @param from  :data di partenza (stringa, timestamp o Date)
   * @param to    :data di arrivo opzionale, se omessa si usa la data corrente
   * @returns numero di giorni (sempre >= 0), 0 se una delle date e' assente o non valida
   */
  transform(
    from: string | number | Date | null | undefined,
    to?: string | number | Date,
  ): number {
    if (from === null || from === undefined || from === '') {
      return 0;
    }

    const fromDate = toDate(from);
    const toDateValue = to ? toDate(to) : new Date();

    if (!fromDate || !toDateValue) {
      return 0;
    }

    const diff = toDateValue.getTime() - fromDate.getTime();
    const dayMs = 1000 * 60 * 60 * 24;

    return Math.abs(Math.floor(diff / dayMs));
  }
}