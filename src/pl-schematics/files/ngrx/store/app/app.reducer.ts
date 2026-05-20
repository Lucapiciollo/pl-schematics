import { createReducer, on } from '@ngrx/store';
import {
  appClearError,
  appInit,
  appInitFailure,
  appInitSuccess,
  appSetLoading,
} from './app.actions';
import { AppState, initialAppState } from './app.state';

export const appFeatureKey = 'app';

export const appReducer = createReducer(
  initialAppState,

  on(appInit, function(state): AppState {
    return {
      ...state,
      loading: true,
      error: null,
    };
  }),

  on(appInitSuccess, function(state): AppState {
    return {
      ...state,
      initialized: true,
      loading: false,
      error: null,
    };
  }),

  on(appInitFailure, function(state, action): AppState {
    return {
      ...state,
      loading: false,
      error: action.error,
    };
  }),

  on(appSetLoading, function(state, action): AppState {
    return {
      ...state,
      loading: action.loading,
    };
  }),

  on(appClearError, function(state): AppState {
    return {
      ...state,
      error: null,
    };
  }),
);