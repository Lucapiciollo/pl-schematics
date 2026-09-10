import { isDevMode, NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { appInit } from './app/app.actions';
import { storageHydrate } from './storage/storage.actions';
import { rootEffects } from './root.effects';
import { rootReducers } from './root.reducers';
import { RootState } from './root.state';

@NgModule({
  imports: [
    StoreModule.forRoot(rootReducers),
    EffectsModule.forRoot(rootEffects),
    /**
     * @author l.piciollo
     * Redux DevTools va abilitato solo in sviluppo: in produzione appesantisce
     * inutilmente il bundle/runtime e puo' esporre lo stato applicativo.
     */
    ...(isDevMode() ? [StoreDevtoolsModule.instrument({ maxAge: 25 })] : []),
  ],
  exports: [
    StoreModule,
    EffectsModule,
    StoreDevtoolsModule,
  ],
})
export class StateModule {
  /**
   * @author l.piciollo
   * Bootstrap di esempio dello stato applicativo, cosi' che gli slice 'app' e
   * 'storage' gia' pronti funzionino davvero appena il modulo viene caricato,
   * senza richiedere all'utente di ricordarsi di dispatchare nulla a mano:
   * - storageHydrate(): fa leggere a StorageEffects.hydrate$ lo stato
   *   persistito in precedenza (token/lingua/tema) da localStorage.
   * - appInit(): segnala l'avvio applicativo (AppEffects.init$ lo trasforma
   *   subito in appInitSuccess(); e' il punto in cui agganciare un vero
   *   caricamento asincrono, se necessario, prima di segnalare il successo).
   *
   * Aggiungendo una nuova feature NgRx, valuta se le serve un bootstrap
   * analogo e dispatchalo qui.
   */
  constructor(private readonly store: Store<RootState>) {
    this.store.dispatch(storageHydrate());
    this.store.dispatch(appInit());
  }
}