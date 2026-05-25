import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'round',
})
export class RoundPipe implements PipeTransform {
  transform(
    value: string | number | null | undefined,
    decimals = 0,
  ): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numericValue = Number(
      typeof value === 'string' ? value.replace(',', '.') : value,
    );

    if (isNaN(numericValue)) {
      return null;
    }

    const factor = Math.pow(10, decimals);

    return Math.round(numericValue * factor) / factor;
  }
}