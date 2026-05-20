/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-22 16:59:27
 * @modify date 2026-05-20
 * @desc [
 * Servizio per la centralizzazione dell'autenticazione utente.
 * Predispone login, logout, recupero token e integrazione Azure/Teams quando configurata.
 * ]
 */

import { Injectable } from '@angular/core';
import { Observable, Subscriber, interval } from 'rxjs';
import { take } from 'rxjs/operators';

import { <%= classify(prefixClass) %>ErrorBean, <%= classify(prefixClass) %>ErrorCode } from 'src/app/<%= namePackage %>/core/bean/error-bean';

<% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
import { HttpParams } from '@angular/common/http';
import { AuthenticationProvider, AuthenticationProviderOptions } from '@microsoft/microsoft-graph-client';
import { BroadcastService, MsalService } from '@azure/msal-angular';
import { Context } from '@microsoft/teams-js';
import * as microsoftTeams from '@microsoft/teams-js';

import { PlCoreUtils } from 'pl-core-utils-library';

import { environment } from 'src/environments/environment';
import { <%= classify(prefixClass) %>Utils } from 'src/app/<%= namePackage %>/shared/utils/utils';
import { CORE_TYPE_EVENT } from 'src/app/<%= namePackage %>/core/type/type.event';
<% } else { %>
import { AuthenticationProviderOptions } from '@microsoft/microsoft-graph-client';
<% } %>

<% if (logging === "advanced") { %>
import { <%= classify(prefixClass) %>LoggerFeature } from 'src/app/<%= namePackage %>/core/logging/<%= dasherize(namePackage) %>-logger-feature.enum';
import { <%= classify(prefixClass) %>LoggerService } from 'src/app/<%= namePackage %>/core/logging/<%= dasherize(namePackage) %>-logger.service';
<% } %>

export interface <%= classify(prefixClass) %>AuthTokenResponse {
  accessToken: string | null;
  idToken: string | null;
  raw?: any;
}

<% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
export interface <%= classify(prefixClass) %>MsalTokenState {
  retrievLogin: any;
  retrievAccessTokenObject: any;
  retrievIdTokenObject: any;
}
<% } %>

@Injectable({
  providedIn: 'root',
})
export class <%= classify(prefixClass) %>AuthService<% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %> implements AuthenticationProvider<% } %> {
  <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
  public static teamContext: Context | null = null;

  public static applicationType: { type: string | null } = {
    type: '',
  };

  public static idToken: string | null = null;

