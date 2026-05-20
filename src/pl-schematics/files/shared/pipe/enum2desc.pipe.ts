/** @format */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
   name: 'enumToDesc',
})
export class EnumToDesc implements PipeTransform {
   transform(value: string | number, enumObject: Array<{id: string | number; description: string; translateId?: string}> = []): string {
      if (value == null || !Array.isArray(enumObject)) return value?.toString() ?? '';

      const found = enumObject.find(f => f.id.toString() === value.toString());
      return found ? found.translateId ? found.translateId : found.description : value.toString();
   }
}
