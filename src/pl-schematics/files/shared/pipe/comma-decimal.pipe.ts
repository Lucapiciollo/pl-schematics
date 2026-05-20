/** @format */

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
   name: 'commaDecimal',
   standalone: false,
})
export class CommaDecimalPipe implements PipeTransform {
   transform(value: string | number | null | undefined): string | number | null | undefined {
      if (value === null || value === undefined) return value;

      const stringValue = value.toString().trim();

      // Non trasformare valori speciali
      if (stringValue === '' || stringValue === 'N.A.') return stringValue;

      // Sostituisce SOLO il primo separatore decimale se ce n'è uno
      const lastDotIndex = stringValue.lastIndexOf('.');
      if (lastDotIndex === -1) return stringValue;

      return (
         stringValue.substring(0, lastDotIndex).replace(/\./g, '') + // rimuove punti delle migliaia
         ',' +
         stringValue.substring(lastDotIndex + 1)
      );
   }
}
