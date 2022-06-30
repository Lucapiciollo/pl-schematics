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
<% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") { %>
import { MsalGuard } from '@azure/msal-angular';
<%}  %>  
import { <%=classify(prefixClass)%>AuthService } from './auth.service';
@Injectable({ providedIn: "root" })
export class <%=classify(prefixClass)%>RouteFakeGuard implements CanActivate {
    constructor(public auth: <%=classify(prefixClass)%>AuthService, public router: Router, private msalGuard: MsalGuard) { }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return <%=classify(prefixClass)%>AuthService.applicationType.type == "web" ?  <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") { %> this.msalGuard.canActivate(route, state) : true <%} else { %> true:true  <% } %> ;
    }
}

