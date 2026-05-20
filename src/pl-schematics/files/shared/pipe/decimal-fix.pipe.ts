/** @format */

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
   name: 'decimalFix',
   pure: false, // Permette di aggiornare dinamicamente il valore
})
export class DecimalFixPipe implements PipeTransform {
   transform(value: any, decimalPlaces: number = 2): any {
      if (value === null || value === undefined || isNaN(value)) {
         return value; // Se il valore è nullo o non è un numero, restituisci il valore originale
      }

      return parseFloat(value).toFixed(decimalPlaces);
   }
}
