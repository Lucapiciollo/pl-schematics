import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { appInit, appInitSuccess } from './app.actions';

@Injectable()
export class AppEffects {
  init$ = createEffect(function(this: AppEffects) {
    return this.actions$.pipe(
      ofType(appInit),
      map(function() {
        return appInitSuccess();
      }),
    );
  });

  constructor(private actions$: Actions) {}
}