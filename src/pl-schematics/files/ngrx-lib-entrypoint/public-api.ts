/**
 * @author l.piciollo
 * Entry point pubblico della libreria "<%= ngrxLibName %>".
 */

export * from './lib/state.module';
export * from './lib/root.reducers';
export * from './lib/root.effects';
export * from './lib/root.selectors';
export * from './lib/root.state';

export * from './lib/app/app.actions';
export * from './lib/app/app.effects';
export * from './lib/app/app.reducer';
export * from './lib/app/app.selectors';
export * from './lib/app/app.state';

export * from './lib/storage/storage.actions';
export * from './lib/storage/storage.effects';
export * from './lib/storage/storage.reducer';
export * from './lib/storage/storage.selectors';
export * from './lib/storage/storage.service';
export * from './lib/storage/storage.state';
