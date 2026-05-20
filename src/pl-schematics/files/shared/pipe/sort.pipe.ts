import { Pipe, PipeTransform } from '@angular/core';

export type SortOrder = 'asc' | 'desc';

type SortableValue = string | number | boolean | Date | null | undefined;

@Pipe({
  name: 'sort',
  pure: false,
})
export class SortPipe implements PipeTransform {
  transform<T extends Record<string, any>>(
    value: T[] | null | undefined,
    order: SortOrder = 'asc',
    key?: keyof T,
  ): T[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const cloned = value.slice();

    return cloned.sort((a: T, b: T) => {
      const left = key ? a[key] : a;
      const right = key ? b[key] : b;

      const result = this.compare(
        left as SortableValue,
        right as SortableValue,
      );

      return order === 'desc' ? -result : result;
    });
  }

  private compare(left: SortableValue, right: SortableValue): number {
    if (left === right) {
      return 0;
    }

    if (left === null || left === undefined) {
      return -1;
    }

    if (right === null || right === undefined) {
      return 1;
    }

    if (left instanceof Date && right instanceof Date) {
      return left.getTime() - right.getTime();
    }

    if (typeof left === 'number' && typeof right === 'number') {
      return left - right;
    }

    if (typeof left === 'boolean' && typeof right === 'boolean') {
      return Number(left) - Number(right);
    }

    return String(left).localeCompare(String(right));
  }
}