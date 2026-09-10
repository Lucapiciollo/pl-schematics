import { createAction, props } from '@ngrx/store';

export const appInit = createAction(
  '[App] Init',
);

export const appInitSuccess = createAction(
  '[App] Init Success',
);

export const appInitFailure = createAction(
  '[App] Init Failure',
  props<{ error: string }>(),
);

export const appSetLoading = createAction(
  '[App] Set Loading',
  props<{ loading: boolean }>(),
);

export const appClearError = createAction(
  '[App] Clear Error',
);