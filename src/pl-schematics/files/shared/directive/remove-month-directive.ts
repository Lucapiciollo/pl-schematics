import {
    ContentChildren,
    DestroyRef,
    Directive,
    EventEmitter,
    Input,
    Output,
    QueryList,
    Renderer2,
    ViewContainerRef,
    inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCalendar } from '@angular/material/datepicker';
import { IAppStateTp } from '@lib/time-planner/src/lib/redux/reducer/reducer';
import { Store } from '@ngrx/store';
import moment from 'moment';
import { IAppState } from '../redux/reducer/reducer';
import { UtilsCalendar } from '@lib/utils/src/lib/calendar-utils';
import { Delay } from 'pl-decorator';
import { filterNil } from '../utils/custom.operator';
import { firstValueFrom } from 'rxjs';
import { periodSelector } from '../redux/selector/selectors';

@Directive({
    selector: '[calendar]',
})
export class CalendarDirectve {

    @Output() dateChange: EventEmitter<any> = new EventEmitter();
    @Input() calendarValue;
    public calendarOrder: number;
    private destroyRef: DestroyRef = inject(DestroyRef)


    constructor(private el: MatCalendar<Date>, private vcr: ViewContainerRef, private renderer: Renderer2) {
        el.selectedChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(response => {
            this.dateChange.next({ value: response, calendarId: this.calendarOrder });
        });
        el.monthSelected.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(response => {
            this.dateChange.next({ value: response, calendarId: this.calendarOrder });
        });
        this.renderer.setStyle(
            this.vcr.element.nativeElement, 'width', '15rem');

    }

}

/****************************************************************************************************************************** */
/****************************************************************************************************************************** */
/****************************************************************************************************************************** */
/****************************************************************************************************************************** */

@Directive({
    selector: '[containerCalendar]',
})
export class ContainerCalendarDirectve {

    private destroyRef: DestroyRef = inject(DestroyRef)
    private calendarsStore: QueryList<CalendarDirectve>;
    public store: Store<{ timePlannerStore: IAppStateTp, redux: IAppState }> = inject(Store<{ timePlannerStore: IAppStateTp, redux: IAppState }>);
    private utilsCalendar: UtilsCalendar = inject(UtilsCalendar);
    @Output() dateSelected: EventEmitter<any> = new EventEmitter();
    @Input() disableCalendarButton: boolean = false;

    constructor(private vcr: ViewContainerRef) { }

    async ngOnInit() { }

    @ContentChildren(CalendarDirectve) set calendars(calendars: QueryList<CalendarDirectve>) {
        if (calendars) {
            this.calendarsStore = calendars;

            calendars.map((m, ind) => {
                m.calendarOrder = ind;
                m.dateChange.pipe(filterNil(this.destroyRef)).subscribe(response => {
                    if (moment(response.value).isValid()) {
                        let dateRef: moment.Moment = moment(response.value);
                        dateRef = dateRef.clone().subtract(response.calendarId, "M");
                        this.calendarsStore.map((cal, indCal) => {
                            ((cal as any).el as MatCalendar<Date>)._goToDateInView(dateRef.toDate(), 'month');
                            // if (indCal == 0) {
                            //     ((cal as any).el as MatCalendar<Date>).selected = new DateRange<Date>(dateRef.toDate(), dateRef.endOf("month").toDate());
                            //     ((cal as any).el as MatCalendar<Date>).updateTodaysDate()
                            // }  
                            if (response.calendarId == cal.calendarOrder)
                                //     ((cal as any).el as MatCalendar<Date>).selected = dateRef.toDate();
                                this.dateSelected.emit(dateRef.toDate())
                            // } else {
                            // ((cal as any).el as MatCalendar<Date>).selected = null;
                            // }
                            // ((cal as any).el as MatCalendar<Date>).updateTodaysDate()

                            dateRef = dateRef.clone().add(1, "M");
                        })
                    }
                })
                if (this.disableCalendarButton)
                    this.hideChangeMonth()

            });

            firstValueFrom(this.store.select(periodSelector, { utilsCalendar: this.utilsCalendar }).pipe(filterNil(this.destroyRef))).then(interval => {
                calendars.map((m, ind) => this.setView(ind, moment(interval.from)))
            })

        }
    };


    @Delay(1)
    private setView(ind: number, initDate: moment.Moment) {
        ((this.calendarsStore.get(ind) as any).el as MatCalendar<Date>)._goToDateInView(initDate.add(ind, "M").toDate(), 'month');
        // ((this.calendarsStore.get(ind) as any).el as MatCalendar<Date>).selected = initDate.toDate();
    }

    @Delay(1)
    private hideChangeMonth() {
        Array.prototype.forEach.call(this.vcr.element.nativeElement.querySelectorAll("[class^='mat-calendar-previous-button']"), (node, ind) => {
            node.parentNode.removeChild(node);
        });
        Array.prototype.forEach.call(this.vcr.element.nativeElement.querySelectorAll("[class^='mat-calendar-next-button']"), (node, ind) => {
            node.parentNode.removeChild(node);
        });
    }

}
