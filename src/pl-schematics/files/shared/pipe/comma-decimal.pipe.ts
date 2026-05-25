import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'commaDecimal',
})
export class CommaDecimalPipe implements PipeTransform {
  transform(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    return String(value).replace('.', ',');
  }
}