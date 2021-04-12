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
 

import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { <%=classify(prefixClass)%>HttpService } from 'src/app/<%=namePackage%>/core/service/http.service';
import { <%=classify(prefixClass)%>ErrorBean, <%=classify(prefixClass)%>ErrorCode } from 'src/app/<%=namePackage%>/core/bean/error-bean';
<% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") { %>
import { MsalService, BroadcastService } from '@azure/msal-angular';
import { User } from 'msal';
import {PlCoreUtils} from 'pl-core-utils-library';
import { CORE_TYPE_EVENT } from '../type/type.event';
<%}%>  
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
export class <%=classify(prefixClass)%>AuthService {
 
    constructor(<% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") { %> private authService: MsalService, public broadcastService: BroadcastService, <% } %>   private httpService: <%=classify(prefixClass)%>HttpService, public injector: Injector) {    
    }
  /************************************************************************************************************************* */
  /**
   * @author l.piciollo
   * il metodo viene chimato in autonomia dal sistema core, si registra a degli eventi di intercettazione di azure
   * in caso questo venga attivato.. qul'ora sia abilitato l'autenticatore, e si ha un ko qui, che indica l'utente non è 
   * loggato.. il sistema viene rediretto alla login di azure o altro providere scelto
   */
  public login(): Observable <boolean> {
    
    <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") {%>
      return new Observable<boolean>(observer => {

        /**registrazione ad eventi lanciati dalla libreria azure per il controllo della login */
        this.broadcastService.subscribe("msal:acquireTokenFailure", (error) => {
          observer.error(new <%=classify(prefixClass)%>ErrorBean("User not present.. ", <%=classify(prefixClass)%>ErrorCode.SYSTEMERRORCODE, false, false));
        })
        /**registrazione ad eventi lanciati dalla libreria azure per il controllo della login */
        this.broadcastService.subscribe("msal:loginFailure", (error) => {
          observer.error(new <%=classify(prefixClass)%>ErrorBean("User not present.. ", <%=classify(prefixClass)%>ErrorCode.SYSTEMERRORCODE, false, false));
        })
        /**registrazione ad eventi lanciati dalla libreria azure per il controllo della login */
        this.broadcastService.subscribe("msal:stateMismatch", (error) => {
          observer.error(new <%=classify(prefixClass)%>ErrorBean("User not present.. ", <%=classify(prefixClass)%>ErrorCode.SYSTEMERRORCODE, false, false));
        })
        /**registrazione ad eventi lanciati dalla libreria azure per il controllo della login */
        this.broadcastService.subscribe("msal:acquireTokenSuccess", (OK) => {
          PlCoreUtils.Broadcast().execEvent(CORE_TYPE_EVENT.CORE_ACQUIRE_TOKEN_SUCCESS, OK);
        })
        /**registrazione ad eventi lanciati dalla libreria azure per il controllo della login */
        this.broadcastService.subscribe("msal:loginSuccess", (OK) => {
          PlCoreUtils.Broadcast().execEvent(CORE_TYPE_EVENT.CORE_LOGIN_SUCCESS, OK);
          observer.next(true);
          observer.complete();
        })
        /**sottoscrizione al servizio di login, viene controllato se esiste l'utente in sessione, in caso viene fatta la redirect
         * alla login.. occorre iscriveri a questo osservatore per scatenare la routine.
         */       
    
        const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;
        if (isIE) {
          this.authService.loginRedirect({ scopes: ['user.read', 'openid', 'profile' ] });
        } else {
          this.authService.loginPopup({ scopes: ['user.read', 'openid', 'profile' ] });
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
    } catch (error) { 
      throw new <%=classify(prefixClass)%>ErrorBean(error.message, <%=classify(prefixClass)%>ErrorCode.SYSTEMERRORCODE, false, true)
    }
  }
  /************************************************************************************************************************* */


}
