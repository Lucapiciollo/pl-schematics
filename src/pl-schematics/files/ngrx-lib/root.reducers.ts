import { ActionReducerMap } from '@ngrx/store';
import { appFeatureKey, appReducer } from './app/app.reducer';
import { storageFeatureKey, storageReducer } from './storage/storage.reducer';
import { RootState } from './root.state';

/**
 * @author l.piciollo
 * Mappa dei reducer dello store radice (StoreModule.forRoot): associa a ogni feature key
 * (app, storage) il relativo reducer.
 */
export const rootReducers: ActionReducerMap<RootState> = {
  [appFeatureKey]: appReducer,
  [storageFeatureKey]: storageReducer,
};