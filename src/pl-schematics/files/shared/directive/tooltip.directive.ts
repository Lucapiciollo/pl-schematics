import {
  Directive,
  ElementRef,
  EmbeddedViewRef,
  Input,
  Renderer2,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { ErrorBean, ErrorCode } from '@app/cloud/agic/core/bean/error-bean';
import { createPopper, preventOverflow, flip, Placement, PositioningStrategy } from '@popperjs/core';

@Directive({
  selector: '[libTooltip]'
})
export class TooltipDirective {
  private popperInstance = null;
  private tooltipref: TemplateRef<any>;
  private el: EmbeddedViewRef<any>;
  private libTooltipcontainer: ViewContainerRef;
  private params = {};

  @Input() libTooltipX: number = null;
  @Input() libTooltipY: number = null;
  @Input() libTooltipPlacement: Placement = "bottom";
  @Input() libTooltipStrategy: PositioningStrategy = "absolute";

  @Input({ required: true }) set libTooltipContainer(libTooltipcontainer: ViewContainerRef) {
    if (libTooltipcontainer) {
      this.libTooltipcontainer = libTooltipcontainer;
    }
  }

  @Input({ required: true }) set libTooltipParams(params: any) {
    if (params)
      this.params = params;
  }

  @Input({ required: true }) set libTooltip(eref: TemplateRef<any>) {
    if (eref) {
      this.tooltipref = eref
      const el = this.templateRef.elementRef.nativeElement.previousElementSibling;
      this.renderer.listen(el, 'mouseenter', () => this.onMouseOver());
      this.renderer.listen(el, 'mouseleave', () => this.onMouseOut());
    }
  }
  /********************************************************************************************************************************* */



  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {
    this.viewContainer.createEmbeddedView(this.templateRef);
  }

  /********************************************************************************************************************************* */
  onMouseOver() {
    this.show();
  }
  /******************************************************************************************************************************** */
  onMouseOut() {
    this.hide();
  }
  /********************************************************************************************************************************* */

  modifierCenterScreen = () => {
    return {
      name: 'offset',
      options: {
        offset: ({ placement, reference, popper }) => {
          return [this.libTooltipX == null ? popper.x : this.libTooltipX, this.libTooltipY == null ? popper.y : this.libTooltipY];
        },
      }
    }
  }
  /********************************************************************************************************************************* */

  create() {
    try {
      this.popperInstance = createPopper(this.elementRef.nativeElement.parentElement, this.el.rootNodes[0] as any, {
        placement: this.libTooltipPlacement,
        modifiers: [preventOverflow, flip, this.modifierCenterScreen()],
        strategy: this.libTooltipStrategy
      });
      this.popperInstance.update();
    } catch (e) {
      throw new ErrorBean(e.message, ErrorCode.SYSTEMERRORCODE, false, false)
    }
  }
  /************************************************************************************************ */
  destroy() {
    try {
      if (this.popperInstance) {
        this.popperInstance.destroy();
        this.popperInstance = null;
      }
      if (this.libTooltipcontainer.length < 1) return;
      this.libTooltipcontainer.clear()
    } catch (e) {
      throw new ErrorBean(e.message, ErrorCode.SYSTEMERRORCODE, false, false)
    }
  }
  /************************************************************************************************ */
  show() {
    try {
      if (this.libTooltipcontainer.length > 0) {
        this.hide();
      } else {
        this.el = this.tooltipref.createEmbeddedView({ $implicit: this.params });
        this.renderer.setAttribute(this.el.rootNodes[0], "id", "tooltip");
        this.libTooltipcontainer.insert(this.el);
        setTimeout(() => {
          this.renderer.setAttribute(this.el.rootNodes[0], 'data-show', '');
          this.create();
        }, 1);
      }
    } catch (e) {
      throw new ErrorBean(e.message, ErrorCode.SYSTEMERRORCODE, false, false)
    }
  }
  /********************************************************************************************************************************* */
  hide() {
    this.destroy();
  }
  /********************************************************************************************************************************* */

  ngOnInit() {  }
  /********************************************************************************************************************************* */

  ngOnDestroy() {
    if (this.el) {
      this.el.destroy();
    }
  }
}
