/**
 * @author @l.piciollo
 * @email lucapiciollo@gmail.com
 * @create date 2020-12-16 00:23:02
 * @modify date 2020-12-16 00:23:02
 * @desc [Componente grafico per la visualizzazione della barra progressiva per il monitoraggio del flusso di rete per 
 * chiamata a download o upload file.. è possibile monitorare qualsiasi chiamata alla rete.]
 */
import { Component, Injector, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PlCoreUtils } from 'pl-core-utils-library';
import { Delay } from 'pl-decorator';
import { Subject } from 'rxjs';


/**
 *Modal type graphic component for displaying a progress bar that shows the progress of
 *download /upload of any file or other. It is possible to show any ajax stream, as long as you have the idAjax detached
 *from the HttpServie service.
 * @example   
    * startDownload() {
    *     this.globalService.callMock(1, 2, (idAjax) => { this.progressDialogService.showProgressDialog(idAjax) }).subscribe(sb => {
    *          console.log(sb)
    *     })
    *   }
  */
@Component({
  templateUrl: './progress-dialog.component.html',
  styleUrls: ['./progress-dialog.component.css']
})


export class  ProgressDialogComponent implements OnInit {

  /**  @ignore */public progressionObs: any;
  /**  @ignore */public url!: string;
  /**  @ignore */public percent: number = 0;
  /**  @ignore */public size!: string;
  /**  @ignore */public loaded!: string;
  /**  @ignore */public interrupted = false;
  /**  @ignore */public blocked: boolean = false;
  /**  @ignore */public interrupt!: Subject<any>;
  /**
   * Identifier of the ajax call previously made
   */
  @Input() public idAjax!: string;
  /******************************************************************************************* */
  constructor(private activeModal: NgbActiveModal, public injector: Injector) { }
  /******************************************************************************************** */

  /**
   *At the time of component creation, if the ajax identifier was passed, the listener is preempted
   *and the component listens on it, capturing all the changes of the ajax progression, then setting
   *all the parameters necessary for displaying the graph
   */
  ngOnInit() {
    try {
      if (this.idAjax != null) {
        this.progressionObs = PlCoreUtils.progressBars[this.idAjax];
        this.progressionObs.changed.subscribe((sb) => {
          this.url = sb.url;
          this.percent = sb.percent;
          this.size = sb.size;
          this.loaded = sb.loaded;
          this.interrupt = sb.interrupt;
          this.blocked = sb.blocked;
        }, (error: any) => {
          this.close();
          throw error;
        }, () => (
          this.close())
        )
      }
     } catch (e: any) {
      throw e;
    }
  }
  /******************************************************************************************** */
  /**
   * Functionality of closing the modal, it is timed to 2 seconds. functionality is of type
   * Observable
    * @ignore
   */
  @Delay(1000)
  close() {
    try {
      this.activeModal.dismiss();
    } catch (e: any) {
      throw new e
    }
  }
  /******************************************************************************************** */
  /**
   *Functionality for closing the modal in a non-timed way.
   */
  closeModal() {
    try {
      this.activeModal.dismiss();
    } catch (e: any) {
      throw new e
    }
  }
  /******************************************************************************************** */
  /**
   * functionality called internally by the component, for the kill of the process being monitored
   */
  /**  @ignore */
  interruptFlow() {
    try {
      this.interrupted = !this.interrupted;
      this.interrupt.next(this.interrupted);
      async () => await this.close();
    } catch (e: any) {
      throw new e
    }
  }
  /******************************************************************************************** */
}
