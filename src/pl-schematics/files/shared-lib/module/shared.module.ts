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

/**
 * @author l.piciollo
 * Modulo condiviso a tutto l'applicativo (versione classic basata su NgModule): ri-esporta CommonModule, FormsModule,
 * PipeModule e, in base alle opzioni scelte, TranslateModule e MaterialModule.
 * La configurazione si passa con SharedModule.forRoot(config).
 */
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
   * @author l.piciollo
   * Da usare una sola volta nel root module (classic): registra HttpClient, gli
   * interceptor<% if (i18n === "ngx-translate") { %> e ngx-translate<% } %>.
   * @param config   :configurazione della libreria condivisa (lingua, timeout HTTP, logging)
   * @returns modulo con i provider calcolati da providePlShared
   */
  static forRoot(config: SharedLibConfig): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [providePlShared(config)],
    };
  }
}
