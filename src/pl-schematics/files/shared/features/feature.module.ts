import { NgModule } from '@angular/core';
import { HttpProgressDialogModule } from './http-progress-bar/progress-dialog.module';


@NgModule({
  declarations: [],
  imports: [HttpProgressDialogModule],
  exports: [HttpProgressDialogModule]
})
/**
 * impor all feature module, for extend functionality of program
 */
export class FeaturegModule {
  constructor() {

  }
} 
