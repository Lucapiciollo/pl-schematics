import { Injectable } from '@angular/core';
import { StorageState, initialStorageState } from './storage.state';

/**
 * @author l.piciollo
 * Chiave di localStorage sotto cui viene salvato lo stato persistito (specifica per applicazione).
 */
const STORAGE_KEY = '<%= dasherize(namePackage) %>_storage_state';

/**
 * @author l.piciollo
 * Servizio che incapsula la lettura, scrittura e rimozione dello stato persistito su localStorage.
 * E' usato da StorageEffects, cosi' che reducer e componenti non accedano direttamente allo storage del browser.
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /**
   * @author l.piciollo
   * Legge lo stato persistito da localStorage, unendolo ai valori iniziali.
   * @returns lo stato salvato, oppure quello iniziale se assente, non leggibile o storage non disponibile
   */
  load(): StorageState {
    try {
      const value = localStorage.getItem(STORAGE_KEY);

      if (!value) {
        return initialStorageState;
      }

      return {
        ...initialStorageState,
        ...JSON.parse(value),
      };
    } catch (error) {
      return initialStorageState;
    }
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Salva lo stato in localStorage in formato JSON; se lo storage non e' disponibile fallisce in silenzio.
   * @param state :stato dello slice storage da persistere
   */
  save(state: StorageState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // Storage unavailable.
    }
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Rimuove lo stato persistito da localStorage; se lo storage non e' disponibile fallisce in silenzio.
   */
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Storage unavailable.
    }
  }
}