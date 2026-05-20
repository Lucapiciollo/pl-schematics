import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeLeadingZeros',
})
export class RemoveLeadingZerosPipe implements PipeTransform {
  transform(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const result = String(value).replace(/^0+/, '');

    return result || '0';
  }
}