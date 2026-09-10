import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface HttpRefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  [key: string]: unknown;
}

export interface HttpAuthAdapter {
  getAccessToken(): string | null;

  setAccessToken(token: string): void;

  getRefreshToken?(): string | null;

  setRefreshToken?(token: string): void;

  refreshToken?(): Observable<HttpRefreshTokenResponse>;

  logout?(): void;
}

export interface HttpInterceptorConfig {
  defaultTimeout: number;
  authorizationHeaderName: string;
  authorizationPrefix: string;
  timeoutHeaderName: string;
  refreshUrlIncludes: string;
  skipAuthHeaderName: string;
  enableExecutionTimeLog: boolean;
  reloadOnRefreshFailure: boolean;

  /**
   * @author l.piciollo
   * Configurazione del retry generico applicato alle chiamate HTTP fallite per motivi diversi
   * dal 401 (che ha invece la propria gestione dedicata di refresh-token). Copre timeout, errori
   * di rete (status 0, es. connessione assente/CORS) e risposte 5xx/429/408 del BE.
   */
  enableRetry: boolean;
  maxRetryAttempts: number;
  retryDelayMs: number;
  retryBackoffMultiplier: number;
  maxRetryDelayMs: number;
  retryableStatusCodes: number[];
  retryOnNetworkError: boolean;
  retryOnTimeoutError: boolean;
  retryOnlyIdempotentMethods: boolean;
  retrySkipHeaderName: string;
}

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

export const HTTP_INTERCEPTOR_CONFIG =
  new InjectionToken<HttpInterceptorConfig>('HTTP_INTERCEPTOR_CONFIG');

export const HTTP_AUTH_ADAPTER =
  new InjectionToken<HttpAuthAdapter>('HTTP_AUTH_ADAPTER');
