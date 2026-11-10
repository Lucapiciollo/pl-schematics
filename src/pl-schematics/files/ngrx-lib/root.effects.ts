import { AppEffects } from './app/app.effects';
import { StorageEffects } from './storage/storage.effects';

/**
 * @author l.piciollo
 * Elenco degli effect NgRx registrati nello store (EffectsModule.forRoot): AppEffects e StorageEffects.
 */
export const rootEffects = [AppEffects, StorageEffects];