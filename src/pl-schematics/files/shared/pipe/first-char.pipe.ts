import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstChar',
})
export class FirstCharPipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    uppercase = true,
    fallback = '',
  ): string {
    if (!value) {
      return fallback;
    }

    const char = String(value).trim().charAt(0);

    return uppercase ? char.toUpperCase() : char;
  }
}