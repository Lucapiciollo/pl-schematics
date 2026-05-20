/**
 * @format
 * @author luca.piciollo
 * @email lucapiciollo@gmail.com
 * @create date 2022-11-18 12:51:22
 * @modify date 2022-11-18 12:51:22
 * @desc Converte un numero di byte in formato leggibile (B, KB, MB, GB, TB).
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'convertByte'})
export class ConvertMbPipe implements PipeTransform {
   transform(value: number | null | undefined, decimals: number = 2): string {
      if (value === null || value === undefined || isNaN(value)) {
         return '0 B';
      }

      if (value === 0) {
         return '0 B';
      }

      const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
      const k = 1024;

      let bytes = Math.abs(value);
      let i = 0;

      while (bytes >= k && i < units.length - 1) {
         bytes /= k;
         i++;
      }

      const formatted = bytes.toFixed(decimals);
      const sign = value < 0 ? '-' : '';

      return `${sign}${formatted} ${units[i]}`;
   }
}
