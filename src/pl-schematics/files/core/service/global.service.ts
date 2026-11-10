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

import { HttpResponse } from '@angular/common/http';
import { Injectable, Injector, OnDestroy, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import {
  CONTENT_TYPE,
  PlCoreUtils,
  PlHttpRequest,
  RESPONSE_TYPE,
  TYPE_EVENT_NETWORK,
} from 'pl-core-utils-library';

import { Unsubscribe } from 'pl-decorator';

import { environment } from '../../../../<%= nsUp %>environments/environment';

import { CORE_TYPE_EVENT } from '../type/type.event';

import { HttpService } from './http.service';

<% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
import { Client } from '@microsoft/microsoft-graph-client';
import {  AuthService } from './auth.service';
<% } %>

import { ErrorBean, ErrorCode<% if (logging === "advanced") { %>, LoggerFeature, LoggerService<% } %> } from '<%= sharedLibName %>';

/**
 * @author l.piciollo
 * Servizio globale dell'applicazione: punto centrale di smistamento delle chiamate al BE (wrapper di HttpService) e dei
 * listener degli eventi broadcast core (errori, cache HTTP, re-login su 401, eventi Azure quando abilitati).
 * Viene istanziato alla prima iniezione e registra subito i listener degli eventi core.
 */
@Injectable({
  providedIn: 'root',
})
@Unsubscribe()
export class  GlobalService implements OnDestroy {
  <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
  /** client Microsoft Graph, creato al primo utilizzo in getUserName */
  private graphClient: Client | null = null;
  /** servizio di autenticazione, usato per Graph e per il re-login su 401 */
  private readonly authService = inject( AuthService);
  <% } %>

  /** servizio http di base verso cui vengono inoltrate tutte le chiamate */
  private readonly httpService = inject( HttpService);
  /** injector Angular, usato per recuperare servizi in modo lazy (es. AuthService) */
  private readonly injector = inject(Injector);
  <% if (logging === "advanced") { %>
  /** logger applicativo avanzato */
  private readonly logger = inject( LoggerService);
  <% } %>

  /**
   * @author l.piciollo
   * Costruttore: registra i listener degli eventi broadcast core (vedi registerCoreEvents).
   */
  constructor(
     
  ) {
    this.registerCoreEvents();
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Hook di distruzione del servizio: registra solo un log di debug.
   */
  ngOnDestroy(): void {
    this.logDebug('GlobalService destroyed');
  }

  /************************************************************************************************************************/

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

  /**
   * @author l.piciollo
   * Chiamata GET, interrotta automaticamente al cambio di rotta.
   * @param request      :richiesta http (url, query params, body, headers)
   * @param responseType :tipo di risposta RESPONSE_TYPE
   * @param callBack     :funzione invocata all'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   * @returns Observable che emette il body della risposta e poi completa
   */
  get<T>(request: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string): Observable<T> {
    return this.httpService.GET<T>(request, responseType, callBack, contentType);
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Chiamata GET in background, NON interrotta dal cambio di rotta.
   * @param request      :richiesta http (url, query params, body, headers)
   * @param responseType :tipo di risposta RESPONSE_TYPE
   * @param callBack     :funzione invocata all'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   * @returns Observable che emette la HttpResponse completa
   */
  getBg(request: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string) {
    return this.httpService.GETBG(request, responseType, callBack, contentType);
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Chiamata POST, interrotta automaticamente al cambio di rotta.
   * @param request      :richiesta http (url, query params, body, headers)
   * @param responseType :tipo di risposta RESPONSE_TYPE
   * @param callBack     :funzione invocata all'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   * @param interrupt    :Subject opzionale che interrompe la chiamata; se assente viene usato l'interrupt del routing
   * @returns Observable che emette il body della risposta e poi completa
   */
  post<T>(request: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string, interrupt?: Subject<any>): Observable<T> {
    return this.httpService.POST<T>(request, responseType, callBack, contentType, interrupt);
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Chiamata POST in background, NON interrotta dal cambio di rotta.
   * @param request      :richiesta http (url, query params, body, headers)
   * @param responseType :tipo di risposta RESPONSE_TYPE
   * @param callBack     :funzione invocata all'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   * @returns Observable che emette la HttpResponse completa
   */
  postBg<T>(request: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string) {
    return this.httpService.POSTBG<T>(request, responseType, callBack, contentType);
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Chiamata PUT, interrotta automaticamente al cambio di rotta.
   * @param request      :richiesta http (url, query params, body, headers)
   * @param responseType :tipo di risposta RESPONSE_TYPE
   * @param callBack     :funzione invocata all'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   * @returns Observable che emette la HttpResponse completa
   */
  put<T>(request: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string) {
    return this.httpService.PUT<T>(request, responseType, callBack, contentType);
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Chiamata PUT in background, NON interrotta dal cambio di rotta.
   * @param request      :richiesta http (url, query params, body, headers)
   * @param responseType :tipo di risposta RESPONSE_TYPE
   * @param callBack     :funzione invocata all'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   * @returns Observable che emette la HttpResponse completa
   */
  putBg(request: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string) {
    return this.httpService.PUTBG(request, responseType, callBack, contentType);
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Chiamata PATCH, interrotta automaticamente al cambio di rotta.
   * @param request      :richiesta http (url, query params, body, headers)
   * @param responseType :tipo di risposta RESPONSE_TYPE
   * @param callBack     :funzione invocata all'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   * @returns Observable che emette la HttpResponse completa
   */
  patch(request: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string) {
    return this.httpService.PATCH(request, responseType, callBack, contentType);
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Chiamata PATCH in background, NON interrotta dal cambio di rotta.
   * @param request      :richiesta http (url, query params, body, headers)
   * @param responseType :tipo di risposta RESPONSE_TYPE
   * @param callBack     :funzione invocata all'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   * @returns Observable che emette la HttpResponse completa
   */
  patchBg(request: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string) {
    return this.httpService.PATCHBG(request, responseType, callBack, contentType);
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Chiamata DELETE, interrotta automaticamente al cambio di rotta.
   * @param request      :richiesta http (url, query params, body, headers)
   * @param responseType :tipo di risposta RESPONSE_TYPE
   * @param callBack     :funzione invocata all'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   * @returns Observable che emette la HttpResponse completa
   */
  delete(request: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string) {
    return this.httpService.DELETE(request, responseType, callBack, contentType);
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Ritorna il Subject legato alla progressione di una chiamata HTTP (utile per barre di avanzamento di upload/download).
   * @param idAjax :id della chiamata ajax, restituito dalla callBack delle chiamate
   * @returns Subject che emette gli aggiornamenti di avanzamento; in caso di errore lancia un ErrorBean
   */
  getProgression(idAjax: string): Subject<any> {
    try {
      return this.httpService.TAILAJXCALL(idAjax) as Subject<any>;
    } catch (error) {
      throw this.toErrorBean(error);
    }
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Esempio di chiamata HTTP verso file mock.
   * @param p1 :valore del parametro 'api' dell'url mock
   * @param p2 :valore del parametro 'files' dell'url mock
   * @returns Observable che emette il contenuto del file mock (ArrayBuffer) e poi completa
   */
  callMock(p1: string, p2: string): Observable<ArrayBuffer> {
    return new Observable<ArrayBuffer>((observer) => {
      const request: PlHttpRequest = new PlHttpRequest(
        { url: environment.http.api.mock, mocked: true },
        { api: 'api', files: 'files' } as unknown as JSON,
        { api: p1, files: p2 } as unknown as JSON,
        null,
      );

      this.httpService
        .GETFILE(request, RESPONSE_TYPE.ARRAYBUFFER, undefined, CONTENT_TYPE.JSON)
        .subscribe(
          (response: HttpResponse<ArrayBuffer>) => {
            observer.next(response.body as ArrayBuffer);
            observer.complete();
          },
          (error: unknown) => {
            observer.error(error);
          },
        );
    });
  }


  <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Esempio di chiamata Microsoft Graph: legge il profilo (/me) dell'utente autenticato.
   * @returns Promise con il displayName dell'utente, stringa vuota se assente; in caso di errore lancia un ErrorBean
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Registra i listener degli eventi broadcast core (rete, errori, cache HTTP, eventi Azure se abilitati, errori ajax).
   * Viene invocato una sola volta dal costruttore.
   */
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Gestisce gli errori ajax notificati via broadcast: con login Azure e stato 401 avvia di nuovo la login, altrimenti li registra nel log.
   * @param error :dettaglio dell'evento di errore ajax (contiene ad esempio lo status http)
   */
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Converte un errore generico in un ErrorBean di sistema.
   * @param error :errore originale (Error, stringa o oggetto con message)
   * @returns ErrorBean con il messaggio estratto dall'errore
   */
  private toErrorBean(error: unknown):  ErrorBean {
    const message = this.getErrorMessage(error);

    return new  ErrorBean(
      message,
       ErrorCode.SYSTEMERRORCODE,
      false,
      true,
    );
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Estrae un messaggio testuale da un errore di tipo qualsiasi.
   * @param error :errore originale (Error, stringa o oggetto con message)
   * @returns messaggio dell'errore, oppure un messaggio generico se non ricavabile
   */
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Registra un messaggio di debug (logger advanced oppure console.debug).
   * @param message :messaggio descrittivo
   * @param payload :dati da allegare (opzionale)
   */
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Registra un avviso (logger advanced oppure console.warn).
   * @param message :messaggio descrittivo
   * @param payload :dati da allegare (opzionale)
   */
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Registra un errore (logger advanced oppure console.error).
   * @param message :messaggio descrittivo
   * @param payload :dati o errore originale da allegare (opzionale)
   */
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
