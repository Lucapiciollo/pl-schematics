import { Injectable } from '@angular/core';
import { StorageState, initialStorageState } from './storage.state';

const STORAGE_KEY = '<%= dasherize(namePackage) %>_storage_state';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
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

  save(state: StorageState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // Storage unavailable.
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Storage unavailable.
    }
  }
}