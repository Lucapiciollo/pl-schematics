import { Injectable, Injector } from '@angular/core';

export interface CacheEntry {
    url: string;
    blob: Blob,

    entryTime: number;
}

/**
 * @author l.piciollo
 * token per inizializzare la durata della cache
 * @example { provide: MAX_CACHE_AGE, useValue: 300000 }
 */
/**

*/

@Injectable({
    providedIn: 'root'
})
export class CacheImageService {
    private timer = 60*60*1000;

    /**@ignore */
    constructor(public injector: Injector) { }

    /**@ignore */
    private cacheMap = new Map<string, CacheEntry>();

    /**
     * @author l.piciollo
     * funzionalita di storicizzazione della cache.
     * @param req
     */
    public get(req: string): string | null {
        // let url = req;

        // const entry = this.cacheMap.get(url);
        // if (!entry) {
        //     return null;
        // }
        // const isExpired = (Date.now() - entry.entryTime) > Number(this.timer);
        // return isExpired ? null : URL.createObjectURL(entry.blob) ;
      return req
      }

    /**
     * @author l.piciollo
     * funzionalità di recupero della cache.
    */
    public put(req: string, res: Blob): void {
        let url = req;
        const entry: CacheEntry = { url: url, blob: res, entryTime: Date.now() };
        this.cacheMap.set(url, entry);
        this.deleteExpiredCache();
    }

    /**
     * @ignore
     */
    private deleteExpiredCache() {
        this.cacheMap.forEach(entry => {
            if ((Date.now() - entry.entryTime) > Number(this.timer)) {
                this.cacheMap.delete(entry.url);
                URL.revokeObjectURL(entry.url)
            }
        })
    }


    public remove(req: string): void {
      let url = req;
      console.log(this.cacheMap);
      this.cacheMap.delete(url)
      URL.revokeObjectURL(url)
      console.log(this.cacheMap);

  }

}
