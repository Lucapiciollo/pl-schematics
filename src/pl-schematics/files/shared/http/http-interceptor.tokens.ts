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
};

export const HTTP_INTERCEPTOR_CONFIG =
  new InjectionToken<HttpInterceptorConfig>('HTTP_INTERCEPTOR_CONFIG');

export const HTTP_AUTH_ADAPTER =
  new InjectionToken<HttpAuthAdapter>('HTTP_AUTH_ADAPTER');

export const BASE_URL_API =
  new InjectionToken<string>('BASE_URL_API');