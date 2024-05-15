import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[libSelectCell]'
})
export class SelectCellDirective {

  @Input() tableRef: HTMLTableElement;
  @Input() isActiveFirstColumn: boolean = false;
  constructor(private elementRef: ElementRef, private render2: Renderer2) { }


  @HostListener('click', ['$event.target']) onClick(e) {
    if (!this.isActiveFirstColumn && this.elementRef.nativeElement.cellIndex > 0) {
      [].map.call(this.tableRef.querySelectorAll(`.selected`), m => {
        this.render2.removeClass(m, "currentCell");
        this.render2.removeClass(m, "selected");
      });

      [].map.call(this.tableRef.querySelectorAll(`td:nth-child(${Number(this.elementRef.nativeElement.cellIndex + 1)})`), (m, id) => {
        this.render2.addClass(m, "selected");
        [].map.call(this.elementRef.nativeElement.parentElement.querySelectorAll(`td`), m => {
          this.render2.addClass(m, "selected");
        });
      });

      this.render2.removeClass(this.elementRef.nativeElement, "selected");
      this.render2.addClass(this.elementRef.nativeElement, "currentCell");
    }
  }

}
