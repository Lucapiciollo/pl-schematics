import { createFeatureSelector, createSelector } from '@ngrx/store';
import { appFeatureKey } from './app.reducer';
import { AppState } from './app.state';

export const selectAppState =
  createFeatureSelector<AppState>(appFeatureKey);

export const selectAppInitialized = createSelector(
  selectAppState,
  (state: AppState): boolean => state.initialized,
);

export const selectAppLoading = createSelector(
  selectAppState,
  (state: AppState): boolean => state.loading,
);

export const selectAppError = createSelector(
  selectAppState,
  (state: AppState): string | null => state.error,
);