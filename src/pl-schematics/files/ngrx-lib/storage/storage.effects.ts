import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import {
  storageClear,
  storageHydrate,
  storageHydrateSuccess,
  storageSetLanguage,
  storageSetTheme,
  storageSetToken,
} from './storage.actions';
import { selectStorageState } from './storage.selectors';
import { StorageState } from './storage.state';
import { StorageService } from './storage.service';

/**
 * @author l.piciollo
 * Effect di esempio per lo slice 'storage': dimostra il pattern classico
 * "hydrate all'avvio + persist ad ogni modifica" appoggiandosi ad un servizio
 * dedicato (StorageService) invece di leggere/scrivere localStorage
 * direttamente da reducer o componenti (i reducer devono restare puri).
 *
 * Usa questo stesso schema (state + actions + reducer + selectors + effects,
 * un file per ciascuno) come TEMPLATE per aggiungere una nuova feature NgRx:
 * 1. Definisci lo shape in <feature>.state.ts
 * 2. Definisci le azioni in <feature>.actions.ts
 * 3. Gestisci le transizioni di stato (pure) in <feature>.reducer.ts
 * 4. Esponi i dati derivati in <feature>.selectors.ts
 * 5. Gestisci gli side-effect (chiamate HTTP, localStorage, ecc.) qui
 * 6. Registra reducer/effect in root.reducers.ts / root.effects.ts
 */
@Injectable()
export class StorageEffects {
  /** Alla dispatch di storageHydrate, legge lo stato persistito e lo ripubblica. */
  hydrate$ = createEffect(() => this.actions$.pipe(
    ofType(storageHydrate),
    map(() => storageHydrateSuccess(this.storageService.load())),
  ));

  /**
   * Ad ogni modifica dello slice 'storage' (token/language/theme), persiste lo
   * stato aggiornato. Non e' agganciato a hydrate/hydrateSuccess/clear per
   * evitare di ri-salvare cio' che e' appena stato letto o appena cancellato.
   */
  persist$ = createEffect(() => this.actions$.pipe(
    ofType(storageSetToken, storageSetLanguage, storageSetTheme),
    withLatestFrom(this.store.select(selectStorageState)),
    tap(([, state]: [unknown, StorageState]) => this.storageService.save(state)),
  ), { dispatch: false });

  /** Alla dispatch di storageClear, rimuove lo stato persistito. */
  clear$ = createEffect(() => this.actions$.pipe(
    ofType(storageClear),
    tap(() => this.storageService.clear()),
  ), { dispatch: false });

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
    private readonly storageService: StorageService,
  ) {}
}
