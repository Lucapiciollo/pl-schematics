import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * @author l.piciollo
 * Risposta attesa dal refresh del token: contiene il nuovo access token ed eventualmente il nuovo refresh token.
 */
export interface HttpRefreshTokenResponse {
  /** nuovo access token */
  accessToken: string;
  /** nuovo refresh token, se restituito dal BE */
  refreshToken?: string;
  [key: string]: unknown;
}

/**
 * @author l.piciollo
 * Contratto dell'adapter di autenticazione usato da HttpInterceptorService per leggere/salvare i token,
 * rinnovarli in caso di 401 ed eseguire il logout. Fornito tramite il token HTTP_AUTH_ADAPTER
 * (implementazione di default: LocalStorageAuthAdapterService).
 */
export interface HttpAuthAdapter {
  /** restituisce l'access token corrente, null se assente */
  getAccessToken(): string | null;

  /** salva il nuovo access token */
  setAccessToken(token: string): void;

  /** restituisce il refresh token corrente, null se assente (opzionale) */
  getRefreshToken?(): string | null;

  /** salva il nuovo refresh token (opzionale) */
  setRefreshToken?(token: string): void;

  /** esegue il refresh del token e restituisce la nuova coppia di token (opzionale: senza, un 401 porta al logout) */
  refreshToken?(): Observable<HttpRefreshTokenResponse>;

  /** esegue il logout applicativo (opzionale) */
  logout?(): void;
}

/**
 * @author l.piciollo
 * Configurazione dell'intercettore HTTP: timeout, nomi degli header, refresh del token e retry.
 * Fornita tramite il token HTTP_INTERCEPTOR_CONFIG; i valori mancanti sono presi da DEFAULT_HTTP_INTERCEPTOR_CONFIG.
 */
export interface HttpInterceptorConfig {
  /** timeout di default delle richieste, in millisecondi */
  defaultTimeout: number;
  /** nome dell'header di autorizzazione */
  authorizationHeaderName: string;
  /** prefisso del token nell'header di autorizzazione (es. Bearer) */
  authorizationPrefix: string;
  /** nome dell'header con cui la singola richiesta indica un timeout personalizzato */
  timeoutHeaderName: string;
  /** frammento di url che identifica la richiesta di refresh del token */
  refreshUrlIncludes: string;
  /** nome dell'header che esclude l'autenticazione per la singola richiesta */
  skipAuthHeaderName: string;
  /** abilita il log del tempo di esecuzione delle richieste */
  enableExecutionTimeLog: boolean;
  /** ricarica la pagina se il refresh del token fallisce e non e' disponibile il logout dell'adapter */
  reloadOnRefreshFailure: boolean;

  /**
   * @author l.piciollo
   * Configurazione del retry generico applicato alle chiamate HTTP fallite per motivi diversi
   * dal 401 (che ha invece la propria gestione dedicata di refresh-token). Copre timeout, errori
   * di rete (status 0, es. connessione assente/CORS) e risposte 5xx/429/408 del BE.
   */
  enableRetry: boolean;
  /** numero massimo di tentativi di retry */
  maxRetryAttempts: number;
  /** attesa iniziale prima del primo retry, in millisecondi */
  retryDelayMs: number;
  /** moltiplicatore dell'attesa a ogni retry successivo (backoff esponenziale) */
  retryBackoffMultiplier: number;
  /** attesa massima tra due retry, in millisecondi */
  maxRetryDelayMs: number;
  /** status HTTP per cui e' previsto il retry */
  retryableStatusCodes: number[];
  /** ritenta in caso di errore di rete (status 0) */
  retryOnNetworkError: boolean;
  /** ritenta in caso di timeout */
  retryOnTimeoutError: boolean;
  /** ritenta solo i metodi idempotenti (GET, HEAD, OPTIONS, PUT, DELETE) */
  retryOnlyIdempotentMethods: boolean;
  /** nome dell'header che esclude il retry per la singola richiesta */
  retrySkipHeaderName: string;
}

/**
 * @author l.piciollo
 * Valori di default della configurazione dell'intercettore HTTP, usati per i campi non specificati in HTTP_INTERCEPTOR_CONFIG.
 */
export const DEFAULT_HTTP_INTERCEPTOR_CONFIG: HttpInterceptorConfig = {
  defaultTimeout: 30000,
  authorizationHeaderName: 'Authorization',
  authorizationPrefix: 'Bearer',
  timeoutHeaderName: 'timeout',
  refreshUrlIncludes: '/Authentication/Refresh',
  skipAuthHeaderName: 'x-skip-auth',
  enableExecutionTimeLog: true,
  reloadOnRefreshFailure: true,

  enableRetry: true,
  maxRetryAttempts: 2,
  retryDelayMs: 500,
  retryBackoffMultiplier: 2,
  maxRetryDelayMs: 8000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryOnNetworkError: true,
  retryOnTimeoutError: true,
  retryOnlyIdempotentMethods: true,
  retrySkipHeaderName: 'x-skip-retry',
};

/**
 * @author l.piciollo
 * InjectionToken per la configurazione (parziale) dell'intercettore HTTP; i valori mancanti vengono presi dai default.
 */
export const HTTP_INTERCEPTOR_CONFIG =
  new InjectionToken<HttpInterceptorConfig>('HTTP_INTERCEPTOR_CONFIG');

/**
 * @author l.piciollo
 * InjectionToken per l'adapter di autenticazione dell'intercettore HTTP (lettura/scrittura token, refresh, logout).
 */
export const HTTP_AUTH_ADAPTER =
  new InjectionToken<HttpAuthAdapter>('HTTP_AUTH_ADAPTER');
