import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  filter,
  finalize,
  retry,
  switchMap,
  take,
  throwError,
  timeout,
  timer,
  TimeoutError,
} from 'rxjs';


type GenericHttpRequest = HttpRequest<any>;
type GenericHttpEvent = HttpEvent<any>;

import {
  DEFAULT_HTTP_INTERCEPTOR_CONFIG,
  HTTP_AUTH_ADAPTER,
  HTTP_INTERCEPTOR_CONFIG,
  HttpAuthAdapter,
  HttpInterceptorConfig,
  HttpRefreshTokenResponse,
} from '../http/http-interceptor.tokens';

<% if (logging === "advanced") { %>
import { LoggerService } from '../logging/logger.service';
import { LoggerFeature } from '../logging/logger-feature.enum';
<% } %>

@Injectable()
export class  HttpInterceptorService implements HttpInterceptor {
  private isRefreshing = false;

  private readonly refreshTokenSubject =
    new BehaviorSubject<string | null>(null);

  private readonly config: HttpInterceptorConfig;

  constructor(
    @Optional()
    @Inject(HTTP_INTERCEPTOR_CONFIG)
    config: HttpInterceptorConfig | null,

    @Optional()
    @Inject(HTTP_AUTH_ADAPTER)
    private readonly authAdapter: HttpAuthAdapter | null,

    <% if (logging === "advanced") { %>
    private readonly logger:  LoggerService,
    <% } %>
  ) {
    this.config = {
      ...DEFAULT_HTTP_INTERCEPTOR_CONFIG,
      ...(config || {}),
    };
  }

  intercept(
    request: GenericHttpRequest,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const startedAt = this.getNow();
    const timeoutValue = this.getTimeoutValue(request);

    const originalRequest = request;

    if (this.shouldSkipAuth(originalRequest)) {
      return this.handleWithRetry(originalRequest, next, timeoutValue, startedAt);
    }

    const explicitAuthorization =
      originalRequest.headers.get(this.config.authorizationHeaderName);

    if (
      this.isRefreshing &&
      !this.isRefreshRequest(originalRequest)
    ) {
      return this.waitRefreshAndRetry(
        originalRequest,
        next,
        explicitAuthorization,
        timeoutValue,
        startedAt,
      );
    }

    const requestWithAuth = this.addAuthorizationHeader(
      originalRequest,
      this.getAccessToken(),
      explicitAuthorization,
    );

    return this.handleWithRetry(requestWithAuth, next, timeoutValue, startedAt).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!this.isUnauthorized(error)) {
          return throwError(() => error);
        }

        if (this.isRefreshRequest(originalRequest)) {
          this.handleRefreshFailure(error);
          return throwError(() => error);
        }

