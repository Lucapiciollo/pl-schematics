/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-22 16:59:27
 * @modify date 2019-12-22 16:59:27
 * @desc []
 *
 */
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
<% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
import { MsalGuard } from '@azure/msal-angular';
<% } %>
import {  AuthService } from './auth.service';

/**
 * @author l.piciollo
 * Guardia di rotta (CanActivate) di default dell'applicazione: con login Azure delega alla MsalGuard (solo runtime web),
 * altrimenti e' un placeholder che consente sempre la navigazione. Da sostituire con la logica di protezione rotte desiderata.
 */
@Injectable({ providedIn: "root" })
export class  RouteFakeGuard implements CanActivate {
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