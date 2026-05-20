/** @format */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FORMAT_LOCAL_CURRENCY } from '../module/shared.module';
import { Utils } from '../utils/utils';

@Pipe({
  name: 'currencyFormat',
})
export class CurrencyFormatPipe implements PipeTransform {
  public l10nITA = inject(FORMAT_LOCAL_CURRENCY);
  constructor(private currencyPipe: CurrencyPipe) { }
  transform(value: string): string {
    let normalizedValue = value.replace(',', '.');
    let numValue = parseFloat(normalizedValue);
    if (isNaN(numValue)) return value;
    let newvalue = this.currencyPipe.transform(numValue, Utils.getCurrencyCode(this.l10nITA.getLanguage()), 'symbol', '1.2-2', this.l10nITA.getLanguage());
    return newvalue;
  }
}
