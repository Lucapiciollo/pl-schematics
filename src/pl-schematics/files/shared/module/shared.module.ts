/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-21 12:30:36
 * @modify date 2026-05-24
 * @desc [
 * Modulo comune a tutto l'applicativo.
 * Si occupa di condividere moduli, pipe, componenti e funzionalità comuni.
 * Tutti i componenti o moduli che dovranno essere condivisi con il resto
 * dell'applicazione devono essere importati ed esportati da qui.
 * ]
 */

import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { environment } from 'src/environments/environment';

import { <%= classify(prefixClass) %>GlobalService } from 'src/app/<%= namePackage %>/shared/service/global.service';
import { PipeModule } from 'src/app/<%= namePackage %>/shared/pipe/pipe.module';
import { provide<%= classify(prefixClass) %>HttpInterceptor } from 'src/app/<%= namePackage %>/shared/http/http-interceptor.provider';

<% if (ui === "material") { %>
import { MaterialModule } from 'src/app/<%= namePackage %>/shared/material/material.module';
<% } %>

<% if (state === "ngrx") { %>
import { StateModule } from 'src/app/<%= namePackage %>/store/state.module';
<% } %>

/** import { MAT_DATE_LOCALE } from '@angular/material/core'; */

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    PipeModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [
          HttpClient,
        ],
      },
    }),
    <% if (ui === "material") { %>
    MaterialModule,
    <% } %>
    <% if (state === "ngrx") { %>
    StateModule,
    <% } %>
  ],
  providers: [
    /**
     * Provider condivisi non root-only.
     * I provider root-only, come interceptor HTTP, devono stare nel forRoot().
     */
    /** { provide: MAT_DATE_LOCALE, useValue: 'it-IT' } */
  ],
  exports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    PipeModule,
    TranslateModule,
    <% if (ui === "material") { %>
    MaterialModule,
    <% } %>
    <% if (state === "ngrx") { %>
    StateModule,
    <% } %>
  ],
})
export class SharedModule {
  constructor(
    private readonly globalService: <%= classify(prefixClass) %>GlobalService,
    public readonly translate: TranslateService,
  ) {
    this.translate.setDefaultLang(environment.i18n.defaultLanguage);

    /**
     * Mantiene referenziato il servizio globale.
     * Utile se il costruttore del servizio registra listener globali.
     */
    this.globalService;
  }

  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [
        ...provide<%= classify(prefixClass) %>HttpInterceptor({
          defaultTimeout: environment.http.timeout,
          refreshUrlIncludes: environment.http.api.refreshToken,
          enableExecutionTimeLog: environment.http.enableExecutionTimeLog,
          reloadOnRefreshFailure: true,
        }),
      ],
    };
  }
}