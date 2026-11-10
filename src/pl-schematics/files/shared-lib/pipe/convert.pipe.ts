import { Pipe, PipeTransform } from '@angular/core';

/**
 * @author l.piciollo
 * Tipo che elenca le unita' di misura supportate per la dimensione dei file (da byte a terabyte).
 * Usato come parametro dell'unita' di destinazione della pipe ConvertMbPipe.
 */
export type FileSizeUnit =
  | 'B'
  | 'KB'
  | 'MB'
  | 'GB'
  | 'TB';

/**
 * @author l.piciollo
 * Pipe "convertMb": converte una dimensione espressa in byte nell'unita' richiesta (B, KB, MB, GB, TB)
 * usando la base 1024 e restituisce il valore formattato con il suffisso dell'unita'.
 * Uso nei template: {{ bytes | convertMb:'MB':2 }}
 */
@Pipe({
  standalone: false,
  name: 'convertMb',
})
export class ConvertMbPipe implements PipeTransform {
  /**
   * @author l.piciollo
   * Divide il valore in byte per 1024 elevato all'indice dell'unita' scelta e lo formatta con i decimali richiesti.
   * @param value     :dimensione in byte (numero o stringa numerica)
   * @param unit      :unita' di destinazione (default 'MB')
   * @param decimals  :numero di cifre decimali (default 2)
   * @returns stringa tipo "1.50 MB"; stringa vuota se il valore e' assente, il valore originale se non numerico o se l'unita' non e' valida
   */
  transform(
    value: number | string | null | undefined,
    unit: FileSizeUnit = 'MB',
    decimals = 2,
  ): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const bytes = Number(value);

    if (isNaN(bytes)) {
      return String(value);
    }

    const units: FileSizeUnit[] = ['B', 'KB', 'MB', 'GB', 'TB'];
    const unitIndex = units.indexOf(unit);

    if (unitIndex < 0) {
      return String(value);
    }

    const converted = bytes / Math.pow(1024, unitIndex);

    return converted.toFixed(decimals) + ' ' + unit;
  }
}