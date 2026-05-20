import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'normalize',
})
export class NormalizePipe implements PipeTransform {
  transform(
    value: string | number | null | undefined,
    lowerCase = true,
  ): string {
    if (value === null || value === undefined) {
      return '';
    }

    let result = String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/\s+/g, ' ');

    if (lowerCase) {
      result = result.toLowerCase();
    }

    return result;
  }
}