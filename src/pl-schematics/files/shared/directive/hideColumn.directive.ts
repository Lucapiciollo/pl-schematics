import { Directive, ElementRef, HostListener, Input, Renderer2, TemplateRef, ViewContainerRef, inject } from "@angular/core";
import { IAppStatePeriodic } from "@lib/period-control/src/lib/redux/reducer/reducer";
import { Store } from "@ngrx/store";
import { firstValueFrom } from "rxjs";

@Directive({
  selector: "[hidecolumn]"
})
export class HidecolumnDirective {
  private store: Store<{ periodicStore: IAppStatePeriodic }> = inject(Store<{ periodicStore: IAppStatePeriodic }>);
  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {
  }

  @Input() set hidecolumn(name: string) {
    firstValueFrom(this.store.select(state => state.periodicStore.selectedPeriodFromComboFilter)).then(period => {
      if (name && (period == name || name.split('#').indexOf(period) > -1 || !period)) {
        this.viewContainer.createEmbeddedView(this.templateRef)
      }
      else
        this.viewContainer.clear();
    })
  };
}
