import { Pipe, PipeTransform } from '@angular/core';

/**
 * @author l.piciollo
 * Tipo che indica il verso di ordinamento della SortPipe: crescente (asc) o decrescente (desc).
 */
export type SortOrder = 'asc' | 'desc';

/**
 * @author l.piciollo
 * Tipo (non esportato) dei valori confrontabili dalla SortPipe: testo, numero, booleano, data o assente.
 */
type SortableValue = string | number | boolean | Date | null | undefined;

/**
 * @author l.piciollo
 * Pipe "sort" (impura, quindi rieseguita ad ogni ciclo di change detection): ordina una copia di un array,
 * direttamente o per una chiave degli oggetti. Uso nei template: *ngFor="let x of lista | sort:'desc':'nome'"
 */
@Pipe({
  standalone: false,
  name: 'sort',
  pure: false,
})
export class SortPipe implements PipeTransform {
  /**
   * @author l.piciollo
   * Clona l'array e lo ordina con il confronto di compare, invertendo il risultato per l'ordine decrescente.
   * @param value  :array da ordinare (l'originale non viene modificato)
   * @param order  :verso di ordinamento 'asc' o 'desc' (default 'asc')
   * @param key    :proprieta' degli oggetti da usare come chiave di ordinamento; se omessa si confrontano gli elementi
   * @returns nuovo array ordinato; array vuoto se il valore non e' un array
   */
  transform<T extends Record<string, any>>(
    value: T[] | null | undefined,
    order: SortOrder = 'asc',
    key?: keyof T,
  ): T[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const cloned = value.slice();

    return cloned.sort((a: T, b: T) => {
      const left = key ? a[key] : a;
      const right = key ? b[key] : b;

      const result = this.compare(
        left as SortableValue,
        right as SortableValue,
      );

      return order === 'desc' ? -result : result;
    });
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Confronta due valori gestendo valori assenti (considerati minori), date, numeri, booleani e, per il resto, testi con localeCompare.
   * @param left   :primo valore da confrontare
   * @param right  :secondo valore da confrontare
   * @returns numero negativo, zero o positivo secondo la convenzione dei comparatori di Array.sort
   */
  private compare(left: SortableValue, right: SortableValue): number {
    if (left === right) {
      return 0;
    }

    if (left === null || left === undefined) {
      return -1;
    }

    if (right === null || right === undefined) {
      return 1;
    }

    if (left instanceof Date && right instanceof Date) {
      return left.getTime() - right.getTime();
    }

    if (typeof left === 'number' && typeof right === 'number') {
      return left - right;
    }

    if (typeof left === 'boolean' && typeof right === 'boolean') {
      return Number(left) - Number(right);
    }

    return String(left).localeCompare(String(right));
  }
}