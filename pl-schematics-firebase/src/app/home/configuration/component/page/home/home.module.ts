/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-23 17:19:02
 * @modify date 2019-12-23 17:19:02
 * @desc [Home module, generazione di un componente modulo di base per organizzare rotte di navigazione ed
 * esempio di lazly load module]
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SharedModule } from 'src/app/home/configuration/shared/module/shared.module';

/**
 * @author l.piciollo
 * Home module, generazione di un componente modulo di base per organizzare rotte di navigazione ed
 * esempio di lazly load module
 */
@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule
  ],
  exports:[]
})
export class HomeModule { }
