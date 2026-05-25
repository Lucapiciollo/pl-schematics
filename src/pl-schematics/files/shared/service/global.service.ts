/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-22 14:22:00
 * @modify date 2026-05-20
 * @desc [
 * Servizio globale dell'applicazione.
 * Centralizza funzionalità comuni, eventi core, errori globali,
 * cache HTTP, redirect e servizi condivisi.
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

import { environment } from 'src/environments/environment';

import {
  <%= classify(prefixClass) %>ErrorBean,
  <%= classify(prefixClass) %>ErrorCode,
} from 'src/app/<%= namePackage %>/core/bean/error-bean';


import { <%= classify(prefixClass) %>HttpService } from 'pl-core-utils-library';
import { CORE_TYPE_EVENT } from 'src/app/<%= namePackage %>/core/type/type.event';

<% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
import { Client } from '@microsoft/microsoft-graph-client';
import { <%= classify(prefixClass) %>AuthService } from 'src/app/<%= namePackage %>/core/service/auth.service';
<% } %>

<% if (logging === "advanced") { %>
import { <%= classify(prefixClass) %>LoggerFeature } from 'src/app/<%= namePackage %>/core/logging/<%= dasherize(namePackage) %>-logger-feature.enum';
import { <%= classify(prefixClass) %>LoggerService } from 'src/app/<%= namePackage %>/core/logging/<%= dasherize(namePackage) %>-logger.service';
<% } %>

@Injectable({
  providedIn: 'root',
})
@PLUnsubscribe()
export class <%= classify(prefixClass) %>GlobalService implements OnDestroy {
  <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
  private graphClient: Client | null = null;
  private readonly authService = inject(<%= classify(prefixClass) %>AuthService);
  <% } %>

  private readonly httpService = inject(<%= classify(prefixClass) %>HttpService);
  private readonly injector = inject(Injector);
  <% if (logging === "advanced") { %>
  private readonly logger = inject(<%= classify(prefixClass) %>LoggerService);
  <% } %>

  constructor(
     
  ) {
    this.registerCoreEvents();
  }

  ngOnDestroy(): void {
    this.logDebug('GlobalService destroyed');
  }

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
        .get(<%= classify(prefixClass) %>AuthService)
        .login()
        .subscribe();

      return;
    }
    <% } %>

    this.logError('HTTP ajax error', error);
  }

  private toErrorBean(error: unknown): <%= classify(prefixClass) %>ErrorBean {
    const message = this.getErrorMessage(error);

    return new <%= classify(prefixClass) %>ErrorBean(
      message,
      <%= classify(prefixClass) %>ErrorCode.SYSTEMERRORCODE,
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
      <%= classify(prefixClass) %>LoggerFeature.APP,
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
      <%= classify(prefixClass) %>LoggerFeature.APP,
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
      <%= classify(prefixClass) %>LoggerFeature.APP,
      message,
      payload,
    );
    <% } else { %>
    console.error(message, payload);
    <% } %>
  }
}