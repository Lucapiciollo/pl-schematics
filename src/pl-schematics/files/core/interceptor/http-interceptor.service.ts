/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-21 21:58:27
 * @modify date 2019-12-21 21:58:27
 * @desc [Intercettore di rete, inizializzazione di base per la centralizzazione delel chiamate al BE
 * qui è possibile arrichire le chiamate con Token di autenticazione o altro, richiesto dal BE
 * è possibile inibire anche le chiamate]
 * 
 * ATTENZIONE, NON SI CONSIGLIA LA MODIFICA DI QUESTA CLASSE A CAUSA DI OSSERVATORI ESTERNI CHE NE FANNO USO SPECIFICO.
 * LA CLASSE SI INNESCA AUTOMATICAMENTE E SI OCCUPA DELLA GESTIONE DELLA CACHE CENTRLALIZZATA, SI OCCUPA DI CONTROLLARE LA PROFILAZIONE
 * UTENTE, PASSANDO IN HEADER I DATI AUTENTICAZIONE E VIENE GESTITA IN FINE LA CHIAMATA DI RETE.
 * IN CASO FOSSE NECESSARIO INSERIRE UN ALTR INTERCETTORE.. E' POSSIBLE FARLO NELLA PARTE SHARED INSERENDOLO NEL MODULO SHARED
 */

import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Inject, Injectable, InjectionToken, Injector } from '@angular/core';
 import { Observable, of } from 'rxjs';
import { finalize, tap, timeout } from 'rxjs/operators';
import { <%=classify(prefixClass)%>ErrorBean, <%=classify(prefixClass)%>ErrorCode } from 'src/app/<%=namePackage%>/core/bean/error-bean';
import { CORE_TYPE_EVENT } from 'src/app/<%=namePackage%>/core/type/type.event';
import { environment } from 'src/environments/environment';
import { <%=classify(prefixClass)%>Utils  }  from 'src/app/<%=namePackage%>/shared/utils/utils';
import {  CACHE_TAG,  PlCacheMapService,  PlCoreUtils} from 'pl-core-utils-library';
/** 
 * @author l.piciollo
 * token per la valorizzazione dell'attesa prima di terminare in timeout la richiesta al BE 
 */
export const <%=classify(prefixClass)%>DEFAULT_TIMEOUT = new InjectionToken<number>('DefaulTimeOut for http request');

/**
 * @author l.piciollo
*  Intercettore di rete, inizializzazione di base per la centralizzazione delel chiamate al BE
 * qui è possibile arrichire le chiamate con Token di autenticazione o altro, richiesto dal BE
 * è possibile inibire anche le chiamate
 * 
 * ATTENZIONE, NON SI CONSIGLIA LA MODIFICA DI QUESTA CLASSE A CAUSA DI OSSERVATORI ESTERNI CHE NE FANNO USO SPECIFICO.
 * LA CLASSE SI INNESCA AUTOMATICAMENTE E SI OCCUPA DELLA GESTIONE DELLA CACHE CENTRLALIZZATA, SI OCCUPA DI CONTROLLARE LA PROFILAZIONE
 * UTENTE, PASSANDO IN HEADER I DATI AUTENTICAZIONE E VIENE GESTITA IN FINE LA CHIAMATA DI RETE.
 * IN CASO FOSSE NECESSARIO INSERIRE UN ALTR INTERCETTORE.. E' POSSIBLE FARLO NELLA PARTE SHARED INSERENDOLO NEL MODULO SHARED
 */
@Injectable({
  providedIn: 'root'
})
export class <%=classify(prefixClass)%>HttpInterceptorService implements HttpInterceptor {

  /***************************************************************************************************************************** */
  constructor(private cache: PlCacheMapService, @Inject(CACHE_TAG) protected tagCache: string, @Inject(<%=classify(prefixClass)%>DEFAULT_TIMEOUT) protected defaultTimeout: number, private injector: Injector) {

  }
  /***************************************************************************************************************************** */

  /**
   * @author l.piciollo
   * Funzionalita di controllo per l'abilitazione della cache per le chiamate di rete.. 
   * di default sono abilitate alla cache solo le chiamate GET
   * @param method : metodo utilizzato per la chiamata POST,GET,DELETE ....
   * @param url    : url di chiamata al BE, deve contenere il tagCache per essere messo in cache
   * @returns valore buleano true|false per indicare se la chiamata puo essere messa in cache o meno
   */
  private isRequestCachable(method:string, url:string): boolean {
    return (["GET"].indexOf(method) > -1 && url.indexOf(this.tagCache) > -1)
  }

  /***************************************************************************************************************************** */
  /**
   * @author l.piciollo
   * intercettore per le chiamate di tere.. tutte le chiamate passano da questo intercettore per poterne poi eventualmente
   * modificarne i parametri di ritorno e di andata, è possibile qui modificare header ed altro
   * @param request
   * @param next
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    try {
      let startTime = Date.now();
      /**
       * si procede a verificare se la chiamata è in cache, in caso i dati vengono prelevati dalla cache e la chiamata 
       * al be non viene effettuata
       */
      if (this.isRequestCachable(request.method, request.url)) {
        let cachedResponse = this.cache.get(request);
        if (cachedResponse !== null) {
         /**in caso sia presente in cache la chimata, viene ritornato il suo valore */
          PlCoreUtils.Broadcast().execEvent(CORE_TYPE_EVENT.CORE_HTTP_AJAX_CACHE, request.url);
          return of(cachedResponse);
        }
      }
      /***************************************************************************************************************************** */
      let timeoutValue = Number(request.headers.get('timeout')) || this.defaultTimeout;
      let uuid =  <%=classify(prefixClass)%>Utils.UUIDCODE(); 
      let headers = { 'TransactionID': uuid };
      let urlApp = request.url;
      let url = request.url;
      try { url = urlApp.truncateUrlCache(this.tagCache) } catch (e) { console.debug(url + " not in storable...");}
      request = request.clone({ setHeaders: headers, url: url });
      return next.handle(request).pipe(
        timeout(timeoutValue),
        tap(
          event => {
            if (event instanceof HttpResponse) {
              /**in caso di esito positivo della chiamata al BE, si verifica se o meno è possibile storicizzare la response */
              if (this.isRequestCachable(request.method, urlApp))
                this.cache.put(request, event);
              /**è possibile aggiungere qui chiamate ad altri servizi o modali di allerta della buon uscita dell'operazione */
            }
          }, (err: any) => {
            if (err instanceof HttpErrorResponse) {
            /**l'errore vienre rediretto nell'intercettore di eccezione, è possibile specializzarne l'operazione di gestione */
              PlCoreUtils.Broadcast().execEvent(CORE_TYPE_EVENT.CORE_HTTP_AJAX_ERROR, err);
              throw new  <%=classify(prefixClass)%>ErrorBean(err.message, <%=classify(prefixClass)%>ErrorCode.NETWORKERROR)
            }
          }
        ),
        finalize(() => {
          /**viene monitorizzato il temp di esecuzione di una chiamata al BE, per verificarne le prestazioni */
          let elapsedTime = Date.now() - startTime;
          console.debug(request.method + " " + request.urlWithParams + " in " + elapsedTime + "ms");
        })
      );
    } catch (error:any) {
      throw new  <%=classify(prefixClass)%>ErrorBean(error.message, <%=classify(prefixClass)%>ErrorCode.SYSTEMERRORCODE);
    }
  };
  /***************************************************************************************************************************** */

}
