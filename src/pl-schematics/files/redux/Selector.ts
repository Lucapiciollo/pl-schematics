
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { IModel } from "@redux/Redux";

export const reduxModelSelector = createFeatureSelector<any>("reduxModelSelector");



export const getTest = createSelector(
  reduxModelSelector,
  (state: IModel): any => {
    return null
  }
) 

