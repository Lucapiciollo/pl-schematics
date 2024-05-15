import { Directive, ElementRef, HostListener, Input, Renderer2, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Unsubscribe } from 'pl-decorator';
import { IAppState } from '../redux/reducer/reducer';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[autosize]'
})
@Unsubscribe()
export class AutosizeDirective {

  public col: number;
  public value: string;

  constructor(private element: ElementRef) { }

  @HostListener('window:touchend', ['$event'])
  @HostListener('keyup', ['$event'])
  private createRow() {
    try {
      this.col = (this.element.nativeElement as any).cols;
      this.value = (this.element.nativeElement as any).value;
      let linecount = 0;
      this.value.split("\n").forEach(row => {
        linecount += Math.ceil(row.length / this.col);
      });
      if ((this.element.nativeElement as any).rows < linecount + 1)
        (this.element.nativeElement as any).rows = linecount + 1;
    }
    catch (e) { }
  }

}

@Directive({
  selector: '[height]'
})
export class AppHeightDirective {
  @Input() ofsetHeight: number = 0;
  @Input() overflowY: boolean = true;
  private store: Store<{ reducer: IAppState }> = inject(Store<{ reducer: IAppState }>);
  private obs: Subscription = null;
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  ngAfterViewInit() {
    this.obs = this.store.select(state => state.reducer.windowSize).subscribe(size => {
      this.renderer.setStyle(this.el.nativeElement, 'height', `${size?.h - this.ofsetHeight}px`);
      if (this.overflowY)
        this.renderer.setStyle(this.el.nativeElement, 'overflow-y', `scroll`);
    });
  }

  ngOnDestroy() {
    this.obs.unsubscribe()
  }
}