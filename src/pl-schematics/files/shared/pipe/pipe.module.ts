/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-23 17:19:02
 * @modify date 2019-12-23 17:19:02
 * @desc [Home module, generazione di un componente modulo di base per organizzare rotte di navigazione ed
 * esempio di lazly load module]
 */
import { NgModule } from '@angular/core';
import { SafePipe } from './SafePipe.pipe';
import { SortPipe } from './SortPipe.pipe';
import { CountYars } from './count-years.pipe';
import { ExpiredDatePipe } from './expired-date.pipe';
import { FirstCharPipe } from './first-char.pipe';
import { TruncateNameFilePipe } from './truncate-name-file.pipe';
import { TruncatePipe } from './truncate.pipe';
import { SelectCellDirective } from '../directive/select-cell.directive';


/**
 * @author l.piciollo
 * Home module, generazione di un componente modulo di base per organizzare rotte di navigazione ed
 * esempio di lazly load module
 */
@NgModule({
  declarations: [

    SelectCellDirective,
    TruncateNameFilePipe,
    SortPipe,
    SafePipe,
    FirstCharPipe,
    CountYars,
    TruncatePipe,
    ExpiredDatePipe
  ],
  imports: [],
  exports: [
    TruncateNameFilePipe,
    SortPipe,
    SafePipe,
    FirstCharPipe,
    CountYars,
    TruncatePipe,

    SelectCellDirective,
    ExpiredDatePipe
  ]
})
export class PipeModule { }
