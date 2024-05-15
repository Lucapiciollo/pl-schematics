import { Directive, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Unsubscribe } from 'pl-decorator';
import { Subscription, fromEvent, interval, throttle } from 'rxjs';

@Directive({
  selector: '[throttle]'
})
@Unsubscribe()
export class Throttle implements OnInit {

  private time = 2000;
  private clicks = null;
  private fn: Function;
  @Output() debounceClick = new EventEmitter();
  private ob: Subscription = new Subscription();

  /************************************************************************************************************************************************************************ */

  constructor(private element: ElementRef) { }

  /************************************************************************************************************************************************************************ */

  async ngOnInit() {
    this.clicks = fromEvent(this.element.nativeElement, 'click');
    const result = this.clicks.pipe(throttle(() => interval(this.time)));
    this.ob.add(result.subscribe(x => {
      this.fn()
    }))
  }

  /************************************************************************************************************************************************************************ */

  @Input()
  set throttle(val: Function) {
    this.fn = val;
  }

  /************************************************************************************************************************************************************************ */

  @Input()
  set throttleTime(time: number) {
    this.time = time;
  }

  /************************************************************************************************************************************************************************ */

  @HostListener('click', ['$event'])
  clickEvent(event) {
    event.preventDefault();
    event.stopPropagation();
  }

}



