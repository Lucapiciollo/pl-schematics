import { Pipe, PipeTransform } from '@angular/core';

export type FileSizeUnit =
  | 'B'
  | 'KB'
  | 'MB'
  | 'GB'
  | 'TB';

@Pipe({
  name: 'convertMb',
})
export class ConvertMbPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    unit: FileSizeUnit = 'MB',
    decimals = 2,
  ): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const bytes = Number(value);

    if (isNaN(bytes)) {
      return String(value);
    }

    const units: FileSizeUnit[] = ['B', 'KB', 'MB', 'GB', 'TB'];
    const unitIndex = units.indexOf(unit);

    if (unitIndex < 0) {
      return String(value);
    }

    const converted = bytes / Math.pow(1024, unitIndex);

    return converted.toFixed(decimals) + ' ' + unit;
  }
}