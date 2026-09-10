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
@Injectable({ providedIn: "root" })
export class  RouteFakeGuard implements CanActivate {
    constructor(
      public auth:  AuthService,
      public router: Router,
      <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
      private msalGuard: MsalGuard,
      <% } %>
    ) { }
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