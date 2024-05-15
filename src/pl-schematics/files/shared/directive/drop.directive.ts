import { ChangeDetectorRef, Directive, ElementRef, Input, inject } from '@angular/core';
import { NgbPopover, NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';
@Directive({
  selector: '[lib-drop]'
})
export class DropDirective {

  @Input({ required: true }) popoverRef: NgbPopover;
  public _config = inject(NgbPopoverConfig);
  private pos1 = 0;
  private pos2 = 0;
  private pos3 = 0;
  private pos4 = 0;


  constructor(private element: ElementRef, private cdr: ChangeDetectorRef) { }

  ngAfterViewInit(): void {

    this.pos1 = 0; this.pos2 = 0; this.pos3 = 0; this.pos4 = 0;

    if (this.popoverRef) {
      setTimeout(() => {
        (this.popoverRef as any)._windowRef.instance.context.popoverRef._positioning.update = () => {
          console.log("NO-UPDATE-MODAL")
        };
        if (document.getElementById(this.element.nativeElement.id + "header") != null) {
          document.getElementById(this.element.nativeElement.id + "header")!.onmousedown = this.dragMouseDown.bind(this);
        } else {
          (this.popoverRef as any)._windowRef.location.nativeElement.onmousedown = this.dragMouseDown.bind(this);
        }
      }, 500);
    }
  }


  private dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    this.pos3 = e.clientX;
    this.pos4 = e.clientY;
    document.onmouseup = this.closeDragElement.bind(this);
    document.onmousemove = this.elementDrag.bind(this);
  }

  private elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    this.pos1 = this.pos3 - e.clientX;
    this.pos2 = this.pos4 - e.clientY;
    this.pos3 = e.clientX;
    this.pos4 = e.clientY;
    (this.popoverRef as any)._windowRef.location.nativeElement.style.top = ((this.popoverRef as any)._windowRef.location.nativeElement.offsetTop - this.pos2) + "px";
    (this.popoverRef as any)._windowRef.location.nativeElement.style.left = ((this.popoverRef as any)._windowRef.location.nativeElement.offsetLeft - this.pos1) + "px";
  }

  private closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }

}
