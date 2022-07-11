/**
 * @author @l.piciollo
 * @email lucapiciollo@gmail.com
 * @create date 2021-02-25 14:45:59
 * @modify date 2021-02-25 14:45:59
 * @desc [description]
 */
import { Component, ComponentRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { FileUpload } from './file.type';
import { ManageFileComponent } from './manage-file/manage-file.component';

@Component({
  selector: 'drag-drop-upload',
  templateUrl: './drag-drop-upload.component.html',
  styleUrls: ['./drag-drop-upload.component.css']
})
/**
 * Componente per la rappresentazione grafica di un elemento per drag & drop dei file.
 * è possibile configrare l'oggetto per il multi file o meno, emette eventi di esito sia positivo che negativo.
 * è possibile passare anche immagini o altri componenti, tra i tag di apertura e chiusura del componente.
 * @example 
 *      <pl-drag-drop-upload  
           [width]=300
           [height]=180  
           [multipleFile]=false 
           (fileSelectedEvent)="fileSelected($event)" 
           (errorEvent)="errorEvent($event)">
 
         </pl-drag-drop-upload>
 */
export class PlDragDropUploadComponent implements OnInit {

  public _multipleFile: boolean = false;
  public showSelectFile:boolean= true;

  /****************************************************************************************/
  @ViewChild("managerFile", { read: ViewContainerRef }) managerFile: ViewContainerRef;
  @Output() fileSelectedEvent: EventEmitter<Array<File>> = new EventEmitter<Array<File>>();
  @Output() errorEvent: EventEmitter<Error> = new EventEmitter<Error>();
  /****************************************************************************************/
  /** @ignore */ public _borderColorOk: string = "darkgreen";
  /** @ignore */ public _borderColorError: string = "red";
  /** @ignore */ public _borderColorDefault: string = "#bbb";
  /** @ignore */ public _backgroundColor: string = '#FFFFFF';
  /** @ignore */ public _width: number = 100;
  /** @ignore */ public _height: number = 100;
  /** @ignore */ public _managerFileRef: ComponentRef<any>;

  /****************************************************************************************/
  @Input() set width(_width: number) {
    if (typeof _width === "number") {
      this._width = _width;
    }
  };
  /****************************************************************************************/
  @Input() set height(_height: number) {
    if (typeof _height === "number") {
      this._height = _height;
    }
  };
  /****************************************************************************************/
  @Input() set borderColorOk(_borderColorOk: string) {
    if (typeof _borderColorOk === "string") {
      this._borderColorOk = _borderColorOk;
    }
  };
  /****************************************************************************************/
  @Input() set borderColorError(_borderColorError: string) {
    if (typeof _borderColorError === "string") {
      this._borderColorError = _borderColorError;
    }
  };
  /****************************************************************************************/
  @Input() set borderColorDefault(_borderColorDefault: string) {
    if (typeof _borderColorDefault === "string") {
      this._borderColorDefault = _borderColorDefault;
    }
  };
  /****************************************************************************************/
  @Input() set backgroundColor(_backgroundColor: string) {
    if (typeof _backgroundColor === "string") {
      this._backgroundColor = _backgroundColor;
    }
  };
  /****************************************************************************************/
  @Input() set multipleFile(multipleFile: boolean) {
    if (typeof multipleFile === "boolean") {
      this._multipleFile = multipleFile;
    }
  };

  /****************************************************************************************/
  constructor() { }
  /****************************************************************************************/
  /** @ignore */  ngOnInit(): void { }
  /****************************************************************************************/
  /** @ignore */  eventFileSelected(file: File | FileList) {
    try {
      if (file instanceof File) {
        this._managerFileRef.instance.fileSelected = [file];
        this.fileSelectedEvent.emit([file]);
      }
      else {
        this._managerFileRef.instance.fileSelected = file;
        this.fileSelectedEvent.emit(((file as unknown) as Array<File>))
      }
    } catch (error) {
      throw error
    }
  }
  /****************************************************************************************/
  /** @ignore */  eventErrorEvent(errorDrag: Error) {
    try {
      this.errorEvent.emit(errorDrag)
    } catch (error) {
      throw error
    }
  }
  /****************************************************************************************/
  ngAfterViewInit() {
    this.createComponent();
  }
  /****************************************************************************************/
  createComponent() {
    this._managerFileRef = this.managerFile.createComponent(ManageFileComponent);
    this._managerFileRef.instance._height = `${this._height - 20}`;
    this._managerFileRef.instance.showedFiles.subscribe((files:Array<FileUpload>)=>{
        this.showSelectFile=files.length==0
    })
  }
  /****************************************************************************************/


}
