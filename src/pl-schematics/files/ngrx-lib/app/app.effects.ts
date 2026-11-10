import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { appInit, appInitSuccess } from './app.actions';

@Injectable()
export class AppEffects {
  /**
   * inject() (e non parameter property del costruttore): i campi con gli effect vengono
   * inizializzati PRIMA delle parameter property, quindi actions$ sarebbe undefined.
   */
  private readonly actions$ = inject(Actions);

  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appInit),
      map(() => appInitSuccess()),
    ),
  );
}
