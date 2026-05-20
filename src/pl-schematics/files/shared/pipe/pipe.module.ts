/**
 * @format
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-23 17:19:02
 * @modify date 2019-12-23 17:19:02
 * @desc [Home module, generazione di un componente modulo di base per organizzare rotte di navigazione ed esempio di lazly load module]
 */

import { NgModule } from '@angular/core';

import { SafePipe } from './safe.pipe';
import { SortPipe } from './sort.pipe';
import { CountDay, CountYars } from './count-years.pipe';
import { ExpiredDatePipe } from './expired-date.pipe';
import { FirstCharPipe } from './first-char.pipe';
import { TruncateNameFilePipe } from './truncate-name-file.pipe';
import { TruncatePipe } from './truncate.pipe';
import { RoundPipe } from './round-pipe';
import { CurrencyFormatPipe } from './currency-format.pipe';
import { CurrencyPipe } from '@angular/common';
import { NormalizePipe } from './normalize.pipe';
import { DecimalFixPipe } from './decimal-fix.pipe';
import { CommaDecimalPipe } from './comma-decimal.pipe';
import { EnumToDesc } from './enum2desc.pipe';
import { ConvertMbPipe } from './convert.pipe';
import { TranslateAsyncPipe } from './translate-async.pipe';
import { LocalizedDatePipe } from './localized-date.pipe';
import { RemoveLeadingZerosPipe } from './remove-leading-zeros.pipe';


const PIPES = [RemoveLeadingZerosPipe,LocalizedDatePipe,TranslateAsyncPipe, EnumToDesc, CommaDecimalPipe, DecimalFixPipe, CurrencyFormatPipe, RoundPipe, CountDay, TruncateNameFilePipe, SortPipe, SafePipe, FirstCharPipe, CountYars, TruncatePipe, ExpiredDatePipe, NormalizePipe, ConvertMbPipe];

/**
 * @author l.piciollo
 * Home module, generazione di un componente modulo di base per organizzare rotte di navigazione ed
 * esempio di lazly load module
 */
@NgModule({
   declarations: [...PIPES],
   imports: [],
   exports: [...PIPES],
   providers: [CurrencyPipe],
})
export class PipeModule {}
