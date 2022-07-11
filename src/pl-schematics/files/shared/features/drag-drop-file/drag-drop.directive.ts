
/**
 * @author @l.piciollo
 * @email lucapiciollo@gmail.com
 * @create date 2021-02-25 09:37:52
 * @modify date 2021-02-25 09:37:52
 * @desc [description]
 */



import { Directive, HostListener, HostBinding, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { Delay, Unsubscribe } from 'pl-decorator';
import { Subscription } from 'rxjs';

/**
 * direttiva per la gestione del componente drag drop, si occupa sia della logica applicativa che della colorazione del componente
 * In caso di errore, il componente viene colorato in rosso, mentre in verde in caso positivo, questo è il default.
 * verrano emessi eventi di selezione file andata a buon fine o di errore riscontrato al caricamento dei file.
 */
@Directive({
    selector: '[DragDrop]'
})

@Unsubscribe()
export class PlDragDropUploadDirective implements OnInit {
    private errorObs: Subscription;
    private fileSelectedObs: Subscription;
    private boxShadownConfig = "0px 0px 20px  2px {0}";

    @Input() borderColorOk: string;
    @Input() borderColorError: string;
    @Input() borderColorDefault: string;
    @Input() backgroundColor: string;
    @Input() multipleFile: boolean = true;
    @Output() fileSelected: EventEmitter<any> = new EventEmitter();
    @Output() errorEvent: EventEmitter<Error> = new EventEmitter<Error>();
    /****************************************************************************************/
    @HostBinding('style.border-color') private bordercolor;
    @HostBinding('style.background') private background;
    @HostBinding('style.-webkit-box-shadow') private webkit_box_shadow;
    @HostBinding('style.-moz-box-shadow') private moz_box_shadow;
    @HostBinding('style.box-shadow') private box_shadow;

    /****************************************************************************************/
    constructor() {

    }
    ngOnInit(): void {
        this.bordercolor = this.borderColorDefault;
        this.background = this.backgroundColor;
        this.errorObs = this.errorEvent.subscribe(val => {
            this.colorateBorder(this.borderColorDefault)
        });
        this.fileSelectedObs = this.fileSelected.subscribe(val => {
            this.colorateBorder(this.borderColorDefault)
        })
    }
    /****************************************************************************************/
    @HostListener('dragenter', ['$event']) public onDragEnter(evt) { }
    /****************************************************************************************/
    @HostListener('mouseover') onHover() { }
    /****************************************************************************************/
    @HostListener('mouseout') onOut() { 
        this.moz_box_shadow = this.box_shadow = this.webkit_box_shadow = "";
    }
    /****************************************************************************************/
    @HostListener('dragover', ['$event']) public onDragOver(evt) {
        evt.preventDefault();
        this.moz_box_shadow = this.box_shadow = this.webkit_box_shadow = (<any>this.boxShadownConfig).format(this.bordercolor)
    }
    /****************************************************************************************/
    @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
        evt.preventDefault();
        this.moz_box_shadow = this.box_shadow = this.webkit_box_shadow = ""
    }
    /****************************************************************************************/
    @HostListener('drop', ['$event']) public onDrop(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        this.background = this.backgroundColor;
        this.dropHandler(evt);
    }
    /****************************************************************************************/
    /** @ignore */
    private dropHandler(evt) {
        try {
            evt.preventDefault();
            if (!this.multipleFile && evt.dataTransfer.files.length > 1) {
                throw new Error("Multiple file is not permitted")
            }
            this.bordercolor = this.borderColorOk;
            if (evt.dataTransfer.files.length == 1 && !this.multipleFile) {
                this.fileSelected.emit(evt.dataTransfer.files[0]);
            } else if (this.multipleFile) {
                this.fileSelected.emit(evt.dataTransfer.files);
            }
        } catch (e: any) {
            this.bordercolor = this.borderColorError;
            this.errorEvent.emit(e);
        }
    }
    /****************************************************************************************/
    /** @ignore */ @Delay(2500)
    /** @ignore */ private restoreBorder(color: string) {
        this.bordercolor = color;
    }
    /****************************************************************************************/
    /** @ignore */
    private async colorateBorder(color: string) {
        await this.restoreBorder(color) 
    }
    /****************************************************************************************/
}