/**
 * @format
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-23 17:19:02
 * @modify date 2019-12-23 17:19:02
 * @desc [Home module, generazione di un componente modulo di base per organizzare rotte di navigazione ed esempio di lazly load module]
 */

import { NgModule } from '@angular/core';
import { SafePipe } from './SafePipe.pipe';
import { SortPipe } from './SortPipe.pipe';
import { CountDay, CountYars } from './count-years.pipe';
import { ExpiredDatePipe } from './expired-date.pipe';
import { FirstCharPipe } from './first-char.pipe';
import { TruncateNameFilePipe } from './truncate-name-file.pipe';
import { TruncatePipe } from './truncate.pipe';

import { RoundPipe } from './round-pipe';
import { CurrencyFormatPipe } from './currency.format.pipe ';
import { CurrencyPipe } from '@angular/common';
import { NormalizePipe } from './normalize.pipe';
import { DecimalFixPipe } from './DecimalFixPipe';
import { CommaDecimalPipe } from './CommaDecimalPipe';
import { EnumToDesc } from './enum2desc.pipe';
import { ConvertMbPipe } from './convert.pipe';
import { TranslateAsyncPipe } from './translate-async.pipe';
import { LocalizedDatePipe } from './LocalizedDatePipe';
import { RemoveLeadingZerosPipe } from './RemoveLeadingZerosPipe';

/**
 * @author l.piciollo
 * Home module, generazione di un componente modulo di base per organizzare rotte di navigazione ed
 * esempio di lazly load module
 */
@NgModule({
   declarations: [RemoveLeadingZerosPipe,LocalizedDatePipe,TranslateAsyncPipe, EnumToDesc, CommaDecimalPipe, DecimalFixPipe, CurrencyFormatPipe, RoundPipe, CountDay, TruncateNameFilePipe, SortPipe, SafePipe, FirstCharPipe, CountYars, TruncatePipe, ExpiredDatePipe, NormalizePipe, ConvertMbPipe],
   imports: [],
   exports: [RemoveLeadingZerosPipe,LocalizedDatePipe,TranslateAsyncPipe, EnumToDesc, CommaDecimalPipe, DecimalFixPipe, CurrencyFormatPipe, CountDay, RoundPipe, TruncateNameFilePipe, SortPipe, SafePipe, FirstCharPipe, CountYars, TruncatePipe, NormalizePipe, ExpiredDatePipe, ConvertMbPipe],
   providers: [CurrencyPipe],
})
export class PipeModule {}
