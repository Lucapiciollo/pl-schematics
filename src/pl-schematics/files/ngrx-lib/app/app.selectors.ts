import { createFeatureSelector, createSelector } from '@ngrx/store';
import { appFeatureKey } from './app.reducer';
import { AppState } from './app.state';

/**
 * @author l.piciollo
 * Selector della feature 'app': restituisce l'intero slice AppState.
 */
export const selectAppState =
  createFeatureSelector<AppState>(appFeatureKey);

/**
 * @author l.piciollo
 * Selector: indica se l'applicazione ha completato l'inizializzazione.
 */
export const selectAppInitialized = createSelector(
  selectAppState,
  (state: AppState): boolean => state.initialized,
);

/**
 * @author l.piciollo
 * Selector: indica se e' in corso un caricamento globale.
 */
export const selectAppLoading = createSelector(
  selectAppState,
  (state: AppState): boolean => state.loading,
);

/**
 * @author l.piciollo
 * Selector: restituisce il messaggio di errore applicativo corrente, oppure null.
 */
export const selectAppError = createSelector(
  selectAppState,
  (state: AppState): string | null => state.error,
);