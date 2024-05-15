import { AfterViewInit, DestroyRef, Directive, ElementRef, Inject, Input, Renderer2, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { Unsubscribe } from 'pl-decorator';
import { delay, take } from 'rxjs';
import { DateConfig, FORMAT_LOCAL_DATE } from '@shared/module/shared.module';
import { IAppState } from '@shared/redux/reducer/reducer';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[scrollList]'
})
@Unsubscribe()
export class ScrollListDirective implements AfterViewInit {

  public store: Store<{ reducer: IAppState }> = inject(Store<{ reducer: IAppState }>)
  private id: any = null;
  private idWrapper: any = null;
  @Input() set scrollList(id: any) { this.id = id };
  @Input() set wrapperScrollList(idWrapper: any) { this.idWrapper = idWrapper }
  public destroyRef: DestroyRef = inject(DestroyRef);

  constructor(private element: ElementRef, @Inject(FORMAT_LOCAL_DATE) public formatDate: DateConfig, private render: Renderer2) {
    
  }
  ngAfterViewInit(): void {
    this.store.select(state => state.reducer.period).pipe( takeUntilDestroyed(this.destroyRef)).subscribe(period => {
      if (moment(period.from).format(this.formatDate['yyyy-MM-DD']) == this.element?.nativeElement?.id) {
        this.element.nativeElement.classList.add("current");
        if (this.element.nativeElement.getBoundingClientRect().y > window.innerHeight - 30) {
          (document.getElementById(this.idWrapper) as any).scrollToPoint(0, (document.getElementById(this.id) as any)?.offsetTop - 60);
        } else if (this.element.nativeElement.getBoundingClientRect().y < 134) {
          (document.getElementById(this.idWrapper) as any).scrollToPoint(0, (document.getElementById(this.id) as any)?.offsetTop - 120);
        }
      } else {
        this.element.nativeElement.classList.remove("current");
      }
    })
  }

  ngOnDestroy(){
    
  }

}
