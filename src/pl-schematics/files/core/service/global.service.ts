/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-22 14:22:00
 * @modify date 2026-09-10
 * @desc [
 * Servizio globale dell'applicazione, punto centrale di smistamento per tutte le
 * chiamate al BE: i componenti/servizi feature dovrebbero passare da qui (GET/POST/
 * PUT/DELETE/...) invece di iniettare direttamente HttpService, cosi' da avere un
 * solo punto in cui aggiungere in futuro comportamenti trasversali (log, metriche,
 * gestione errori). Centralizza inoltre gli eventi core, gli errori globali, la
 * cache HTTP e il redirect/re-login su 401, tutti basati sugli eventi broadcast di
 * pl-core-utils-library.
 * ]
 */

import { Injectable, Injector, OnDestroy, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import {
  CONTENT_TYPE,
  PlCoreUtils,
  PlHttpRequest,
  PLUnsubscribe,
  RESPONSE_TYPE,
  TYPE_EVENT_NETWORK,
} from 'pl-core-utils-library';

import { environment } from '../../../../environments/environment';

import { CORE_TYPE_EVENT } from '../type/type.event';

import { HttpService } from './http.service';

<% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
import { Client } from '@microsoft/microsoft-graph-client';
import {  AuthService } from './auth.service';
<% } %>

import { ErrorBean, ErrorCode<% if (logging === "advanced") { %>, LoggerFeature, LoggerService<% } %> } from '<%= sharedLibName %>';

