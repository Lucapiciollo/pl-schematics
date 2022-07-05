/**
 * @author @l.piciollo
 * @email lucapiciollo@gmail.com
 * @create date 2020-12-16 00:25:00
 * @modify date 2020-12-16 00:25:00
 * @desc [service for the progress component, takes care of showing the modal with progressions]
 */
import { Injectable, Injector } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {  ProgressDialogComponent } from './progress-dialog.component';

@Injectable({
  providedIn: 'root'
})
/**
 * Service to call the opening of the progress modal, then invoking the showProgressDialog method the modal will appear
 */
export class ProgressDialogService {
  /******************************************************************************************** */

  constructor(private injector: Injector) { }
  /******************************************************************************************** */
  /**
   * Functionality for opening the modal, it is necessary to pass the idAjax to be monitored and optionally a container where to associate
   * the modal.
   * @param idAjax    id per risalire al flusso ajax
   * @param container di default è il body
   */
  public showProgressDialog(idAjax: string, container?:any): NgbModalRef {
    try {
      if (typeof idAjax !== "string" || idAjax == null) {
        throw new Error("idAjax not found")
      }
      let modal = this.injector.get(NgbModal).open( ProgressDialogComponent, {
        windowClass: '  ',
        size: 'lg',
        centered: false,
        keyboard: false,
        backdrop: 'static',
        container: container || "body"
      });
      modal.componentInstance.idAjax = idAjax;
      return modal
    } catch (e) {
      throw e
    }

  }

}
