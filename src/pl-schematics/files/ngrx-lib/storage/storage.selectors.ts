import { createFeatureSelector, createSelector } from '@ngrx/store';
import { storageFeatureKey } from './storage.reducer';
import { StorageState } from './storage.state';

/**
 * @author l.piciollo
 * Selector della feature 'storage': restituisce l'intero slice StorageState.
 */
export const selectStorageState =
  createFeatureSelector<StorageState>(storageFeatureKey);


/**
 * @author l.piciollo
 * Selector: restituisce il token di autenticazione salvato, oppure null.
 */
export const selectStorageToken = createSelector(
  selectStorageState,
  (state: StorageState): string | null => state.token,
);


/**
 * @author l.piciollo
 * Selector: restituisce il codice della lingua corrente.
 */
export const selectStorageLanguage = createSelector(
  selectStorageState,
  (state: StorageState): string => state.language,
);


/**
 * @author l.piciollo
 * Selector: restituisce il tema grafico corrente ('light' o 'dark').
 */
export const selectStorageTheme = createSelector(
  selectStorageState,
  (state: StorageState): 'light' | 'dark' => state.theme,
);