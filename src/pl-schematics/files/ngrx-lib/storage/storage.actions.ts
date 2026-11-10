import { createAction, props } from '@ngrx/store';

/**
 * @author l.piciollo
 * Action: richiede la lettura dello stato persistito (StorageEffects.hydrate$ lo carica da localStorage).
 */
export const storageHydrate = createAction(
  '[Storage] Hydrate',
);

/**
 * @author l.piciollo
 * Action: lo stato persistito e' stato letto; il reducer lo copia nello slice storage.
 * Payload: token, language e theme letti da localStorage.
 */
export const storageHydrateSuccess = createAction(
  '[Storage] Hydrate Success',
  props<{
    token: string | null;
    language: string;
    theme: 'light' | 'dark';
  }>(),
);

/**
 * @author l.piciollo
 * Action: imposta il token di autenticazione.
 * Payload: token, valore da salvare oppure null per rimuoverlo.
 */
export const storageSetToken = createAction(
  '[Storage] Set Token',
  props<{ token: string | null }>(),
);

/**
 * @author l.piciollo
 * Action: imposta la lingua dell'applicazione.
 * Payload: language, codice lingua (es. 'it').
 */
export const storageSetLanguage = createAction(
  '[Storage] Set Language',
  props<{ language: string }>(),
);

/**
 * @author l.piciollo
 * Action: imposta il tema grafico.
 * Payload: theme, 'light' oppure 'dark'.
 */
export const storageSetTheme = createAction(
  '[Storage] Set Theme',
  props<{ theme: 'light' | 'dark' }>(),
);

/**
 * @author l.piciollo
 * Action: azzera lo stato persistito e riporta lo slice ai valori iniziali.
 */
export const storageClear = createAction(
  '[Storage] Clear',
);