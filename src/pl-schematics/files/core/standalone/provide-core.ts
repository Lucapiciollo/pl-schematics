/**
 * @author @l.piciollo
 * @desc [provider di avvio applicativo per architettura STANDALONE: equivalente dell'InitializerModule
 * delle app classic. Registra gestione errori, ambiente, rete e
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
/**
 * @author l.piciollo
 * Se l'app gira in Teams non si usa l'interceptor MSAL ma quello "fake"; su web si usa MSAL.
 * @param httpInterceptorFakeService :interceptor fittizio da usare quando l'app gira in Teams
 * @param msalInterceptor            :interceptor MSAL da usare quando l'app gira sul web
 * @returns l'interceptor da registrare in base al tipo di applicazione
 */
export const myServiceFactory = (httpInterceptorFakeService: any, msalInterceptor: any) => {
  return AuthService.applicationType.type === 'teams' ? httpInterceptorFakeService : msalInterceptor;
};
<% } %>
<% } %>

/**
 * @author l.piciollo
 * Provider di avvio applicativo per l'architettura STANDALONE (equivalente dell'InitializerModule delle app classic).
 * Registra base url del BE, configurazione della pl-library, gestione errori, processo di login,
 * rilevamento del browser, istanziazione eager di GlobalService e, se abilitato, MSAL.
 * Va aggiunto una sola volta ai providers di app.config.ts: provideCore().
 * @returns gli EnvironmentProviders da registrare nel bootstrap dell'applicazione
 */
export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    /** modulo comune della pl-core-utils-library. Il loader grafico (pl-loading-trace) e' registrato in app.config.ts. */
    importProvidersFrom(PlCoreModule),

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
