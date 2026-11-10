/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-22 16:59:27
 * @modify date 2019-12-22 16:59:27
 * @desc []
 *
 */
import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  CanActivateChild,
  CanMatch,
  ActivatedRouteSnapshot,
  Route,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
<% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
import { Observable } from 'rxjs';
import { MsalGuard } from '@azure/msal-angular';
<% } %>
import {  AuthService } from './auth.service';

/**
 * @author l.piciollo
 * Guardia di rotta di default dell'applicazione (CanMatch, CanActivate e CanActivateChild): con login Azure delega alla
 * MsalGuard (solo runtime web), altrimenti e' un placeholder che consente sempre la navigazione (ritorna true).
 * Da sostituire con la logica di protezione rotte desiderata. Si usa nelle rotte con `canMatch`, `canActivate` e `canActivateChild`.
 */
@Injectable({ providedIn: "root" })
export class  RouteFakeGuard implements CanMatch, CanActivate, CanActivateChild {
    /**
     * @author l.piciollo
     * Costruttore: inietta i servizi usati dalla guardia.
     * @param auth :servizio di autenticazione applicativo
     * @param router :router Angular
     * @param msalGuard :guardia MSAL (presente solo con login Azure)
     */
    constructor(
      public auth:  AuthService,
      public router: Router,
      <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
      private msalGuard: MsalGuard,
      <% } %>
    ) { }

    /************************************************************************************************************************/

    /**
     * @author l.piciollo
     * Decide se la rotta e' selezionabile dal router (canMatch, valutata prima del caricamento lazy della rotta):
     * con login Azure e runtime web delega alla MsalGuard, altrimenti consente la navigazione (true).
     * @param route :rotta di cui si valuta la corrispondenza
     * @param segments :segmenti dell'url non ancora consumati
     * @returns esito della MsalGuard (con login Azure e runtime web) oppure true
     */
    canMatch(route: Route, segments: UrlSegment[]): <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>Observable<boolean | UrlTree> | boolean<% } else { %>boolean<% } %> {
        <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
        /** MsalGuard.canMatch (msal-angular v3+) non riceve parametri: legge la navigazione corrente dal router. */
        return  AuthService.applicationType.type == "web" ?   this.msalGuard.canMatch() : true;
        <% } else { %>
        /**
         * @author l.piciollo
         * Nessun provider di login configurato: placeholder che non blocca la corrispondenza della rotta.
         */
        return true;
        <% } %>
    }

    /************************************************************************************************************************/

    /**
     * @author l.piciollo
     * Decide se le rotte figlie sono attivabili (canActivateChild): con login Azure e runtime web delega alla MsalGuard,
     * altrimenti consente la navigazione (true).
     * @param childRoute :snapshot della rotta figlia richiesta
     * @param state :snapshot dello stato del router
     * @returns esito della MsalGuard (con login Azure e runtime web) oppure true
     */
    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>Observable<boolean | UrlTree> | boolean<% } else { %>boolean<% } %> {
        <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
        return  AuthService.applicationType.type == "web" ?   this.msalGuard.canActivateChild(childRoute, state) : true;
        <% } else { %>
        return true;
        <% } %>
    }

    /************************************************************************************************************************/

    /**
     * @author l.piciollo
     * Decide se la rotta e' attivabile: con login Azure e runtime web delega alla MsalGuard, altrimenti consente la navigazione.
     * @param route :snapshot della rotta richiesta
     * @param state :snapshot dello stato del router
     * @returns esito della MsalGuard (con login Azure e runtime web) oppure true
     */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
        return  AuthService.applicationType.type == "web" ?   this.msalGuard.canActivate(route, state) : true;
        <% } else { %>
        /**
         * @author l.piciollo
         * Nessun provider di login configurato: la guardia e' un placeholder che non blocca
         * la navigazione. Sostituire con la propria logica di protezione rotte se necessario.
         */
        return true;
        <% } %>
    }
}