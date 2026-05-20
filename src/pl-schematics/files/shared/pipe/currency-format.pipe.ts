import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
})
export class CurrencyFormatPipe implements PipeTransform {
  constructor(private readonly currencyPipe: CurrencyPipe) {}

  transform(
    value: string | number | null | undefined,
    currencyCode = 'EUR',
    locale = 'it-IT',
    display: 'code' | 'symbol' | 'symbol-narrow' | string | boolean = 'symbol',
    digitsInfo = '1.2-2',
  ): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const normalizedValue = typeof value === 'string'
      ? value.replace(',', '.')
      : value;

    const numericValue = Number(normalizedValue);

    if (isNaN(numericValue)) {
      return String(value);
    }

    return this.currencyPipe.transform(
      numericValue,
      currencyCode,
      display,
      digitsInfo,
      locale,
    ) || String(value);
  }
}