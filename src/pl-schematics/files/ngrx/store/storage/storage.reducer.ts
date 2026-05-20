import { createReducer, on } from '@ngrx/store';
import {
  storageClear,
  storageHydrateSuccess,
  storageSetLanguage,
  storageSetTheme,
  storageSetToken,
} from './storage.actions';
import { initialStorageState, StorageState } from './storage.state';

export const storageFeatureKey = 'storage';

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