import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { rootEffects } from './root.effects';
import { rootReducers } from './root.reducers';

@NgModule({
  imports: [
    StoreModule.forRoot(rootReducers),
    EffectsModule.forRoot(rootEffects),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
    }),
  ],
  exports: [
    StoreModule,
    EffectsModule,
    StoreDevtoolsModule,
  ],
})
export class StateModule {}