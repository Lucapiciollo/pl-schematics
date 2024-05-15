/**
 * @author luca.piciollo
 * @email lucapiciollo@gmail.com
 * @create date 2022-11-18 12:51:22
 * @modify date 2022-11-18 12:51:22
 * @desc [description]
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'namefile' })
export class TruncateNameFilePipe implements PipeTransform {

  transform(value: string, character: string): string {
    try {
      return value.split(character)[value.split(character).length - 1];
    } catch (error) {
      return value;
    }
  }

}
