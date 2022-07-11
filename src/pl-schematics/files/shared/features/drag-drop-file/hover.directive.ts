
/**
 * @author @l.piciollo
 * @email lucapiciollo@gmail.com
 * @create date 2021-02-25 09:37:52
 * @modify date 2021-02-25 09:37:52
 * @desc [description]
 */



import { Directive, HostBinding, HostListener, OnInit } from '@angular/core';
import { Unsubscribe } from 'pl-decorator';

/**
 * direttiva per la gestione del componente drag drop, si occupa sia della logica applicativa che della colorazione del componente
 * In caso di errore, il componente viene colorato in rosso, mentre in verde in caso positivo, questo è il default.
 * verrano emessi eventi di selezione file andata a buon fine o di errore riscontrato al caricamento dei file.
 */
@Directive({
    selector: '[Hover]'
})

@Unsubscribe()
export class HoverDirective implements OnInit {

    @HostBinding('style.opacity') private opacity="0.5";
    /****************************************************************************************/
    constructor() { }
    /****************************************************************************************/
    ngOnInit(): void { }
    /****************************************************************************************/
    @HostListener('mouseover', ['$event']) onHover(e) {
        this.opacity = "0.1";
    }
    /****************************************************************************************/
    @HostListener('mouseout', ['$event']) onOut() {
        this.opacity = "0.5";
    }
    /****************************************************************************************/

}