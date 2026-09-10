import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'localizedDate',
})
export class LocalizedDatePipe implements PipeTransform {
  constructor(private readonly datePipe: DatePipe) {}

  transform(
    value: string | number | Date | null | undefined,
    format = 'dd/MM/yyyy',
    locale = 'it-IT',
    timezone?: string,
  ): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    return this.datePipe.transform(value, format, timezone, locale) || '';
  }
}