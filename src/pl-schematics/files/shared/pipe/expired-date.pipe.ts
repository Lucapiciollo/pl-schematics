/**
 * @author luca.piciollo
 * @email lucapiciollo@gmail.com
 * @create date 2022-11-18 12:51:22
 * @modify date 2022-11-18 12:51:22
 * @desc [description]
 */
import { ElementRef, Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'expiredDate' })
export class ExpiredDatePipe implements PipeTransform {

  constructor(private element: ElementRef) {
 
  }

  /************************************************************************************************************************************************************************ */

  transform(value: string): string {
    if (value && moment(value).isValid) {
      if (moment().diff(moment(value), 'minutes') > 30) {
        if (this.element.nativeElement.parentElement)
          this.element.nativeElement.parentElement.classList.toggle("expired");
        else
          this.element.nativeElement.classList.toggle("expired");
      }
    }
    return value
  }

}
