import { NgModule } from '@angular/core';
import { PlDragDropUploadModule } from './drag-drop-file/drag-drop-upload.module';
import { HttpProgressDialogModule } from './http-progress-bar/progress-dialog.module';


@NgModule({
  declarations: [],
  imports: [HttpProgressDialogModule,PlDragDropUploadModule],
  exports: [HttpProgressDialogModule,PlDragDropUploadModule]
})
/**
 * impor all feature module, for extend functionality of program
 */
export class FeatureModule {
  constructor() {

  }
} 
