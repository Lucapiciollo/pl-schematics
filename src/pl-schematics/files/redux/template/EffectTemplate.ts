import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AppModelAction } from '@redux/Action';
import { combineLatest, exhaustMap, map, of, switchMap, take, throttleTime, zip } from 'rxjs';
//@importModel@

/**
 * @author l.piciollo
 * effect for login
 */
@Injectable({ providedIn: 'root' })
export class EffectServiceModel {
  private actions: Actions = inject(Actions);

  /************************************************************************************************************************************************************************ */

  constructor() { }

  /************************************************************************************************************************************************************************ */


  //@effects@
 
}



