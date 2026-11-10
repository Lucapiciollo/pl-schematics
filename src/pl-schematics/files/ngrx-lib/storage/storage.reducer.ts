import { createReducer, on } from '@ngrx/store';
import {
  storageClear,
  storageHydrateSuccess,
  storageSetLanguage,
  storageSetTheme,
  storageSetToken,
} from './storage.actions';
import { initialStorageState, StorageState } from './storage.state';

/**
 * @author l.piciollo
 * Chiave della feature 'storage' nello store: nome dello slice usato in rootReducers e nei selector.
 */
export const storageFeatureKey = 'storage';

/**
 * @author l.piciollo
 * Reducer dello slice storage: gestisce token, lingua e tema in risposta alle action di hydrate, set e clear.
 * Resta puro: la persistenza su localStorage e' demandata a StorageEffects.
 */
export const storageReducer = createReducer(
  initialStorageState,

  on(storageHydrateSuccess, (state, action): StorageState => ({
    ...state,
    token: action.token,
    language: action.language,
    theme: action.theme,
  })),

  on(storageSetToken, (state, action): StorageState => ({
    ...state,
    token: action.token,
  })),

  on(storageSetLanguage, (state, action): StorageState => ({
    ...state,
    language: action.language,
  })),

  on(storageSetTheme, (state, action): StorageState => ({
    ...state,
    theme: action.theme,
  })),

  on(storageClear, (): StorageState => initialStorageState),
);