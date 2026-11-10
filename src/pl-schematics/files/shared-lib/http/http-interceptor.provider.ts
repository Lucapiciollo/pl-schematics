import { HTTP_INTERCEPTORS, HttpInterceptorFn } from '@angular/common/http';
import { inject, Provider } from '@angular/core';

import {   HttpInterceptorService } from '../interceptor/http-interceptor.service';

import {
  DEFAULT_HTTP_INTERCEPTOR_CONFIG,
  HTTP_AUTH_ADAPTER,
  HTTP_INTERCEPTOR_CONFIG,
  HttpAuthAdapter,
  HttpInterceptorConfig,
} from './http-interceptor.tokens';

import { LocalStorageAuthAdapterService } from './local-storage-auth-adapter.service';

/**
 * @author l.piciollo
 * Config e adapter di autenticazione dell'interceptor (comuni alle due forme,
 * class-based e funzionale). Include HttpInterceptorService come servizio.
 * @param config   :configurazione parziale dell'intercettore, unita ai valori di default
 * @param authAdapterProvider   :provider alternativo per HTTP_AUTH_ADAPTER; se omesso si usa LocalStorageAuthAdapterService
 * @returns elenco di provider Angular da registrare
 */
export function provideHttpInterceptorConfig(
  config?: Partial<HttpInterceptorConfig>,
  authAdapterProvider?: Provider,
): Provider[] {
  return [
    {
      provide: HTTP_INTERCEPTOR_CONFIG,
      useValue: {
        ...DEFAULT_HTTP_INTERCEPTOR_CONFIG,
        ...(config || {}),
      },
    },
    authAdapterProvider || {
      provide: HTTP_AUTH_ADAPTER,
      useExisting: LocalStorageAuthAdapterService,
    },
    HttpInterceptorService,
  ];
}

/************************************************************************************************************************/

/**
 * @author l.piciollo
 * Forma class-based: registra HttpInterceptorService come HTTP_INTERCEPTORS
 * (va usata con provideHttpClient(withInterceptorsFromDi()) o con HttpClientModule).
 * @param config   :configurazione parziale dell'intercettore, unita ai valori di default
 * @param authAdapterProvider   :provider alternativo per HTTP_AUTH_ADAPTER; se omesso si usa LocalStorageAuthAdapterService
 * @returns elenco di provider Angular da registrare
 */
export function provideHttpInterceptor(
  config?: Partial<HttpInterceptorConfig>,
  authAdapterProvider?: Provider,
): Provider[] {
  return [
    ...provideHttpInterceptorConfig(config, authAdapterProvider),
    {
      provide: HTTP_INTERCEPTORS,
      useExisting: HttpInterceptorService,
      multi: true,
    },
  ];
}

/************************************************************************************************************************/

/**
 * @author l.piciollo
 * Forma funzionale: delega a HttpInterceptorService (va usata con
 * provideHttpClient(withInterceptors([httpInterceptorFn])) insieme a
 * provideHttpInterceptorConfig()).
 * @param request   :richiesta HTTP in uscita
 * @param next   :funzione che prosegue la catena degli intercettori funzionali
 * @returns stream degli eventi HTTP della richiesta
 */
export const httpInterceptorFn: HttpInterceptorFn = (request, next) =>
  inject(HttpInterceptorService).intercept(request, { handle: (req) => next(req) });
