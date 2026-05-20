/**
 * @format
 * @author luca.piciollo
 * @email lucapiciollo@gmail.com
 * @create date 2022-11-18 12:51:22
 * @modify date 2022-11-18 12:51:22
 * @desc [description]
 */

import {ElementRef, Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'round', pure: false})
export class RoundPipe implements PipeTransform {
   constructor(element: ElementRef) {}

   /************************************************************************************************************************************************************************ */

   transform(value: number): number {
      if (value != null) return Number(Math.round(value * 2) / 2);
   }
}
