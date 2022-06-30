/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-22 16:59:27
 * @modify date 2019-12-22 16:59:27
 * @desc [* Classe per la centralizzazione dell'autenticazione utente.. sono predisposti i metodi di login, logaut, risalire allo user e al suo token]
 *
 * Classe per la centralizzazione dell'autenticazione utente.. sono predisposti i metodi di login ,logaut e per risalire allo user
 * autenticato ed al rispettivo token.
 * 
 * ATTENZIONE, NON SI CONSIGLIA LA MODIFICA DI QUESTA CLASSE A CAUSA DI OSSERVATORI ESTERNI CHE NE FANNO USO SPECIFICO.
 * E' POSSIBILE RICHIAMARE I METODI DEL SERVIZIO TRANQUILLAMENTE DA UNA CLASSE DI UTILIY PERSONALE, E GESTIRE IL RISULTATO IN AUTONOMIA
 */
 
 import {  <%=classify(prefixClass)%>Utils } from '../../shared/utils/utils';
import { Injectable, Injector } from '@angular/core';
import { Observable, Subscriber,interval } from 'rxjs';
import { <%=classify(prefixClass)%>HttpService } from 'src/app/<%=namePackage%>/core/service/http.service';
import { environment } from 'src/environments/environment';
import * as microsoftTeams from "@microsoft/teams-js";
import { <%=classify(prefixClass)%>ErrorBean, <%=classify(prefixClass)%>ErrorCode } from 'src/app/<%=namePackage%>/core/bean/error-bean';
<% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") { %>
import { MsalService, BroadcastService } from '@azure/msal-angular';
 import {PlCoreUtils} from 'pl-core-utils-library';
import { CORE_TYPE_EVENT } from '../type/type.event';
import { AuthenticationProvider, AuthenticationProviderOptions, Client, ClientOptions } from '@microsoft/microsoft-graph-client';

<%} else { %>  
  import { AuthenticationProviderOptions } from '@microsoft/microsoft-graph-client';
<% } %>

import { HttpParams } from '@angular/common/http';
import { Context } from '@microsoft/teams-js';
import { take } from 'rxjs/operators';
/**
 * @author l.piciollo
 * Classe per la centralizzazione dell'autenticazione utente.. sono predisposti i metodi di login, logaut, risalire allo user e al suo token
 * 
 * Classe per la centralizzazione dell'autenticazione utente.. sono predisposti i metodi di login ,logaut e per risalire allo user
 * autenticato ed al rispettivo token.
 * ATTENZIONE, NON SI CONSIGLIA LA MODIFICA DI QUESTA CLASSE A CAUSA DI OSSERVATORI ESTERNI CHE NE FANNO USO SPECIFICO.
 * E' POSSIBILE RICHIAMARE I METODI DEL SERVIZIO TRANQUILLAMENTE DA UNA CLASSE DI UTILIY PERSONALE, E GESTIRE IL RISULTATO IN AUTONOMIA
 */
