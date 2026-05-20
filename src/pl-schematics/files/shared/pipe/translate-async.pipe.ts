/** @format */

import { Pipe, PipeTransform, ChangeDetectorRef, NgZone, OnDestroy, effect } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../core/service/language.service';

@Pipe({
   name: 'translateAsync',
   pure: false, // fondamentale: consente l’aggiornamento su eventi esterni
})
export class TranslateAsyncPipe implements PipeTransform, OnDestroy {
   private sub?: Subscription;
   private lastKey?: string;
   private lastLocale?: string;
   private rendered = '';
   private reqId = 0;
   private cache = new Map<string, string>();

   constructor(
      private languageService: LanguageService,
      private cdr: ChangeDetectorRef,
      private zone: NgZone,
   ) {
      effect(() => {
         let lastLocale = this.languageService.currentLanguage(); // trigger
         if (this.lastKey) this.fetch(this.lastKey.trim(), lastLocale.language).then(() => this.transform(this.lastKey.trim()));
      });
   }

   transform(key: string | null | undefined, data: Record<string, any> = {}): string {
      if (!key) return '';

      this.lastKey = key;

      const locale = this.lastLocale ?? this.languageService.currentLanguage().language;
      const cacheKey = `${locale ?? ''}::${key}`;
      if (this.cache.has(cacheKey)) {
         this.rendered = this.cache.get(cacheKey)!;
      } else {
         this.fetch(key, locale);
         this.rendered = key;
      }

      return this.rendered.replace(/\{\{(.*?)\}\}/g, (_, key) => data[key.trim()] ?? '');

      // return this.rendered;
   }

   private async fetch(key: string, locale?: string) {
      const cacheKey = `${locale ?? ''}::${key}`;
      const myReq = ++this.reqId;

      try {
         let arr = key.split(' ');
         let textt = arr.map(k => this.languageService.getTranslationText(k)).join(' ');

         if (myReq !== this.reqId) return;

         this.zone.run(() => {
            const value = textt ?? key;
            this.cache.set(cacheKey, value);
            this.rendered = value;
            this.cdr.markForCheck();
         });
      } catch {
         if (myReq !== this.reqId) return;
         this.zone.run(() => {
            this.cache.set(cacheKey, key);
            this.rendered = key;
            this.cdr.markForCheck();
         });
      }
   }

   ngOnDestroy(): void {
      this.sub?.unsubscribe();
   }
}
