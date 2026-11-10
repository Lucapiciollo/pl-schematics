import { isDevMode, NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { appInit } from './app/app.actions';
import { storageHydrate } from './storage/storage.actions';
import { rootEffects } from './root.effects';
import { rootReducers } from './root.reducers';
import { RootState } from './root.state';

/**
 * @author l.piciollo
 * NgModule che configura lo stato applicativo NgRx: store radice, effects e Redux DevTools.
 * Va importato una sola volta nella root dell'applicazione.
 */
@NgModule({
  imports: [
    StoreModule.forRoot(rootReducers),
    EffectsModule.forRoot(rootEffects),
    /**
     * @author l.piciollo
     * Redux DevTools: in produzione (logOnly) non espone lo stato applicativo. La
     * chiamata resta statica (non condizionale) perche' il compilatore AOT deve poter
     * analizzare staticamente l'array 'imports' del modulo.
     */
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
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
   *
   * @param store :store NgRx radice su cui vengono dispatchate le action di bootstrap
   */
  constructor(private readonly store: Store<RootState>) {
    this.store.dispatch(storageHydrate());
    this.store.dispatch(appInit());
  }
}