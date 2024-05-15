
import { createReducer, on } from "@ngrx/store";
import { AppModelAction } from "./Action";



export interface IModel {

  test: any
}


export const ModelState: IModel = {
  test: null
}



export const reducerModelState = createReducer(
  ModelState,

  on(AppModelAction.test, (state, { test }) => {
    return { ...state, test: test }
  })
);
