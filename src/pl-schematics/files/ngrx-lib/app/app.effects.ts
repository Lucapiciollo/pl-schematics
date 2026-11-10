import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { appInit, appInitSuccess } from './app.actions';

/**
 * @author l.piciollo
 * Effects NgRx dello slice app: reagiscono alle action di inizializzazione applicativa.
 */
@Injectable()
export class AppEffects {
  /**
   * inject() (e non parameter property del costruttore): i campi con gli effect vengono
   * inizializzati PRIMA delle parameter property, quindi actions$ sarebbe undefined.
   */
  private readonly actions$ = inject(Actions);

  /**
   * @author l.piciollo
   * Effect: all'action appInit emette subito appInitSuccess. E' il punto in cui agganciare
   * un eventuale caricamento asincrono reale prima di segnalare il successo.
   */
  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appInit),
      map(() => appInitSuccess()),
    ),
  );
}
