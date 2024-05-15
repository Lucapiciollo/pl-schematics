/**
 * @author luca.piciollo
 * @email lucapiciollo@gmail.com
 * @create date 2022-11-18 12:51:22
 * @modify date 2022-11-18 12:51:22
 * @desc [description]
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {

  transform(value: string, numberWord: number): string {
    try {
      if (numberWord < value.length)
        return value.substring(0, numberWord)
      return value.substring(0, numberWord)
    } catch (error) {
      return value;
    }
  }

}
