import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {  ProgressDialogComponent } from './progress-dialog.component';
import { ProgressDialogService } from './progress-dialog.service';

@NgModule({
  declarations: [ ProgressDialogComponent],
  imports: [CommonModule
  ],
  exports: [ ProgressDialogComponent ],
  providers: [ ProgressDialogService],
  entryComponents: [ ProgressDialogComponent]
})
/**
 * importare questo modulo per il corretto funzionamento del componente, si consiglia di importarlo in uno sharedModule, in modo 
 * da renderlo disponibile ovunque.
 */
export class HttpProgressDialogModule {
  constructor( ) {
 
  }
} 