@Injectable({
  providedIn: 'root',
})
@PLUnsubscribe()
export class  GlobalService implements OnDestroy {
  <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
  private graphClient: Client | null = null;
  private readonly authService = inject( AuthService);
  <% } %>

  private readonly httpService = inject( HttpService);
  private readonly injector = inject(Injector);
  <% if (logging === "advanced") { %>
  private readonly logger = inject( LoggerService);
  <% } %>

  constructor(
     
  ) {
    this.registerCoreEvents();
  }

  ngOnDestroy(): void {
    this.logDebug('GlobalService destroyed');
  }

  /*****************************************************************************************
   * @author l.piciollo
   * Dispatch centralizzato delle chiamate al BE.
   * I componenti/servizi feature dovrebbero usare questi metodi invece di iniettare
   * direttamente HttpService, cosi' che GlobalService resti l'unico punto da cui
   * transitano tutte le richieste HTTP applicative (utile per aggiungere in futuro
   * logging/metriche/comportamenti comuni senza toccare ogni singolo consumer).
   * Per funzionalita' piu' avanzate non wrappate qui (STREAM, FORKJOIN, DOWNLOAD,
   * BASICHTTP) e' comunque possibile iniettare HttpService direttamente.
   *****************************************************************************************/

  /** Chiamata GET, interrotta automaticamente al cambio di rotta. */
  get<T>(request: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string): Observable<T> {
    return this.httpService.GET<T>(request, responseType, callBack, contentType);
  }

  /** Chiamata GET in background, NON interrotta dal cambio di rotta. */
  getBg(request: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string) {
    return this.httpService.GETBG(request, responseType, callBack, contentType);
  }

  /** Chiamata POST, interrotta automaticamente al cambio di rotta. */
  post<T>(request: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string, interrupt?: Subject<any>): Observable<T> {
    return this.httpService.POST<T>(request, responseType, callBack, contentType, interrupt);
  }

  /** Chiamata POST in background, NON interrotta dal cambio di rotta. */
  postBg<T>(request: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string) {
    return this.httpService.POSTBG<T>(request, responseType, callBack, contentType);
  }

  /** Chiamata PUT, interrotta automaticamente al cambio di rotta. */
  put<T>(request: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string) {
    return this.httpService.PUT<T>(request, responseType, callBack, contentType);
  }

  /** Chiamata PUT in background, NON interrotta dal cambio di rotta. */
  putBg(request: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string) {
    return this.httpService.PUTBG(request, responseType, callBack, contentType);
  }

  /** Chiamata PATCH, interrotta automaticamente al cambio di rotta. */
  patch(request: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string) {
    return this.httpService.PATCH(request, responseType, callBack, contentType);
  }

  /** Chiamata PATCH in background, NON interrotta dal cambio di rotta. */
  patchBg(request: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string) {
    return this.httpService.PATCHBG(request, responseType, callBack, contentType);
  }

  /** Chiamata DELETE, interrotta automaticamente al cambio di rotta. */
  delete(request: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string) {
    return this.httpService.DELETE(request, responseType, callBack, contentType);
  }

  /*****************************************************************************************/

  /**
   * Ritorna il Subject legato alla progressione di una chiamata HTTP.
   */
  getProgression(idAjax: string): Subject<any> {
    try {
      return this.httpService.TAILAJXCALL(idAjax) as Subject<any>;
    } catch (error) {
      throw this.toErrorBean(error);
    }
  }

  /**
   * Esempio di chiamata HTTP verso file mock.
   */
  callMock(p1: string, p2: string): Observable<ArrayBuffer> {
    return new Observable<ArrayBuffer>((observer) => {
      const request: PlHttpRequest = new PlHttpRequest(
        environment.http.api.mock,
        {
          api: 'api',
          files: 'files',
        },
        {
          api: p1,
          files: p2,
        },
        null,
      );

      this.httpService
        .GETFILE(request, RESPONSE_TYPE.ARRAYBUFFER, CONTENT_TYPE.JSON, null)
        .subscribe(
          (response: ArrayBuffer) => {
            observer.next(response);
            observer.complete();
          },
          (error: unknown) => {
            observer.error(error);
          },
        );
    });
  }


  <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
  /**
   * Esempio di chiamata Microsoft Graph.
   */
  async getUserName(): Promise<string> {
    try {
      this.graphClient = Client.initWithMiddleware({
        authProvider: this.authService,
      });

      const userInfo = await this.graphClient.api('/me').get();

      return userInfo && userInfo.displayName
        ? String(userInfo.displayName)
        : '';
    } catch (error) {
      throw this.toErrorBean(error);
    }
  }
  <% } %>

  private registerCoreEvents(): void {
    PlCoreUtils.Broadcast().listenEvent(
      TYPE_EVENT_NETWORK.PL_BREACK_NET,
      (event: CustomEvent) => {
        this.logWarn('Network break detected', event.detail);
      },
    );

    PlCoreUtils.Broadcast().listenEvent(
      CORE_TYPE_EVENT.CORE_ERROR_SERVICE_DIALOG,
      (event: CustomEvent) => {
        this.logError('Core error dialog event', event.detail);
      },
    );

    PlCoreUtils.Broadcast().listenEvent(
      CORE_TYPE_EVENT.CORE_ERROR_SERVICE_REDIRECT,
      (event: CustomEvent) => {
        this.logWarn('Core error redirect event', event.detail);
      },
    );

    PlCoreUtils.Broadcast().listenEvent(
      CORE_TYPE_EVENT.CORE_HTTP_AJAX_CACHE,
      (event: CustomEvent) => {
        this.logDebug('HTTP cache found', event.detail);
      },
    );

    <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
    PlCoreUtils.Broadcast().listenEvent(
      CORE_TYPE_EVENT.CORE_ACQUIRE_TOKEN_SUCCESS,
      (event: CustomEvent) => {
        this.logDebug('Azure token acquired', event.detail);
      },
    );

    PlCoreUtils.Broadcast().listenEvent(
      CORE_TYPE_EVENT.CORE_LOGIN_SUCCESS,
      (event: CustomEvent) => {
        this.logDebug('Azure login success', event.detail);
      },
    );
    <% } %>

    PlCoreUtils.Broadcast().listenEvent(
      CORE_TYPE_EVENT.CORE_HTTP_AJAX_ERROR,
      (event: CustomEvent) => {
        this.handleHttpAjaxError(event.detail);
      },
    );

    PlCoreUtils.Broadcast().listenEvent(
      CORE_TYPE_EVENT.CORE_ERROR_SERVICE,
      (event: CustomEvent) => {
        this.logError('Core generic error', event.detail);
      },
    );
  }

  private handleHttpAjaxError(error: any): void {
    <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
    if (error && error.status === 401) {
      this.injector
        .get( AuthService)
        .login()
        .subscribe();

      return;
    }
    <% } %>

    this.logError('HTTP ajax error', error);
  }

  private toErrorBean(error: unknown):  ErrorBean {
    const message = this.getErrorMessage(error);

    return new  ErrorBean(
      message,
       ErrorCode.SYSTEMERRORCODE,
      false,
      true,
    );
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message?: unknown }).message || '');
    }

    return 'Unexpected global service error';
  }

  private logDebug(message: string, payload?: unknown): void {
    <% if (logging === "advanced") { %>
    this.logger.debug(
       LoggerFeature.APP,
      message,
      payload,
    );
    <% } else { %>
    console.debug(message, payload);
    <% } %>
  }

  private logWarn(message: string, payload?: unknown): void {
    <% if (logging === "advanced") { %>
    this.logger.warn(
       LoggerFeature.APP,
      message,
      payload,
    );
    <% } else { %>
    console.warn(message, payload);
    <% } %>
  }

  private logError(message: string, payload?: unknown): void {
    <% if (logging === "advanced") { %>
    this.logger.error(
       LoggerFeature.APP,
      message,
      payload,
    );
    <% } else { %>
    console.error(message, payload);
    <% } %>
  }
}
