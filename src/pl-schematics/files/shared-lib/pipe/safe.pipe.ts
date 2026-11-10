import { Pipe, PipeTransform } from '@angular/core';
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
  SafeScript,
  SafeStyle,
  SafeUrl,
} from '@angular/platform-browser';

/**
 * @author l.piciollo
 * Tipo che elenca i contesti di sicurezza Angular per cui la SafePipe puo' marcare un valore come attendibile.
 */
export type SafePipeType =
  | 'html'
  | 'style'
  | 'script'
  | 'url'
  | 'resourceUrl';

/**
 * @author l.piciollo
 * Pipe "safe": marca come attendibile un contenuto (html, style, script, url, resourceUrl) tramite DomSanitizer,
 * evitando che Angular lo sanifichi. ATTENZIONE: usarla solo con contenuti di cui si e' certi della provenienza.
 * Uso nei template: <div [innerHTML]="contenuto | safe:'html'"></div>
 */
@Pipe({
  standalone: false,
  name: 'safe',
})
export class SafePipe implements PipeTransform {
  /**
   * @author l.piciollo
   * Costruttore: riceve il DomSanitizer di Angular usato per marcare i contenuti come attendibili.
   * @param sanitizer  :servizio Angular per la sanificazione dei contenuti
   */
  constructor(private readonly sanitizer: DomSanitizer) {}

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Sceglie il metodo bypassSecurityTrust* del DomSanitizer in base al tipo richiesto (html se il tipo non e' riconosciuto).
   * @param value  :contenuto da marcare come attendibile
   * @param type   :tipo di contenuto: 'html', 'style', 'script', 'url' o 'resourceUrl' (default 'html')
   * @returns il valore nel tipo Safe* corrispondente
   */
  transform(
    value: string,
    type: SafePipeType = 'html',
  ): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
    switch (type) {
      case 'html':
        return this.sanitizer.bypassSecurityTrustHtml(value);

      case 'style':
        return this.sanitizer.bypassSecurityTrustStyle(value);

      case 'script':
        return this.sanitizer.bypassSecurityTrustScript(value);

      case 'url':
        return this.sanitizer.bypassSecurityTrustUrl(value);

      case 'resourceUrl':
        return this.sanitizer.bypassSecurityTrustResourceUrl(value);

      default:
        return this.sanitizer.bypassSecurityTrustHtml(value);
    }
  }
}