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


/** alias di comodo per una richiesta HTTP con body generico */
type GenericHttpRequest = HttpRequest<any>;
/** alias di comodo per un evento HTTP con body generico */
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

/**
 * @author l.piciollo
 * Intercettore HTTP applicativo: aggiunge l'header di autorizzazione alle richieste, applica timeout (anche per singola
 * richiesta tramite header dedicato), retry con backoff esponenziale sugli errori ritentabili e gestione del refresh del
 * token in caso di 401 (le richieste concorrenti restano in attesa del nuovo token). Si appoggia a HttpAuthAdapter e
 * HttpInterceptorConfig, forniti tramite i token HTTP_AUTH_ADAPTER e HTTP_INTERCEPTOR_CONFIG.
 */
@Injectable()
export class  HttpInterceptorService implements HttpInterceptor {
  /** true mentre e' in corso un refresh del token: le altre richieste si accodano in attesa del nuovo token */
  private isRefreshing = false;

  /** emette il nuovo access token al termine del refresh (null mentre non e' disponibile) */
  private readonly refreshTokenSubject =
    new BehaviorSubject<string | null>(null);

  /** configurazione effettiva: default unito a quella eventualmente fornita */
  private readonly config: HttpInterceptorConfig;

  /**
   * @author l.piciollo
   * Costruttore: unisce la configurazione di default con quella fornita e riceve l'adapter di autenticazione opzionale.
   * @param config   :configurazione parziale dell'intercettore, null per usare solo i valori di default
   * @param authAdapter   :adapter per lettura/scrittura token, refresh e logout, null se non configurato
   * @param logger   :servizio di logging (presente solo con logging avanzato)
   */
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Punto di ingresso dell'intercettore: applica header di autorizzazione, timeout e retry; se la richiesta fallisce con 401
   * (e non e' la richiesta di refresh) avvia o attende il refresh del token e ripete la richiesta. Le richieste con header di skip auth
   * non vengono autenticate.
   * @param request   :richiesta HTTP in uscita
   * @param next   :handler successivo della catena di intercettori
   * @returns stream degli eventi HTTP della richiesta
   */
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Esegue la richiesta applicando timeout ed eventuale retry generico configurabile
   * (backoff esponenziale) per errori diversi dal 401, che ha invece la propria gestione
   * dedicata di refresh-token. Centralizza cosi' il comportamento per il path principale,
   * per le richieste accodate in attesa del refresh token e per la richiesta ripetuta dopo
   * un refresh riuscito.
   * @param request   :richiesta HTTP da eseguire
   * @param next   :handler successivo della catena di intercettori
   * @param timeoutValue   :timeout in millisecondi da applicare alla richiesta
   * @param startedAt   :istante di inizio della richiesta, usato per il log del tempo di esecuzione
   * @returns stream degli eventi HTTP della richiesta
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Ritorna un Observable che, dopo il delay calcolato (backoff esponenziale, con tetto
   * massimo), fa ripartire la richiesta; se l'errore non e' considerato "ritentabile"
   * (vedi isRetryableError/shouldRetryRequest) rilancia subito l'errore originale,
   * interrompendo il retry e facendo proseguire la pipe verso il catchError.
   * @param request   :richiesta HTTP fallita
   * @param error   :errore ricevuto
   * @param retryCount   :numero del tentativo di retry (parte da 1)
   * @returns Observable che emette dopo l'attesa, oppure va in errore se non si deve ritentare
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Stabilisce se una richiesta fallita va ritentata: considera la configurazione di retry, l'header di skip retry,
   * le richieste di refresh (mai ritentate), i soli metodi idempotenti (se configurato) e il tipo di errore.
   * @param request   :richiesta HTTP fallita
   * @param error   :errore ricevuto
   * @returns true se la richiesta deve essere ritentata
   */
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Verifica se l'errore e' di un tipo ritentabile: timeout, errore di rete (status 0) o status HTTP presente nell'elenco configurato.
   * @param error   :errore ricevuto
   * @returns true se l'errore e' ritentabile
   */
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Verifica se il metodo HTTP e' idempotente (GET, HEAD, OPTIONS, PUT, DELETE).
   * @param method   :metodo HTTP della richiesta
   * @returns true se il metodo e' idempotente
   */
  private isIdempotentMethod(method: string): boolean {
    const idempotentMethods = ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'];

    return idempotentMethods.indexOf((method || '').toUpperCase()) > -1;
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Calcola l'attesa prima del retry con backoff esponenziale, limitata al valore massimo configurato.
   * @param retryCount   :numero del tentativo di retry (parte da 1)
   * @returns attesa in millisecondi
   */
  private getRetryDelay(retryCount: number): number {
    const exponentialDelay =
      this.config.retryDelayMs *
      Math.pow(this.config.retryBackoffMultiplier, retryCount - 1);

    return Math.min(exponentialDelay, this.config.maxRetryDelayMs);
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Gestisce una risposta 401: se non e' in corso un refresh lo avvia tramite l'adapter, salva i nuovi token e ripete la richiesta;
   * se un refresh e' gia' in corso si accoda in attesa del nuovo token. In caso di fallimento del refresh esegue la procedura di logout.
   * @param originalRequest   :richiesta originale fallita con 401
   * @param next   :handler successivo della catena di intercettori
   * @param explicitAuthorization   :valore dell'header di autorizzazione impostato esplicitamente dal chiamante, se presente
   * @param timeoutValue   :timeout in millisecondi da applicare alla richiesta
   * @param startedAt   :istante di inizio della richiesta, usato per il log del tempo di esecuzione
   * @returns stream degli eventi HTTP della richiesta ripetuta
   */
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Attende che il refresh in corso produca un nuovo access token e ripete la richiesta con quel token.
   * @param originalRequest   :richiesta da ripetere
   * @param next   :handler successivo della catena di intercettori
   * @param explicitAuthorization   :valore dell'header di autorizzazione impostato esplicitamente dal chiamante, se presente
   * @param timeoutValue   :timeout in millisecondi da applicare alla richiesta
   * @param startedAt   :istante di inizio della richiesta, usato per il log del tempo di esecuzione
   * @returns stream degli eventi HTTP della richiesta ripetuta
   */
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Clona la richiesta aggiungendo l'header di autorizzazione: ha priorita' quello esplicito del chiamante, altrimenti
   * viene usato il prefisso configurato con il token; senza nessuno dei due la richiesta resta invariata.
   * @param request   :richiesta HTTP da arricchire
   * @param token   :access token corrente, null se assente
   * @param explicitAuthorization   :valore dell'header di autorizzazione impostato esplicitamente dal chiamante, se presente
   * @returns richiesta con l'header di autorizzazione applicato (o quella originale)
   */
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Legge l'access token corrente tramite l'adapter di autenticazione.
   * @returns access token oppure null se l'adapter non e' configurato o non ha token
   */
  private getAccessToken(): string | null {
    if (!this.authAdapter) {
      return null;
    }

    return this.authAdapter.getAccessToken();
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Ricava il timeout della richiesta dall'header dedicato se e' un numero positivo, altrimenti usa il timeout di default.
   * @param request   :richiesta HTTP in uscita
   * @returns timeout in millisecondi
   */
  private getTimeoutValue(request: HttpRequest<unknown>): number {
    const headerValue = request.headers.get(this.config.timeoutHeaderName);

    const parsedValue = Number(headerValue);

    if (!isNaN(parsedValue) && parsedValue > 0) {
      return parsedValue;
    }

    return this.config.defaultTimeout;
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Verifica se la richiesta contiene l'header che esclude l'autenticazione.
   * @param request   :richiesta HTTP in uscita
   * @returns true se l'autenticazione va saltata
   */
  private shouldSkipAuth(request: HttpRequest<unknown>): boolean {
    return request.headers.has(this.config.skipAuthHeaderName);
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Verifica se l'errore e' una risposta 401 (non autorizzato).
   * @param error   :errore HTTP ricevuto
   * @returns true se lo status e' 401
   */
  private isUnauthorized(error: HttpErrorResponse): boolean {
    return error && error.status === 401;
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Verifica se la richiesta e' quella di refresh del token (l'url contiene il frammento configurato).
   * @param request   :richiesta HTTP in uscita
   * @returns true se e' una richiesta di refresh
   */
  private isRefreshRequest(request: HttpRequest<unknown>): boolean {
    return request.url.indexOf(this.config.refreshUrlIncludes) > -1;
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Gestisce il fallimento del refresh: scrive il log di errore e, se disponibile, esegue il logout dell'adapter;
   * in alternativa ricarica la pagina se e' abilitata l'opzione dedicata.
   * @param error   :errore che ha causato il fallimento
   */
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Scrive in log il tempo di esecuzione della richiesta in secondi, se abilitato in configurazione.
   * @param request   :richiesta HTTP terminata
   * @param startedAt   :istante di inizio della richiesta
   */
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Restituisce l'istante corrente, con performance.now se disponibile, altrimenti Date.now.
   * @returns istante corrente in millisecondi
   */
  private getNow(): number {
    if (
      typeof performance !== 'undefined' &&
      typeof performance.now === 'function'
    ) {
      return performance.now();
    }

    return Date.now();
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Scrive un messaggio di debug tramite il LoggerService (logging avanzato) oppure sulla console.
   * @param message   :testo del messaggio
   * @param payload   :dati opzionali da allegare
   */
  private logDebug(message: string, payload?: unknown): void {
    <% if (logging === "advanced") { %>
    this.logger.debug( LoggerFeature.HTTP, message, payload);
    <% } else { %>
    console.debug(message, payload);
    <% } %>
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Scrive un messaggio di errore tramite il LoggerService (logging avanzato) oppure sulla console.
   * @param message   :testo del messaggio
   * @param payload   :dati opzionali da allegare
   */
  private logError(message: string, payload?: unknown): void {
    <% if (logging === "advanced") { %>
    this.logger.error( LoggerFeature.HTTP, message, payload);
    <% } else { %>
    console.error(message, payload);
    <% } %>
  }
}