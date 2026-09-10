import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'truncate',
})
export class TruncatePipe implements PipeTransform {
  transform(
    value: string | number | null | undefined,
    limit = 50,
    trail = '...',
  ): string {
    if (value === null || value === undefined) {
      return '';
    }

    const text = String(value);

    if (text.length <= limit) {
      return text;
    }

    return text.substring(0, limit) + trail;
  }
}