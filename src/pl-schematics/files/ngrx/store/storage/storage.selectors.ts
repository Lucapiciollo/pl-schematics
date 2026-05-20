import { createFeatureSelector, createSelector } from '@ngrx/store';
import { storageFeatureKey } from './storage.reducer';
import { StorageState } from './storage.state';

export const selectStorageState =
  createFeatureSelector<StorageState>(storageFeatureKey);


export const selectStorageToken = createSelector(
  selectStorageState,
  (state: StorageState): string | null => state.token,
);


export const selectStorageLanguage = createSelector(
  selectStorageState,
  (state: StorageState): string => state.language,
);


export const selectStorageTheme = createSelector(
  selectStorageState,
  (state: StorageState): 'light' | 'dark' => state.theme,
);