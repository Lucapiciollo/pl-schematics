import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeLeadingZeros',
  standalone: false
})
export class RemoveLeadingZerosPipe implements PipeTransform {

  transform(value: string | number | null | undefined): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const text = String(value).trim();

    const result = text.replace(/^0+/, '');

    return result === '' ? 0 : Number(result);
  }
}