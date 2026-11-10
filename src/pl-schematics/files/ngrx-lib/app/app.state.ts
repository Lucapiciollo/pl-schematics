/**
 * @author l.piciollo
 * Stato dello slice app: tiene traccia dell'inizializzazione applicativa.
 */
export interface AppState {
  /** true quando l'inizializzazione applicativa e' completata */
  initialized: boolean;
  /** true mentre e' in corso un caricamento globale */
  loading: boolean;
  /** messaggio dell'ultimo errore applicativo, null se assente */
  error: string | null;
}

/**
 * @author l.piciollo
 * Stato iniziale dello slice app: non inizializzato, nessun caricamento e nessun errore.
 */
export const initialAppState: AppState = {
  initialized: false,
  loading: false,
  error: null,
};