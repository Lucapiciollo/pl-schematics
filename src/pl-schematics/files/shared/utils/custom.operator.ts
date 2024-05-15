import { DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import moment from "moment";
import { Observable, distinctUntilChanged, tap } from "rxjs";

export const filterNil = (destroyRef: DestroyRef) => {
  return   <T>(source: Observable<T>): Observable<T> =>{
    return new Observable(subscriber => {
      const subscription = source.pipe(takeUntilDestroyed(destroyRef), debug(moment().format("HHmmss")), distinctUntilChanged((a, b) => btoa(JSON.stringify(a)) == btoa(JSON.stringify(b))) ).subscribe({
        next(value) {
          if (value !== undefined && value !== null) {
            subscriber.next(value);
          } 
        },
        error(error) {
          subscriber.error(error);
        },
        complete() {
          subscriber.complete();
        }
      });

      return () => subscription.unsubscribe();
    });
  }
}

export const debug = (tag: string) => {
  return <T>(source: Observable<T>): Observable<T> => {
    return new Observable(subscriber => {
      const subscription = source.pipe(  tap({
        next(value) {
          // console.log(`%c[${tag}: Next]`, "background: #009688; color: #fff; padding: 3px; font-size: 0.7rem;" ,value )
        },
        error(error) {
           console.log(`%[${tag}: Error]`, "background: #E91E63; color: #fff; padding: 3px; font-size: 0.7rem;", error)
        },
        complete() {
          //  console.log(`%c[${tag}]: Complete`, "background: #00BCD4; color: #fff; padding: 3px; font-size: 0.7remx;")
        }
      })).pipe().subscribe({
        next(value) {
          subscriber.next(value);
        },
        error(error) {
          subscriber.error(error);
        },
        complete() {
          subscriber.complete();
        }
      });

      return () => subscription.unsubscribe();
    });
  }
}
