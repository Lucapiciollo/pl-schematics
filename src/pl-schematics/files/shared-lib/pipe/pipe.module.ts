import { CurrencyPipe, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';

import { CommaDecimalPipe } from './comma-decimal.pipe';
import { ConvertMbPipe } from './convert.pipe';
import { CountDayPipe, CountYearsPipe } from './count-years.pipe';
import { CurrencyFormatPipe } from './currency-format.pipe';
import { DecimalFixPipe } from './decimal-fix.pipe';
import { EnumToDescPipe } from './enum2desc.pipe';
import { ExpiredDatePipe } from './expired-date.pipe';
import { FirstCharPipe } from './first-char.pipe';
import { LocalizedDatePipe } from './localized-date.pipe';
import { NormalizePipe } from './normalize.pipe';
import { RemoveLeadingZerosPipe } from './remove-leading-zeros.pipe';
import { RoundPipe } from './round-pipe';
import { SafePipe } from './safe.pipe';
import { SortPipe } from './sort.pipe';
<% if (i18n === "ngx-translate") { %>
import { TranslateAsyncPipe } from './translate-async.pipe';
<% } %>
import { TruncateNameFilePipe } from './truncate-name-file.pipe';
import { TruncatePipe } from './truncate.pipe';

/**
 * @author l.piciollo
 * Elenco delle pipe condivise dichiarate ed esportate da PipeModule.
 * La TranslateAsyncPipe e' inclusa solo quando la libreria e' generata con ngx-translate.
 */
const PIPES = [
  CommaDecimalPipe,
  ConvertMbPipe,
  CountDayPipe,
  CountYearsPipe,
  CurrencyFormatPipe,
  DecimalFixPipe,
  EnumToDescPipe,
  ExpiredDatePipe,
  FirstCharPipe,
  LocalizedDatePipe,
  NormalizePipe,
  RemoveLeadingZerosPipe,
  RoundPipe,
  SafePipe,
  SortPipe,
  <% if (i18n === "ngx-translate") { %>
  TranslateAsyncPipe,
  <% } %>
  TruncateNameFilePipe,
  TruncatePipe,
];

/**
 * @author l.piciollo
 * Modulo che raccoglie e riesporta tutte le pipe condivise dell'applicazione.
 * Fornisce CurrencyPipe e DatePipe di Angular, necessari alle pipe CurrencyFormatPipe e LocalizedDatePipe.
 * Va importato dai moduli che usano le pipe nei template.
 */
@NgModule({
  declarations: PIPES,
  exports: PIPES,
  providers: [
    CurrencyPipe,
    DatePipe,
  ],
})
export class PipeModule {}