@Injectable({
  providedIn: 'root',
})
export class <%=classify(prefixClass)%>AuthService<% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") { %> implements AuthenticationProvider <%}%>  {
 
  public static teamContext: Context|null = null;
  public static applicationType: { type: string|null } = { type: "" };
  public static idToken: string;
  public static loginObject: any = null;

    constructor(<% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") { %> private authService: MsalService, public broadcastService: BroadcastService, <% } %>   private httpService: <%=classify(prefixClass)%>HttpService, public injector: Injector) {    
    }
  /************************************************************************************************************************* */

 
  <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") {%>

    public static objectResponseMsal: { retrievLogin: any, retrievAccessTokenObject: any, retrievIdTokenObject: any } = { retrievLogin: null, retrievAccessTokenObject: null, retrievIdTokenObject: null };

 
    getAccessToken(authenticationProviderOptions?: AuthenticationProviderOptions): Promise<string> {
      return new Promise<string>((token) => {
        token( <%=classify(prefixClass)%>AuthService.objectResponseMsal.retrievAccessTokenObject.accessToken)
      })
    };

    
    <% } 
  /************************************************************************************************************************* */

  private async ssoActiveDirectory(observer: Subscriber<boolean>) {
    try {
      <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") {%>
        this.broadcastService.subscribe("msal:acquireTokenFailure", (error) => { })
        this.broadcastService.subscribe("msal:loginFailure", (error) => {
        })
        this.broadcastService.subscribe("msal:stateMismatch", (error) => {
          observer.error(new  <%=classify(prefixClass)%>ErrorBean("User not present.. ", <%=classify(prefixClass)%>ErrorCode.SYSTEMERRORCODE, false, false));
        })
        this.broadcastService.subscribe("msal:acquireTokenSuccess", (response) => {
          PlCoreUtils.Broadcast().execEvent(CORE_TYPE_EVENT.CORE_ACQUIRE_TOKEN_SUCCESS, response);

        })

        this.broadcastService.subscribe("msal:loginSuccess", (response) => {
          PlCoreUtils.Broadcast().execEvent(CORE_TYPE_EVENT.CORE_LOGIN_SUCCESS, response);
          <%=classify(prefixClass)%>AuthService.objectResponseMsal.retrievLogin = { ...response };
        })

        const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;
        this.authService.acquireTokenSilent({ scopes: environment.azure.scope.consentScopes, loginHint: "..." }).then(response => {
          response.tokenType == "id_token" ?   <%=classify(prefixClass)%>AuthService.objectResponseMsal.retrievIdTokenObject = { ...response } :   <%=classify(prefixClass)%>AuthService.objectResponseMsal.retrievAccessTokenObject = { ...response };
          observer.next(true);
          observer.complete();
        }).catch(e => {
          if (isIE) {
            this.authService.loginRedirect({ scopes: environment.azure.scope.consentScopes });
          } else {
            this.authService.loginPopup({ scopes: environment.azure.scope.consentScopes }).then(response => {
              this.authService.acquireTokenSilent({ scopes: environment.azure.scope.consentScopes, loginHint: response.account.userName }).then(response => {
                response.tokenType == "id_token" ?   <%=classify(prefixClass)%>AuthService.objectResponseMsal.retrievIdTokenObject = { ...response } :  <%=classify(prefixClass)%>AuthService.objectResponseMsal.retrievAccessTokenObject = { ...response };
                observer.next(true);
                observer.complete();
              }).catch(e => {
                this.authService.acquireTokenPopup({ scopes: environment.azure.scope.consentScopes, loginHint: response.account.userName }).then(response => {
                  response.tokenType == "id_token" ?   <%=classify(prefixClass)%>AuthService.objectResponseMsal.retrievIdTokenObject = { ...response } :  <%=classify(prefixClass)%>AuthService.objectResponseMsal.retrievAccessTokenObject = { ...response };
                  observer.next(true);
                  observer.complete();
                })
              })

            })
          }
        })
      <% } else { %>
        
        observer.next(true);
        observer.complete();

      <% } %>

     } catch (error: any) {
      throw new <%=classify(prefixClass)%>ErrorBean(error.message, <%=classify(prefixClass)%>ErrorCode.SYSTEMERRORCODE, false, true)
    }
  }

 


  /************************************************************************************************************************* */
  private contextTeams(observer: Subscriber<boolean>) {
    try {
      microsoftTeams.initialize(() => {
        <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") {%>
        microsoftTeams.authentication.getAuthToken({
          successCallback: (token) => {
            <%=classify(prefixClass)%>AuthService.idToken = token;
            const decodetToken: any = <%=classify(prefixClass)%>Utils.decodeJwtToken(token)
            const expireTime = (decodetToken.exp * 1000) - new Date().getTime();
            this.getToken(expireTime);
            microsoftTeams.getContext((context) => {
              <%=classify(prefixClass)%>AuthService.teamContext = context;
              observer.next(true);
              observer.complete();
            });
          },
          failureCallback: (error) => {
            <%=classify(prefixClass)%>AuthService.teamContext = null;
            observer.error(true);
          }
        });
        <% } %>
      });
     } catch (error: any) {
      throw new <%=classify(prefixClass)%>ErrorBean(error.message, <%=classify(prefixClass)%>ErrorCode.SYSTEMERRORCODE, false, true)
    }
  }




  /**
   * @author l.piciollo
   * il metodo viene chimato in autonomia dal sistema core, si registra a degli eventi di intercettazione di azure
   * in caso questo venga attivato.. qul'ora sia abilitato l'autenticatore, e si ha un ko qui, che indica l'utente non è 
   * loggato.. il sistema viene rediretto alla login di azure o altro providere scelto
   */
  public login(): Observable <boolean> {
    
    <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") {%>

      return new Observable<boolean>(observer => {
        const url = window.location.href;
        const httpParams = new HttpParams({ fromString: url.split('?')[1] });
        if (httpParams.get("type") != null) {
          <%=classify(prefixClass)%>AuthService.applicationType.type = httpParams.get("type");
        } else
        <%=classify(prefixClass)%>AuthService.applicationType.type = "web";
        if ( <%=classify(prefixClass)%>AuthService.applicationType.type == "teams") {
          this.contextTeams(observer);
        } else {
          this.ssoActiveDirectory(observer);
        }
      });

 

      <% } else { %>
      /**
       * @author l.piciollo
       * in caso di login disabilitata, il sistema emula l'utente loggato e da il consenso allo start applicativo
       */
     return new Observable<boolean>(observer => {
      /** 
       * @author l.piciollo 
       * è possibile inseire qui il processo di autenticazione ad un SSO qualsiasi.. 
       * ricevuto l'OK lanciare i due metodi sotto per sbloccare la creazione del portale.. in caso di KO 
       * lanciare :  observer.error() e il portale non si avvia.
       */
      observer.next(true);
      observer.complete()
    });
    <% } %>
  };
  /************************************************************************************************************************* */
  /**
   * @author l.piciollo
   * funzionalità predisposta per il logout, viene invocato il servizio di azure
   */
  public logout() { 
    try {
      <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") { %>
        this.authService.logout();
      <% } else { %>
        console.log("Logout called...")
      <% } %>  
    } catch (error:any) { 
      throw new <%=classify(prefixClass)%>ErrorBean(error.message, <%=classify(prefixClass)%>ErrorCode.SYSTEMERRORCODE, false, true)
    }
  }
  <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") {%>
  /************************************************************************************************************************* */
   
  /**
   * @time token expiration in ms
   * Creates an rxjs's interval. After getting the new token make the recursive call with the new time in ms for refresh token.   */
   public getToken(time): void {
    let interval$ = interval(time);
    let intervalForToken = interval$.pipe(take(1));
    intervalForToken.subscribe(() => {
      microsoftTeams.authentication.getAuthToken({
        successCallback: (token) => {
          <%=classify(prefixClass)%>AuthService.idToken = token;
          const decodetToken: any = <%=classify(prefixClass)%>Utils.decodeJwtToken(token)
          const expireTime = (decodetToken.exp * 1000) - new Date().getTime();
          this.getToken(expireTime);
        },
        failureCallback: (error) => {
          <%=classify(prefixClass)%>AuthService.teamContext = null;
        }
      })
    })
  }


 <% } %>
}
