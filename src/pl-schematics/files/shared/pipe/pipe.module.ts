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

/**
 * @author l.piciollo
 * Home module, generazione di un componente modulo di base per organizzare rotte di navigazione ed
 * esempio di lazly load module
 */
@NgModule({
  declarations: [
    SortPipe,
    SafePipe,
    FirstCharPipe,
    CountYars,
    ExpiredDatePipe
  ],
  imports: [],
  exports: [
    SortPipe,
    SafePipe,
    FirstCharPipe,
    CountYars,
    ExpiredDatePipe
  ]
})
export class PipeModule { }
