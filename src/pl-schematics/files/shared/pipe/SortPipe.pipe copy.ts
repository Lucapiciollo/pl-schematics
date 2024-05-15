/**
 * @author luca.piciollo
 * @email lucapiciollo@gmail.com
 * @create date 2022-05-19 18:27:36
 * @modify date 2022-05-19 18:27:36
 * @desc [Sort Array]
 */
import { Pipe, PipeTransform } from "@angular/core";

/**
 * @author luca.piciollo
 * implementing function to compare Number, function name is equals to localCompare
 * now is possibile call Number.localCompare
 */
Number.prototype.localeCompare = function (val: number): number {
  if (val)
    return this < val ? -1 : this > val ? 1 : 0;
  return this as number;
};

/**
 * @author luca.piciollo
 * implementing function to compare Boolean, function name is equals to localCompare
 * now is possibile call Boolean.localCompare
 */
Boolean.prototype.localeCompare = function (val: boolean): number {
  if (val)
    return this < val ? -1 : this > val ? 1 : 0;
  return this as any;
};


/**
 * @author luca.piciollo
 * @email lucapiciollo@gmail.com
 * @create date 2022-05-19 18:27:36
 * @modify date 2022-05-19 18:27:36
 * @desc [Sort Array]
 */
@Pipe({ name: "SORT", pure: false })
export class SortPipe implements PipeTransform {
  /**
   * @param value Array of object to render in table
   * @param order Sort type  "asc"  or "desc"
   * @param key   Key of object in Array passed in value params, key it must be in first level of json
   * @returns sorted value Array by key of object
   */
  transform<A extends object, B extends "asc" | "desc", C extends keyof A>(value: Array<Number | String | Boolean | A>, order: B, key: C) {
    let app = value.sort((a: any, b: any) => {
      try {
        if (!order) throw new Error("order paramiter is required...")
        let compare = 0;
        if ((typeof a == "object") && key) {
          if (!key) throw new Error("key parameter is required...")
          if ((typeof a[key] != "object")) {
            compare = a[key].localeCompare(b[key])
          } else return 0;
        }
        else
          compare = a[key].localeCompare(b[key])
        return (compare == 0 || order == "asc") ? compare : order == "desc" ? -compare : 0;
      } catch (e) {
        console.error((e as Error).message)
        return 0;
      }
    });
    return app;
  }
}
