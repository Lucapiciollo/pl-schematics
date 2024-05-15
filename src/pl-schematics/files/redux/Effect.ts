import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { exhaustMap, map, of } from 'rxjs';
import { AppModelActionEf } from './Action';

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




  private test = createEffect(() => this.actions.pipe(
    ofType(AppModelActionEf.test),
    exhaustMap(({ test }) =>
      of().pipe(
        map(({ test }) => null)
      ))));


}



