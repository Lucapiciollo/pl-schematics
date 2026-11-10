/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-21 12:30:36
 * @modify date 2026-11-09
 * @desc [
 * Modulo comune a tutto l'applicativo.
 * Condivide moduli, pipe, componenti e funzionalita' comuni.
 *
 * La configurazione (lingua, timeout HTTP, ...) NON viene letta dall'environment dell'app
 * (una libreria non puo' dipendere dall'app): si passa con SharedModule.forRoot(config).
 * Le app standalone usano providePlShared(config) (vedi config/shared-lib.config.ts).
 * ]
 */

import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
<% if (i18n === "ngx-translate") { %>
import { TranslateModule } from '@ngx-translate/core';
<% } %>

import { SharedLibConfig, providePlShared } from '../config/shared-lib.config';
import { PipeModule } from '../pipe/pipe.module';

<% if (ui === "material") { %>
import { MaterialModule } from '../material/material.module';
<% } %>

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    PipeModule,
    <% if (i18n === "ngx-translate") { %>
    TranslateModule,
    <% } %>
    <% if (ui === "material") { %>
    MaterialModule,
    <% } %>
  ],
  exports: [
    CommonModule,
    FormsModule,
    PipeModule,
    <% if (i18n === "ngx-translate") { %>
    TranslateModule,
    <% } %>
    <% if (ui === "material") { %>
    MaterialModule,
    <% } %>
  ],
})
export class SharedModule {
  /**
   * Da usare una sola volta nel root module (classic): registra HttpClient, gli
   * interceptor<% if (i18n === "ngx-translate") { %> e ngx-translate<% } %>.
   */
  static forRoot(config: SharedLibConfig): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [providePlShared(config)],
    };
  }
}
