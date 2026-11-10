/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-21 21:58:27
 * @modify date 2019-12-21 21:58:27
 * @desc [ intercettore fake in sostituzione di sso]
 */

 import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
 import { Injectable } from '@angular/core';
 import { Observable } from 'rxjs';
 import { tap } from 'rxjs/operators';
 import {  ErrorBean,  ErrorCode } from '../bean/error-bean';
  
 
 /**
  * @author l.piciollo
  * Intercettore HTTP fittizio, usato in sostituzione di quello reale (es. SSO) quando non serve alcuna logica di autenticazione.
  * Lascia passare ogni richiesta invariata e si limita a scrivere un messaggio in console.
  */
 @Injectable({
   providedIn: 'root'
 })
 export class   HttpInterceptorFakeService implements HttpInterceptor {
 
   /**
    * @author l.piciollo
    * Costruttore senza dipendenze: l'intercettore fake non ha stato ne' configurazione.
    */
   constructor() {
 
   }
 
   /************************************************************************************************************************/

   /**
    * @author l.piciollo
    * Inoltra la richiesta al prossimo handler senza modificarla e scrive in console un messaggio di tracciamento.
    * Eventuali eccezioni sincrone vengono rilanciate come ErrorBean con codice NETWORKERROR.
    * @param request   :richiesta HTTP in uscita
    * @param next   :handler successivo della catena di intercettori
    * @returns stream degli eventi HTTP della richiesta
    */
   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
     try {
       return next.handle(request).pipe(tap(()=>console.log("fake interceptor")));
     } catch (error:any) {
      throw new   ErrorBean(error.message,  ErrorCode.NETWORKERROR)
     }
   };

   /************************************************************************************************************************/
 
 }
 