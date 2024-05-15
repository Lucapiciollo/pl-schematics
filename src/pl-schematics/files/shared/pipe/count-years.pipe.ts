import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';

@Pipe({
  name: 'countYars'
})
export class CountYars implements PipeTransform {

  constructor(protected sanitizer: DomSanitizer) { }

  /************************************************************************************************************************************************************************ */

  public transform(value: string): number {
    return moment().diff(moment(new Date(value), "dd/MM/YYYY"), 'years') + 1;
  }

}
