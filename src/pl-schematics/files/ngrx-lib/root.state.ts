import { AppState } from './app/app.state';
import { StorageState } from './storage/storage.state';

/**
 * @author l.piciollo
 * Stato radice dello store NgRx: raggruppa gli slice dell'applicazione.
 */
export interface RootState {
  /** slice di stato applicativo (inizializzazione, loading, errore) */
  app: AppState;
  /** slice di stato persistito (token, lingua, tema) */
  storage: StorageState;
}