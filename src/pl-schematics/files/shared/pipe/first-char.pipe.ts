/**
 * @author luca.piciollo
 * @email lucapiciollo@gmail.com
 * @create date 2022-11-18 12:51:22
 * @modify date 2022-11-18 12:51:22
 * @desc [description]
 */
import { ElementRef, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'firstChar' })
export class FirstCharPipe implements PipeTransform {

  constructor(element: ElementRef) {
    
  }

  /************************************************************************************************************************************************************************ */

  transform(value: string): string {
    return value.substring(0, 1).toUpperCase();

  }

}
