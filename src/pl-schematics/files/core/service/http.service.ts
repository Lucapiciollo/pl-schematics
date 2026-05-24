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
  switchMap,
  take,
  throwError,
  timeout,
} from 'rxjs';

import {
  DEFAULT_HTTP_INTERCEPTOR_CONFIG,
  HTTP_AUTH_ADAPTER,
  HTTP_INTERCEPTOR_CONFIG,
  HttpAuthAdapter,
  HttpInterceptorConfig,
  HttpRefreshTokenResponse,
} from '../../shared/http/http-interceptor.tokens';

<% if (logging === "advanced") { %>
  
import { <%= classify(prefixClass) %>LoggerFeature } from '../logging/<%= dasherize(namePackage) %>-logger.service.enum';
import { <%= classify(prefixClass) %>LoggerService } from '../logging/<%= dasherize(namePackage) %>-logger.service';
<% } %>

type GenericHttpRequest = HttpRequest<any>;
type GenericHttpEvent = HttpEvent<any>;

@Injectable()
export class <%= classify(prefixClass) %>HttpInterceptorService implements HttpInterceptor {
  private isRefreshing = false;

  private readonly refreshTokenSubject: BehaviorSubject<string | null> =
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
    private readonly logger: <%= classify(prefixClass) %>LoggerService,
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
  ): Observable<GenericHttpEvent> {
    const startedAt = this.getNow();
    const timeoutValue = this.getTimeoutValue(request);
    const originalRequest = request;

    if (this.shouldSkipAuth(originalRequest)) {
      return next.handle(originalRequest).pipe(
        timeout(timeoutValue),
        finalize(() => this.logExecutionTime(originalRequest, startedAt)),
      );
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

    return next.handle(requestWithAuth).pipe(
      timeout(timeoutValue),
      catchError((error: HttpErrorResponse) => {
        if (!this.isUnauthorized(error)) {
          return throwError(error);
        }

        if (this.isRefreshRequest(originalRequest)) {
          this.handleRefreshFailure(error);
          return throwError(error);
        }

        return this.handle401Error(
          originalRequest,
          next,
          explicitAuthorization,
          timeoutValue,
          startedAt,
        );
      }),
      finalize(() => this.logExecutionTime(requestWithAuth, startedAt)),
    );
  }

  private handle401Error(
    originalRequest: GenericHttpRequest,
    next: HttpHandler,
    explicitAuthorization: string | null,
    timeoutValue: number,
    startedAt: number,
  ): Observable<GenericHttpEvent> {
    if (!this.authAdapter || !this.authAdapter.refreshToken) {
      const error = new Error('HTTP_AUTH_ADAPTER.refreshToken is not configured');

      this.handleRefreshFailure(error);

      return throwError(error);
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authAdapter.refreshToken().pipe(
        switchMap((response: HttpRefreshTokenResponse) => {
          const newAccessToken =
            response && response.accessToken
              ? response.accessToken
              : null;

          if (!newAccessToken) {
            const error = new Error('Access token not found in refresh response');

            this.isRefreshing = false;
            this.refreshTokenSubject.next(null);
            this.handleRefreshFailure(error);

            return throwError(error);
          }

          if (this.authAdapter) {
            this.authAdapter.setAccessToken(newAccessToken);

            if (
              response.refreshToken &&
              this.authAdapter.setRefreshToken
            ) {
              this.authAdapter.setRefreshToken(response.refreshToken);
            }
          }

          this.isRefreshing = false;
          this.refreshTokenSubject.next(newAccessToken);

          const clonedRequest = this.addAuthorizationHeader(
            originalRequest,
            newAccessToken,
            explicitAuthorization,
          );

          return next.handle(clonedRequest).pipe(
            timeout(timeoutValue),
            finalize(() => this.logExecutionTime(clonedRequest, startedAt)),
          );
        }),
        catchError((refreshError: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(null);

          this.handleRefreshFailure(refreshError);

          return throwError(refreshError);
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
    originalRequest: GenericHttpRequest,
    next: HttpHandler,
    explicitAuthorization: string | null,
    timeoutValue: number,
    startedAt: number,
  ): Observable<GenericHttpEvent> {
    return this.refreshTokenSubject.pipe(
      filter((token: string | null): token is string => !!token),
      take(1),
      switchMap((token: string) => {
        const clonedRequest = this.addAuthorizationHeader(
          originalRequest,
          token,
          explicitAuthorization,
        );

        return next.handle(clonedRequest).pipe(
          timeout(timeoutValue),
          finalize(() => this.logExecutionTime(clonedRequest, startedAt)),
        );
      }),
    );
  }

  private addAuthorizationHeader(
    request: GenericHttpRequest,
    token: string | null,
    explicitAuthorization: string | null,
  ): GenericHttpRequest {
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

  private getTimeoutValue(request: GenericHttpRequest): number {
    const headerValue = request.headers.get(this.config.timeoutHeaderName);
    const parsedValue = Number(headerValue);

    if (!isNaN(parsedValue) && parsedValue > 0) {
      return parsedValue;
    }

    return this.config.defaultTimeout;
  }

  private shouldSkipAuth(request: GenericHttpRequest): boolean {
    return request.headers.has(this.config.skipAuthHeaderName);
  }

  private isUnauthorized(error: HttpErrorResponse): boolean {
    return !!error && error.status === 401;
  }

  private isRefreshRequest(request: GenericHttpRequest): boolean {
    return request.url.indexOf(this.config.refreshUrlIncludes) > -1;
  }

  private handleRefreshFailure(error: any): void {
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
    request: GenericHttpRequest,
    startedAt: number,
  ): void {
    if (!this.config.enableExecutionTimeLog) {
      return;
    }

    const seconds = ((this.getNow() - startedAt) / 1000).toFixed(3);

    this.logDebug('HTTP execution time', {
      url: request.url,
      seconds: seconds,
    });
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

  private logDebug(message: string, payload?: any): void {
    <% if (logging === "advanced") { %>
    this.logger.debug(
      <%= classify(prefixClass) %>LoggerFeature.HTTP,
      message,
      payload,
    );
    <% } else { %>
    console.debug(message, payload);
    <% } %>
  }

  private logError(message: string, payload?: any): void {
    <% if (logging === "advanced") { %>
    this.logger.error(
      <%= classify(prefixClass) %>LoggerFeature.HTTP,
      message,
      payload,
    );
    <% } else { %>
    console.error(message, payload);
    <% } %>
  }
}