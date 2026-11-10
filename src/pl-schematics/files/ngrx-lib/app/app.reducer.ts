import { createReducer, on } from '@ngrx/store';
import {
  appClearError,
  appInit,
  appInitFailure,
  appInitSuccess,
  appSetLoading,
} from './app.actions';
import { AppState, initialAppState } from './app.state';

/**
 * @author l.piciollo
 * Chiave della feature 'app' nello store: nome dello slice usato in rootReducers e nei selector.
 */
export const appFeatureKey = 'app';

/**
 * @author l.piciollo
 * Reducer dello slice app: gestisce initialized, loading ed error in risposta alle action di inizializzazione.
 */
export const appReducer = createReducer(
  initialAppState,


  on(appInit, (state): AppState => ({
    ...state,
    loading: true,
    error: null,
  })),


  on(appInitSuccess, (state): AppState => ({
    ...state,
    initialized: true,
    loading: false,
    error: null,
  })),


  on(appInitFailure, (state, action): AppState => ({
    ...state,
    loading: false,
    error: action.error,
  })),


  on(appSetLoading, (state, action): AppState => ({
    ...state,
    loading: action.loading,
  })),

  on(appClearError, (state): AppState => ({
    ...state,
    error: null,
  })),
);