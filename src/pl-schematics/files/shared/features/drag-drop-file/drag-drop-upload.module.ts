/**
 * @author @l.piciollo
 * @email lucapiciollo@gmail.com
 * @create date 2021-02-25 14:46:05
 * @modify date 2021-02-25 14:46:05
 * @desc [description]
 */
import { Inject, NgModule, Optional, SkipSelf } from '@angular/core';
import { PlDragDropUploadComponent } from './drag-drop-upload.component';
import { PlDragDropUploadDirective } from './drag-drop.directive';
import { CommonModule } from '@angular/common';
import { HoverDirective } from './hover.directive';
import { ManageFileComponent } from './manage-file/manage-file.component';
import { ManageFileService } from './manage-file/manage-file.service';
 

/**
 * importare questo modulo per il corretto funzionamento del componente, si consiglia di importarlo in uno sharedModule, in modo 
 * da renderlo disponibile ovunque.
 */
@NgModule({
  declarations: [PlDragDropUploadComponent, PlDragDropUploadDirective, HoverDirective, ManageFileComponent],
  imports: [CommonModule],
  exports: [PlDragDropUploadComponent,ManageFileComponent]
})

export class PlDragDropUploadModule {
  constructor() {

  }
}
