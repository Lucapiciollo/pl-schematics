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
import { MsalGuard } from '@azure/msal-angular';
import {  AuthService } from './auth.service';
@Injectable({ providedIn: "root" })
export class  RouteFakeGuard implements CanActivate {
    constructor(public auth:  AuthService, public router: Router, private msalGuard: MsalGuard) { }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return  AuthService.applicationType.type == "web" ?   this.msalGuard.canActivate(route, state) : true;
    }
}