import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'expiredDate',
})
export class ExpiredDatePipe implements PipeTransform {
  transform(
    value: string | number | Date | null | undefined,
    minutes = 30,
  ): boolean {
    if (value === null || value === undefined || value === '') {
      return false;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) {
      return false;
    }

    const diffMs = new Date().getTime() - date.getTime();
    const diffMinutes = diffMs / 1000 / 60;

    return diffMinutes > minutes;
  }
}