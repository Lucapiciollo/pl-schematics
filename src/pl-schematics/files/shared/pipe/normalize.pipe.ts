/**
 * @format
 * @author luca.piciollo
 * @email lucapiciollo@gmail.com
 * @create date 2022-11-18 12:51:22
 * @modify date 2022-11-18 12:51:22
 * @desc [description]
 */

import {ElementRef, Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'normalize'})
export class NormalizePipe implements PipeTransform {
   constructor(element: ElementRef) {}

   /************************************************************************************************************************************************************************ */

   encodeHtmlEntities(str) {
      const entities = {
         '&': '&amp;',
         '<': '&lt;',
         '>': '&gt;',
         '"': '&quot;',
         "'": '&#39;',
         à: '&agrave;',
         á: '&aacute;',
         â: '&acirc;',
         ä: '&auml;',
         ã: '&atilde;',
         å: '&aring;', // Aggiungi altri caratteri speciali se necessario
      };
      return str.replace(/[&<>"'àáâäãå]/g, char => entities[char] || char);
   }

   transform(value: string): string {
      return this.encodeHtmlEntities(value);
   }
}
