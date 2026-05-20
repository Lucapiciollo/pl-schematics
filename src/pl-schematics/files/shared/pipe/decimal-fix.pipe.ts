import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decimalFix',
})
export class DecimalFixPipe implements PipeTransform {
  transform(
    value: string | number | null | undefined,
    decimals = 2,
    decimalSeparator: '.' | ',' = ',',
  ): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const normalized = typeof value === 'string'
      ? value.replace(',', '.')
      : value;

    const numericValue = Number(normalized);

    if (isNaN(numericValue)) {
      return String(value);
    }

    const result = numericValue.toFixed(decimals);

    return decimalSeparator === ','
      ? result.replace('.', ',')
      : result;
  }
}