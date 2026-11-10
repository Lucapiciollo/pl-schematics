import { Inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

/**
 * @author l.piciollo
 * Pipe "translateAsync": traduce una chiave con ngx-translate restituendo un Observable (da usare con la pipe async).
 * Uso nei template: {{ 'CHIAVE' | translateAsync | async }}
 */
@Pipe({
  standalone: false,
  name: 'translateAsync',
})
export class TranslateAsyncPipe implements PipeTransform {
  /**
   * @author l.piciollo
   * Costruttore: riceve il TranslateService di ngx-translate.
   * @param translateService  :servizio di traduzione di ngx-translate
   */
  constructor( @Inject(TranslateService) private readonly translateService: TranslateService) {}

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Richiede la traduzione della chiave al TranslateService.
   * @param key     :chiave di traduzione
   * @param params  :parametri opzionali per l'interpolazione nel testo tradotto
   * @returns Observable con il testo tradotto; Observable di stringa vuota se la chiave e' assente
   */
  transform(
    key: string | null | undefined,
    params?: Record<string, unknown>,
  ): Observable<string> {
    if (!key) {
      return of('');
    }

    return this.translateService.get(key, params);
  }
}