  public static objectResponseMsal: <%= classify(prefixClass) %>MsalTokenState = {
    retrievLogin: null,
    retrievAccessTokenObject: null,
    retrievIdTokenObject: null,
  };
  <% } %>

  public static loginObject: any = null;

  constructor(
    <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
    private readonly authService: MsalService,
    private readonly broadcastService: BroadcastService,
    <% } %>
    <% if (logging === "advanced") { %>
    private readonly logger: <%= classify(prefixClass) %>LoggerService,
    <% } %>
  ) {}

  /**
   * Metodo richiesto da Microsoft Graph AuthenticationProvider.
   */
  getAccessToken(
    authenticationProviderOptions?: AuthenticationProviderOptions,
  ): Promise<string> {
    <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
    const tokenObject =
      <%= classify(prefixClass) %>AuthService.objectResponseMsal.retrievAccessTokenObject;

    const token =
      tokenObject && tokenObject.accessToken
        ? String(tokenObject.accessToken)
        : '';

    return Promise.resolve(token);
    <% } else { %>
    return Promise.resolve('');
    <% } %>
  }

  /**
   * Entry point di login usato dagli initializer.
   */
  public login(): Observable<boolean> {
    <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
    return new Observable<boolean>((observer: Subscriber<boolean>) => {
      try {
        const type = this.resolveApplicationTypeFromUrl();
        <%= classify(prefixClass) %>AuthService.applicationType.type = type;

        if (type === 'teams') {
          this.contextTeams(observer);
          return;
        }

        this.ssoActiveDirectory(observer);
      } catch (error) {
        observer.error(this.toErrorBean(error));
      }
    });
    <% } else { %>
    return new Observable<boolean>((observer: Subscriber<boolean>) => {
      /**
       * Login disabilitata.
       * Il sistema emula l'utente autenticato e consente lo start applicativo.
       *
       * Qui puoi innestare un SSO custom:
       * - observer.next(true) + observer.complete() in caso OK
       * - observer.error(...) in caso KO
       */
      <%= classify(prefixClass) %>AuthService.loginObject = {
        authenticated: true,
        provider: 'none',
      };

      observer.next(true);
      observer.complete();
    });
    <% } %>
  }

  public logout(): void {
    try {
      <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
      this.authService.logout();
      <% } else { %>
      <%= classify(prefixClass) %>AuthService.loginObject = null;
      this.logDebug('Logout called without authentication provider');
      <% } %>
    } catch (error) {
      throw this.toErrorBean(error);
    }
  }

  <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
  private ssoActiveDirectory(observer: Subscriber<boolean>): void {
    this.registerMsalEvents(observer);

    const isIE =
      window.navigator.userAgent.indexOf('MSIE ') > -1 ||
      window.navigator.userAgent.indexOf('Trident/') > -1;

    this.authService
      .acquireTokenSilent({
        scopes: environment.azure.scope.consentScopes,
        loginHint: '...',
      })
      .then((response: any) => {
        this.storeMsalTokenResponse(response);
        observer.next(true);
        observer.complete();
      })
      .catch(() => {
        if (isIE) {
          this.authService.loginRedirect({
            scopes: environment.azure.scope.consentScopes,
          });

          return;
        }

        this.loginPopup(observer);
      });
  }

  private loginPopup(observer: Subscriber<boolean>): void {
    this.authService
      .loginPopup({
        scopes: environment.azure.scope.consentScopes,
      })
      .then((response: any) => {
        const loginHint =
          response && response.account && response.account.userName
            ? response.account.userName
            : undefined;

        this.acquireTokenAfterPopup(observer, loginHint);
      })
      .catch((error: any) => {
        observer.error(this.toErrorBean(error));
      });
  }

  private acquireTokenAfterPopup(
    observer: Subscriber<boolean>,
    loginHint?: string,
  ): void {
    this.authService
      .acquireTokenSilent({
        scopes: environment.azure.scope.consentScopes,
        loginHint: loginHint,
      })
      .then((response: any) => {
        this.storeMsalTokenResponse(response);
        observer.next(true);
        observer.complete();
      })
      .catch(() => {
        this.authService
          .acquireTokenPopup({
            scopes: environment.azure.scope.consentScopes,
            loginHint: loginHint,
          })
          .then((response: any) => {
            this.storeMsalTokenResponse(response);
            observer.next(true);
            observer.complete();
          })
          .catch((error: any) => {
            observer.error(this.toErrorBean(error));
          });
      });
  }

  private contextTeams(observer: Subscriber<boolean>): void {
    try {
      microsoftTeams.initialize(() => {
        microsoftTeams.authentication.getAuthToken({
          successCallback: (token: string) => {
            <%= classify(prefixClass) %>AuthService.idToken = token;

            const decodedToken: any = <%= classify(prefixClass) %>Utils.decodeJwtToken(token);
            const expireTime = this.resolveTokenExpireTime(decodedToken);

            if (expireTime > 0) {
              this.scheduleTeamsTokenRefresh(expireTime);
            }

            microsoftTeams.getContext((context: Context) => {
              <%= classify(prefixClass) %>AuthService.teamContext = context;
              observer.next(true);
              observer.complete();
            });
          },
          failureCallback: (error: string) => {
            <%= classify(prefixClass) %>AuthService.teamContext = null;
            observer.error(this.toErrorBean(error));
          },
        });
      });
    } catch (error) {
      observer.error(this.toErrorBean(error));
    }
  }

  public scheduleTeamsTokenRefresh(time: number): void {
    interval(time)
      .pipe(take(1))
      .subscribe(() => {
        microsoftTeams.authentication.getAuthToken({
          successCallback: (token: string) => {
            <%= classify(prefixClass) %>AuthService.idToken = token;

            const decodedToken: any = <%= classify(prefixClass) %>Utils.decodeJwtToken(token);
            const expireTime = this.resolveTokenExpireTime(decodedToken);

            if (expireTime > 0) {
              this.scheduleTeamsTokenRefresh(expireTime);
            }
          },
          failureCallback: () => {
            <%= classify(prefixClass) %>AuthService.teamContext = null;
          },
        });
      });
  }

  private registerMsalEvents(observer: Subscriber<boolean>): void {
    this.broadcastService.subscribe('msal:acquireTokenFailure', (error: any) => {
      this.logError('MSAL acquire token failure', error);
    });

    this.broadcastService.subscribe('msal:loginFailure', (error: any) => {
      this.logError('MSAL login failure', error);
    });

    this.broadcastService.subscribe('msal:stateMismatch', () => {
      observer.error(
        new <%= classify(prefixClass) %>ErrorBean(
          'User not present.',
          <%= classify(prefixClass) %>ErrorCode.SYSTEMERRORCODE,
          false,
          false,
        ),
      );
    });

    this.broadcastService.subscribe('msal:acquireTokenSuccess', (response: any) => {
      PlCoreUtils.Broadcast().execEvent(
        CORE_TYPE_EVENT.CORE_ACQUIRE_TOKEN_SUCCESS,
        response,
      );
    });

    this.broadcastService.subscribe('msal:loginSuccess', (response: any) => {
      PlCoreUtils.Broadcast().execEvent(
        CORE_TYPE_EVENT.CORE_LOGIN_SUCCESS,
        response,
      );

      <%= classify(prefixClass) %>AuthService.objectResponseMsal.retrievLogin = {
        ...response,
      };
    });
  }

  private storeMsalTokenResponse(response: any): void {
    if (!response) {
      return;
    }

    if (response.tokenType === 'id_token') {
      <%= classify(prefixClass) %>AuthService.objectResponseMsal.retrievIdTokenObject = {
        ...response,
      };

      return;
    }

    <%= classify(prefixClass) %>AuthService.objectResponseMsal.retrievAccessTokenObject = {
      ...response,
    };
  }

  private resolveApplicationTypeFromUrl(): string {
    const url = window.location.href;
    const queryString = url.indexOf('?') >= 0 ? url.split('?')[1] : '';
    const httpParams = new HttpParams({ fromString: queryString });
    const type = httpParams.get('type');

    return type || 'web';
  }

  private resolveTokenExpireTime(decodedToken: any): number {
    if (!decodedToken || !decodedToken.exp) {
      return 0;
    }

    return decodedToken.exp * 1000 - new Date().getTime();
  }
  <% } %>

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

    return 'Unexpected authentication error';
  }

  private logDebug(message: string, payload?: unknown): void {
    <% if (logging === "advanced") { %>
    this.logger.debug(
      <%= classify(prefixClass) %>LoggerFeature.AUTH,
      message,
      payload,
    );
    <% } else { %>
    console.debug(message, payload);
    <% } %>
  }

  private logError(message: string, payload?: unknown): void {
    <% if (logging === "advanced") { %>
    this.logger.error(
      <%= classify(prefixClass) %>LoggerFeature.AUTH,
      message,
      payload,
    );
    <% } else { %>
    console.error(message, payload);
    <% } %>
  }
}