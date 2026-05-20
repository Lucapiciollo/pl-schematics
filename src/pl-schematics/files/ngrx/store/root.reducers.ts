import { ActionReducerMap } from '@ngrx/store';
import { appFeatureKey, appReducer } from './app/app.reducer';
import { storageFeatureKey, storageReducer } from './storage/storage.reducer';
import { RootState } from './root.state';

export const rootReducers: ActionReducerMap<RootState> = {
  [appFeatureKey]: appReducer,
  [storageFeatureKey]: storageReducer,
};