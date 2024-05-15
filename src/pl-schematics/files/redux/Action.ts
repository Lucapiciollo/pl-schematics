
import { createActionGroup, props } from '@ngrx/store';


export const AppModelAction = createActionGroup({
  source: "AppModelAction",
  events: {
      test: props<{ test:any }>(), 
  }
})
export const AppModelActionEf = createActionGroup({
  source: "AppModelActionEf",
  events: {
      test: props<{ test:any }>(), 
  }
})
