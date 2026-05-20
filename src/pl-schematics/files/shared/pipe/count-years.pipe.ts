import { Pipe, PipeTransform } from '@angular/core';

function toDate(value: string | number | Date): Date | null {
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  const date = new Date(value);

  return isNaN(date.getTime()) ? null : date;
}

@Pipe({
  name: 'countYears',
})
export class CountYearsPipe implements PipeTransform {
  transform(value: string | number | Date | null | undefined): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const date = toDate(value);

    if (!date) {
      return 0;
    }

    const today = new Date();
    let years = today.getFullYear() - date.getFullYear();

    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      years--;
    }

    return years < 0 ? 0 : years;
  }
}

@Pipe({
  name: 'countDays',
})
export class CountDayPipe implements PipeTransform {
  transform(
    from: string | number | Date | null | undefined,
    to?: string | number | Date,
  ): number {
    if (from === null || from === undefined || from === '') {
      return 0;
    }

    const fromDate = toDate(from);
    const toDateValue = to ? toDate(to) : new Date();

    if (!fromDate || !toDateValue) {
      return 0;
    }

    const diff = toDateValue.getTime() - fromDate.getTime();
    const dayMs = 1000 * 60 * 60 * 24;

    return Math.abs(Math.floor(diff / dayMs));
  }
}