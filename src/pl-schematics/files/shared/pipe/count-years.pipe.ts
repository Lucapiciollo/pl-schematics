/** @format */

import {Pipe, PipeTransform, inject} from '@angular/core';
import {DateConfig, FORMAT_LOCAL_DATE} from '@app/cloud/agic/shared/module/shared.module';
import {DomSanitizer} from '@angular/platform-browser';
import moment from 'moment';

@Pipe({
   name: 'countYars',
})
export class CountYars implements PipeTransform {
   private formatDate: DateConfig = inject(FORMAT_LOCAL_DATE);
   constructor(protected sanitizer: DomSanitizer) {}

   /************************************************************************************************************************************************************************ */

   public transform(value: string): number {
      const parseFormat = this.formatDate.formatDateMoment;
      const m = moment(value, parseFormat);
      return moment().diff(m, 'years') + 1;
   }
}

@Pipe({
   name: 'countDay',
})
export class CountDay implements PipeTransform {
   constructor() {}

   /************************************************************************************************************************************************************************ */

   public transform(from: string, to?: string): number {
      if (from != null) {
         const parseFormat = inject(FORMAT_LOCAL_DATE).formatDateMoment;
         const toMoment = to ? moment(to, parseFormat) : moment();
         const fromMoment = moment(from, parseFormat);
         const diff = toMoment.diff(fromMoment, 'days');
         return Math.abs(diff);
      }
      return null;
   }
}
