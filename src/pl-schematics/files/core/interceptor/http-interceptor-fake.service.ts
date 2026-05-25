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
 import { <%=classify(prefixClass)%>ErrorBean, <%=classify(prefixClass)%>ErrorCode } from '../bean/error-bean';
  
 
 @Injectable({
   providedIn: 'root'
 })
 export class  <%=classify(prefixClass)%>HttpInterceptorFakeService implements HttpInterceptor {
 
   /***************************************************************************************************************************** */
   constructor() {
 
   }
 
   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
     try {
       return next.handle(request).pipe(tap(()=>console.log("fake interceptor")));
     } catch (error:any) {
      throw new  <%=classify(prefixClass)%>ErrorBean(error.message, <%=classify(prefixClass)%>ErrorCode.NETWORKERROR)
     }
   };
   /***************************************************************************************************************************** */
 
 }
 