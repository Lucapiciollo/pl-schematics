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
import { TranslateAsyncPipe } from './translate-async.pipe';
import { TruncateNameFilePipe } from './truncate-name-file.pipe';
import { TruncatePipe } from './truncate.pipe';

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
  TranslateAsyncPipe,
  TruncateNameFilePipe,
  TruncatePipe,
];

@NgModule({
  declarations: PIPES,
  exports: PIPES,
  providers: [
    CurrencyPipe,
    DatePipe,
  ],
})
export class PipeModule {}