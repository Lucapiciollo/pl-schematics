import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';

import * as moment from "moment";
import { PlCoreUtils } from 'pl-core-utils-library';
import { Delay } from 'pl-decorator';
import { EMPTY, from, Subject, Subscription, takeLast } from 'rxjs';

import { HttpService } from '../../../../core/service/http.service';
import { FileUpload } from '../file.type';
import { ManageFileService } from './manage-file.service';


@Component({
  selector: 'manage-file',
  templateUrl: './manage-file.component.html',
  styleUrls: ['./manage-file.component.css'],
  providers: [ManageFileService],
})
export class ManageFileComponent implements OnInit {

  public globalPercent = 0;
  public totalFile = 0;
  /****************************************************************************************/
  public moment = moment;
  public data: Array<FileUpload> = [];
  public dataObas: Subject<Array<FileUpload>> = new Subject();
  /****************************************************************************************/
  public _height: number = 100;
  /****************************************************************************************/
  @Output() showedFiles: EventEmitter<Array<FileUpload>> = new EventEmitter<Array<FileUpload>>()
  /****************************************************************************************/
  @Input() set fileSelected(files: Array<File>) {
    this.data = [...this.data, ...Array.from(files).map((file) => { return { percent: 0, file: file, id: undefined, blocked: false } })];
    this.showedFiles.next(this.data);
    this.totalFile = this.data.length;
    this.globalPercent = 0;
  };
  /****************************************************************************************/
  @Input() errorEvent: Error;
  /****************************************************************************************/
  constructor(private httpService: HttpService, protected element: ElementRef, private manageFileService: ManageFileService) { }
  /****************************************************************************************/
  ngOnInit(): void {
    this.element.nativeElement.setAttribute("style", `height: ${this._height}%;`)
  }
  /****************************************************************************************/
  uploadFile() {
    let listOperation = this.data.map((fileObj: FileUpload) => {
      if (fileObj.blocked) return { file: "", executor: EMPTY }
      return {
        file: fileObj.file.name,
        executor: this.manageFileService.uploadFile(fileObj.file, (idAjax => {
          fileObj.id = idAjax;
          fileObj.blocked = true;
          let tailajax: Subscription = this.httpService.TAILAJXCALL(idAjax).subscribe({
            next: (value) => { fileObj.percent = value.percent; },
            complete: () => {
              this.globalPercent += Math.floor(fileObj.percent / this.totalFile);
              this.removeProgressBar(fileObj.file.name);
              tailajax.unsubscribe();
              this.showedFiles.next(this.data)
            }
          })
        }))
      }
    })

    from(listOperation).subscribe({
      next: (obj) => {
        obj.executor.pipe(takeLast(1)).subscribe()
      }
    });
  }

  /****************************************************************************************/
  @Delay(1000)
  removeProgressBar(filename, refreshLenghtFiles = false) {
    this.data = [...this.data.filter((file) => {
      if (file.file.name == filename && PlCoreUtils.progressBars[file.id] && !PlCoreUtils.progressBars[file.id].changed.isStopped) {
        if (refreshLenghtFiles) {
          this.globalPercent += Math.floor((100 - PlCoreUtils.progressBars[file.id].percent) / this.totalFile);
        }
        PlCoreUtils.progressBars[file.id].interrupt.next(true)
        file.blocked = true;

      }
      return file.file.name != filename
    })];

    this.showedFiles.next(this.data)

  }
  /****************************************************************************************/

  onDestroy() {

  }

}
