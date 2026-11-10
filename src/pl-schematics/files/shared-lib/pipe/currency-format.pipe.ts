import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

/**
 * @author l.piciollo
 * Pipe "currencyFormat": formatta un importo come valuta usando il CurrencyPipe di Angular (default EUR, locale it-IT).
 * Accetta anche stringhe con la virgola decimale. Uso nei template: {{ importo | currencyFormat }}
 */
@Pipe({
  standalone: false,
  name: 'currencyFormat',
})
export class CurrencyFormatPipe implements PipeTransform {
  /**
   * @author l.piciollo
   * Costruttore: riceve il CurrencyPipe di Angular (fornito da PipeModule) usato per la formattazione.
   * @param currencyPipe  :pipe Angular per la formattazione delle valute
   */
  constructor(private readonly currencyPipe: CurrencyPipe) {}

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Normalizza il valore (virgola -> punto), lo converte in numero e lo formatta come valuta.
   * @param value         :importo numerico o testuale
   * @param currencyCode  :codice valuta ISO 4217 (default 'EUR')
   * @param locale        :locale di formattazione (default 'it-IT')
   * @param display       :modalita' di visualizzazione della valuta: 'code', 'symbol', 'symbol-narrow' (default 'symbol')
   * @param digitsInfo    :formato delle cifre decimali (default '1.2-2')
   * @returns importo formattato; stringa vuota se il valore e' assente, il valore originale se non numerico
   */
  transform(
    value: string | number | null | undefined,
    currencyCode = 'EUR',
    locale = 'it-IT',
    display: 'code' | 'symbol' | 'symbol-narrow' | string | boolean = 'symbol',
    digitsInfo = '1.2-2',
  ): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const normalizedValue = typeof value === 'string'
      ? value.replace(',', '.')
      : value;

    const numericValue = Number(normalizedValue);

    if (isNaN(numericValue)) {
      return String(value);
    }

    return this.currencyPipe.transform(
      numericValue,
      currencyCode,
      display,
      digitsInfo,
      locale,
    ) || String(value);
  }
}