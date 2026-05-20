import { Pipe, PipeTransform } from '@angular/core';

export interface EnumDescriptionItem {
  id?: string | number;
  code?: string | number;
  value?: string | number;
  key?: string | number;
  description?: string;
  desc?: string;
  label?: string;
  name?: string;
}

@Pipe({
  name: 'enumToDesc',
})
export class EnumToDescPipe implements PipeTransform {
  transform(
    value: string | number | null | undefined,
    items: EnumDescriptionItem[] | Record<string, string> | null | undefined,
    defaultValue = '',
  ): string {
    if (value === null || value === undefined || !items) {
      return defaultValue;
    }

    if (Array.isArray(items)) {
      const found = items.find((item: EnumDescriptionItem) => {
        return String(item.id) === String(value) ||
          String(item.code) === String(value) ||
          String(item.value) === String(value) ||
          String(item.key) === String(value);
      });

      if (!found) {
        return defaultValue;
      }

      return found.description ||
        found.desc ||
        found.label ||
        found.name ||
        defaultValue;
    }

    return items[String(value)] || defaultValue;
  }
}