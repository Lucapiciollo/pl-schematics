/**
 * @author l.piciollo
 * Stato dello slice storage: dati persistiti su localStorage (token, lingua, tema).
 */
export interface StorageState {
  /** token di autenticazione, null se assente */
  token: string | null;
  /** codice della lingua corrente */
  language: string;
  /** tema grafico corrente */
  theme: 'light' | 'dark';
}

/**
 * @author l.piciollo
 * Stato iniziale dello slice storage: nessun token, lingua 'it' e tema chiaro.
 */
export const initialStorageState: StorageState = {
  token: null,
  language: 'it',
  theme: 'light',
};