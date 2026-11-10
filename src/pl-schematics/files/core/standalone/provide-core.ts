/**
 * @author @l.piciollo
 * @desc [provider di avvio applicativo per architettura STANDALONE: equivalente dell'InitializerModule
 * delle app classic. Registra gestione errori, ambiente, rete, loader grafico e
 * (se abilitato) MSAL. Va aggiunto una sola volta ai providers di app.config.ts: provideCore().
 *
 * ATTENZIONE, NON SI CONSIGLIA LA MODIFICA DI QUESTA FUNZIONE A CAUSA DI OSSERVATORI ESTERNI CHE NE FANNO USO SPECIFICO.]
 */
import {
  EnvironmentProviders,
  ErrorHandler,
  importProvidersFrom,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { NgxUiLoaderHttpModule, NgxUiLoaderModule, NgxUiLoaderRouterModule } from 'ngx-ui-loader';
import {
  BROWSER,
  BROWSER_VALID,
  CACHE_TAG,
  DEFAULT_PATH_MOCK,
  DISABLE_LOG,
  MAX_CACHE_AGE,
  PlAmbientModeLoaderService,
  PlCoreModule,
} from 'pl-core-utils-library';
import { APP_BOOTSTRAP_TASKS, BASE_URL_API } from '<%= sharedLibName %>';
import { environment } from '../../../<%= nsUp %>environments/environment';

import AmbientModeProviderFactory from './initializer/AmbientModeLoader';
import AutenticationLoader from './initializer/AutenticationLoader';
import { AuthService } from './service/auth.service';
import { ErrorService } from './service/error.service';
import { GlobalService } from './service/global.service';
import { UiLoaderConfig } from './utils/UiLoaderConfig';
import { UiLoaderHttpConfig } from './utils/UiLoaderHttpConfig';
import { UiLoaderRouterConfig } from './utils/UiLoaderRouterConfig';

<% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") { %>
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InteractionStatus } from '@azure/msal-browser';
import { MsalBroadcastService, MsalInterceptor, MsalService } from '@azure/msal-angular';
import { filter } from 'rxjs/operators';
import { providePlMsal } from './msal/msal-providers';
<% if (http !== 'none') { %>
import { HttpInterceptorFakeService } from '<%= sharedLibName %>';
<% } %>

<% if (http !== 'none') { %>
/** Se l'app gira in Teams non si usa l'interceptor MSAL ma quello "fake"; su web si usa MSAL. */
export const myServiceFactory = (httpInterceptorFakeService: any, msalInterceptor: any) => {
  return AuthService.applicationType.type === 'teams' ? httpInterceptorFakeService : msalInterceptor;
};
<% } %>
<% } %>

export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    /**
     * @author l.piciollo
     * inizializzazione di barre progressive, sono in ascolto sia sul cambio di rotta che durante le chiamate di rete
     * le progressioni sono configurabili tramite i file di configurazione
     * https://github.com/t-ho/ngx-ui-loader/wiki/Custom-configuration-for-NgxUiLoaderModule
     */
    importProvidersFrom(
      PlCoreModule,
      NgxUiLoaderModule.forRoot(UiLoaderConfig),
      NgxUiLoaderHttpModule.forRoot(UiLoaderHttpConfig),
      NgxUiLoaderRouterModule.forRoot(UiLoaderRouterConfig),
    ),

    <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") { %>
    /** MSAL: istanza, guard e interceptor config (sovrascrivibili tramite i token PL_MSAL_*_FACTORY). */
    providePlMsal(),
    <% if (http !== 'none') { %>
    HttpInterceptorFakeService,
    {
      provide: HTTP_INTERCEPTORS,
      useFactory: myServiceFactory,
      multi: true,
      deps: [HttpInterceptorFakeService, MsalInterceptor],
    },
    <% } %>
    <% } %>

    /** baseUrl per le chiamate al BE, valorizzata nel file environment. */
    { provide: BASE_URL_API, useValue: environment.http.api.baseUrl },

    /** configurazione iniziale della pl-library */
    { provide: BROWSER_VALID, useValue: [<%= browserSupported %>] },
    { provide: DISABLE_LOG, useValue: environment.production },
    { provide: MAX_CACHE_AGE, useValue: 300000 },
    { provide: CACHE_TAG, useValue: '@cachable@' },
    { provide: DEFAULT_PATH_MOCK, useValue: 'public/mock' },

    /**
     * @author l.piciollo
     * vengono intercettati tutti gli errori applicativi e rediretti al servizio predisposto alla loro lavorazione.
     */
    { provide: ErrorHandler, useClass: ErrorService },

    /**
     * @author l.piciollo
     * processo di login (ed eventuali APP_BOOTSTRAP_TASKS): se non va a buon fine il portale non si avvia.
     */
    provideAppInitializer(() =>
      AutenticationLoader(
        inject(AuthService),
        inject(APP_BOOTSTRAP_TASKS, { optional: true }),
      )(),
    ),

    /**
     * @author l.piciollo
     * rilevamento del browser e adeguamento delle funzionalita' (trasparente all'applicazione).
     */
    provideAppInitializer(() => AmbientModeProviderFactory(inject(PlAmbientModeLoaderService))()),

    /**
     * @author l.piciollo
     * Istanziazione eager di GlobalService all'avvio: i listener degli eventi core (errori, cache HTTP,
     * redirect, login su 401) vengono registrati subito.
     */
    provideAppInitializer(() => {
      inject(GlobalService);
    }),

    <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") { %>
    /**
     * @author l.piciollo
     * gestione del redirect MSAL e login forzato in assenza di account.
     */
    provideAppInitializer(() => {
      const msalService = inject(MsalService);
      const msalBroadcastService = inject(MsalBroadcastService);

      msalService.handleRedirectObservable().subscribe();

      msalBroadcastService.inProgress$
        .pipe(filter((status: InteractionStatus) => status === InteractionStatus.None))
        .subscribe(() => {
          if (msalService.instance.getAllAccounts().length === 0) {
            msalService.loginRedirect();
          }
        });
    }),
    <% } %>
  ]);
}