        return this.handle401Error(
          originalRequest,
          next,
          explicitAuthorization,
          timeoutValue,
          startedAt,
        );
      }),
    );
  }

  /**
   * @author l.piciollo
   * Esegue la richiesta applicando timeout ed eventuale retry generico configurabile
   * (backoff esponenziale) per errori diversi dal 401, che ha invece la propria gestione
   * dedicata di refresh-token. Centralizza cosi' il comportamento per il path principale,
   * per le richieste accodate in attesa del refresh token e per la richiesta ripetuta dopo
   * un refresh riuscito.
   */
  private handleWithRetry(
    request: HttpRequest<unknown>,
    next: HttpHandler,
    timeoutValue: number,
    startedAt: number,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      timeout(timeoutValue),
      retry<HttpEvent<unknown>>({
        count: this.config.maxRetryAttempts,
        delay: (error: unknown, retryCount: number) =>
          this.getRetryDelayOrThrow(request, error, retryCount),
      }),
      finalize(() => this.logExecutionTime(request, startedAt)),
    );
  }

  /**
   * @author l.piciollo
   * Ritorna un Observable che, dopo il delay calcolato (backoff esponenziale, con tetto
   * massimo), fa ripartire la richiesta; se l'errore non e' considerato "ritentabile"
   * (vedi isRetryableError/shouldRetryRequest) rilancia subito l'errore originale,
   * interrompendo il retry e facendo proseguire la pipe verso il catchError.
   */
  private getRetryDelayOrThrow(
    request: HttpRequest<unknown>,
    error: unknown,
    retryCount: number,
  ): Observable<number> {
    if (!this.shouldRetryRequest(request, error)) {
      return throwError(() => error);
    }

    const delayMs = this.getRetryDelay(retryCount);

    this.logDebug('Retrying HTTP request after failure', {
      url: request.url,
      attempt: retryCount,
      delayMs,
    });

    return timer(delayMs);
  }

  private shouldRetryRequest(
    request: HttpRequest<unknown>,
    error: unknown,
  ): boolean {
    if (!this.config.enableRetry) {
      return false;
    }

    if (request.headers.has(this.config.retrySkipHeaderName)) {
      return false;
    }

    if (this.isRefreshRequest(request)) {
      return false;
    }

    if (
      this.config.retryOnlyIdempotentMethods &&
      !this.isIdempotentMethod(request.method)
    ) {
      return false;
    }

    return this.isRetryableError(error);
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof TimeoutError) {
      return this.config.retryOnTimeoutError;
    }

    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return this.config.retryOnNetworkError;
      }

      return this.config.retryableStatusCodes.indexOf(error.status) > -1;
    }

    return false;
  }

  private isIdempotentMethod(method: string): boolean {
    const idempotentMethods = ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'];

    return idempotentMethods.indexOf((method || '').toUpperCase()) > -1;
  }

  private getRetryDelay(retryCount: number): number {
    const exponentialDelay =
      this.config.retryDelayMs *
      Math.pow(this.config.retryBackoffMultiplier, retryCount - 1);

    return Math.min(exponentialDelay, this.config.maxRetryDelayMs);
  }

  private handle401Error(
    originalRequest: HttpRequest<unknown>,
    next: HttpHandler,
    explicitAuthorization: string | null,
    timeoutValue: number,
    startedAt: number,
  ): Observable<HttpEvent<unknown>> {
    if (!this.authAdapter || !this.authAdapter.refreshToken) {
      this.handleRefreshFailure(
        new Error('HTTP_AUTH_ADAPTER.refreshToken is not configured'),
      );

      return throwError(
        () => new Error('HTTP_AUTH_ADAPTER.refreshToken is not configured'),
      );
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authAdapter.refreshToken().pipe(
        switchMap((response: HttpRefreshTokenResponse) => {
          const newAccessToken = response && response.accessToken
            ? response.accessToken
            : null;

          if (!newAccessToken) {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(null);

            this.handleRefreshFailure(
              new Error('Access token not found in refresh response'),
            );

            return throwError(
              () => new Error('Access token not found in refresh response'),
            );
          }

          this.authAdapter!.setAccessToken(newAccessToken);

          if (
            response.refreshToken &&
            this.authAdapter &&
            this.authAdapter.setRefreshToken
          ) {
            this.authAdapter.setRefreshToken(response.refreshToken);
          }

          this.isRefreshing = false;
          this.refreshTokenSubject.next(newAccessToken);

          const clonedRequest = this.addAuthorizationHeader(
            originalRequest,
            newAccessToken,
            explicitAuthorization,
          );

          return this.handleWithRetry(clonedRequest, next, timeoutValue, startedAt);
        }),
        catchError((refreshError: unknown) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(null);

          this.handleRefreshFailure(refreshError);

          return throwError(() => refreshError);
        }),
      );
    }

    return this.waitRefreshAndRetry(
      originalRequest,
      next,
      explicitAuthorization,
      timeoutValue,
      startedAt,
    );
  }

  private waitRefreshAndRetry(
    originalRequest: HttpRequest<unknown>,
    next: HttpHandler,
    explicitAuthorization: string | null,
    timeoutValue: number,
    startedAt: number,
  ): Observable<HttpEvent<unknown>> {
    return this.refreshTokenSubject.pipe(
      filter((token: string | null): token is string => !!token),
      take(1),
      switchMap((token: string) => {
        const clonedRequest = this.addAuthorizationHeader(
          originalRequest,
          token,
          explicitAuthorization,
        );

        return this.handleWithRetry(clonedRequest, next, timeoutValue, startedAt);
      }),
    );
  }

  private addAuthorizationHeader(
    request: HttpRequest<unknown>,
    token: string | null,
    explicitAuthorization: string | null,
  ): HttpRequest<unknown> {
    if (explicitAuthorization) {
      return request.clone({
        setHeaders: {
          [this.config.authorizationHeaderName]: explicitAuthorization,
        },
      });
    }

    if (token) {
      return request.clone({
        setHeaders: {
          [this.config.authorizationHeaderName]:
            this.config.authorizationPrefix + ' ' + token,
        },
      });
    }

    return request;
  }

  private getAccessToken(): string | null {
    if (!this.authAdapter) {
      return null;
    }

    return this.authAdapter.getAccessToken();
  }

  private getTimeoutValue(request: HttpRequest<unknown>): number {
    const headerValue = request.headers.get(this.config.timeoutHeaderName);

    const parsedValue = Number(headerValue);

    if (!isNaN(parsedValue) && parsedValue > 0) {
      return parsedValue;
    }

    return this.config.defaultTimeout;
  }

  private shouldSkipAuth(request: HttpRequest<unknown>): boolean {
    return request.headers.has(this.config.skipAuthHeaderName);
  }

  private isUnauthorized(error: HttpErrorResponse): boolean {
    return error && error.status === 401;
  }

  private isRefreshRequest(request: HttpRequest<unknown>): boolean {
    return request.url.indexOf(this.config.refreshUrlIncludes) > -1;
  }

  private handleRefreshFailure(error: unknown): void {
    this.logError('Refresh token failure', error);

    if (this.authAdapter && this.authAdapter.logout) {
      this.authAdapter.logout();
      return;
    }

    if (this.config.reloadOnRefreshFailure) {
      window.location.reload();
    }
  }

  private logExecutionTime(
    request: HttpRequest<unknown>,
    startedAt: number,
  ): void {
    if (!this.config.enableExecutionTimeLog) {
      return;
    }

    const seconds = ((this.getNow() - startedAt) / 1000).toFixed(3);

    this.logDebug(
      'HTTP execution time',
      {
        url: request.url,
        seconds: seconds,
      },
    );
  }

  private getNow(): number {
    if (
      typeof performance !== 'undefined' &&
      typeof performance.now === 'function'
    ) {
      return performance.now();
    }

    return Date.now();
  }

  private logDebug(message: string, payload?: unknown): void {
    <% if (logging === "advanced") { %>
    this.logger.debug( LoggerFeature.HTTP, message, payload);
    <% } else { %>
    console.debug(message, payload);
    <% } %>
  }

  private logError(message: string, payload?: unknown): void {
    <% if (logging === "advanced") { %>
    this.logger.error( LoggerFeature.HTTP, message, payload);
    <% } else { %>
    console.error(message, payload);
    <% } %>
  }
}