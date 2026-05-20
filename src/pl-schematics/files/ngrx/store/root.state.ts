import { AppState } from './app/app.state';
import { StorageState } from './storage/storage.state';

export interface RootState {
  app: AppState;
  storage: StorageState;
}