import { createAction, props } from '@ngrx/store';

/**
 * @author l.piciollo
 * Action: avvio dell'inizializzazione applicativa (il reducer imposta loading a true).
 */
export const appInit = createAction(
  '[App] Init',
);

/**
 * @author l.piciollo
 * Action: inizializzazione applicativa completata con successo.
 */
export const appInitSuccess = createAction(
  '[App] Init Success',
);

/**
 * @author l.piciollo
 * Action: inizializzazione applicativa fallita.
 * Payload: error, messaggio descrittivo dell'errore.
 */
export const appInitFailure = createAction(
  '[App] Init Failure',
  props<{ error: string }>(),
);

/**
 * @author l.piciollo
 * Action: imposta manualmente lo stato di caricamento globale.
 * Payload: loading, true se e' in corso un caricamento.
 */
export const appSetLoading = createAction(
  '[App] Set Loading',
  props<{ loading: boolean }>(),
);

/**
 * @author l.piciollo
 * Action: azzera l'errore applicativo presente nello stato.
 */
export const appClearError = createAction(
  '[App] Clear Error',
);