import { createAction, props } from '@ngrx/store';

export const storageHydrate = createAction(
  '[Storage] Hydrate',
);

export const storageHydrateSuccess = createAction(
  '[Storage] Hydrate Success',
  props<{
    token: string | null;
    language: string;
    theme: 'light' | 'dark';
  }>(),
);

export const storageSetToken = createAction(
  '[Storage] Set Token',
  props<{ token: string | null }>(),
);

export const storageSetLanguage = createAction(
  '[Storage] Set Language',
  props<{ language: string }>(),
);

export const storageSetTheme = createAction(
  '[Storage] Set Theme',
  props<{ theme: 'light' | 'dark' }>(),
);

export const storageClear = createAction(
  '[Storage] Clear',
);