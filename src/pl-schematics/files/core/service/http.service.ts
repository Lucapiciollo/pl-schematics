/**
 * @author @l.piciollo
 * @email l.piciollo@accenture.com
 * @create date 2019-09-09 09:39:39
 * @modify date 2019-09-09 09:39:39
 * @desc [wrapper di chiamata per i servizi di http esposti in PlHttpService, tutti i metodi sono interrotti durante la navigazione
 * per garantire il corretto funzionamento applicativo.]
* ATTENZIONE, NON SI CONSIGLIA LA MODIFICA DI QUESTA CLASSE A CAUSA DI OSSERVATORI ESTERNI CHE NE FANNO USO SPECIFICO.
* IL SERVIZIO, E' STATO SPECIALIZZATO CON DEGLI EVENTI DI BROADCAST LANCIATI E ASCOLTATI NELLA GLOBALSERVICE QUESTO DA MODO
* DI EVITARE DI METTERE MANI A QUESTO SERVIZIO. 
* NELLA GLOBAL SERVICE SARA POSSIBILE GESTIRE IN AUTONOMIA GLI EVENTI LANCIATI
* QUAL'ORA FOSSENECESSARIO AGGIUNGERE ALTRI MEDODI , OCCORRE ESTENDERE LA CLASSE IN UN NUOVO SERVIZIO
*/ 

import { Injectable, InjectionToken, Injector } from '@angular/core';
import { CONTENT_TYPE, PlCoreModule, PlHttpService, RESPONSE_TYPE ,PlCoreUtils} from 'pl-core-utils-library';
import { Observable, Subject  } from 'rxjs';
import { <%=classify(prefixClass)%>ErrorBean, <%=classify(prefixClass)%>ErrorCode } from 'src/app/<%=namePackage%>/core/bean/error-bean';

/** 
 * @author l.piciollo
 * injectiontoken per la valorizzazione della baseurl per l'invocazione dei servizi del BE.
 * E.S http://baseurl:8080/api/v1/
 */

export const BASE_URL_API = new InjectionToken<any>("Puntamento all'indirizzo del BE");

/**
 * @author l.piciollo
 * servizio base per l'interfacciamento con la PLHttpService.. qui sono esposti metodi sia per il background, quindi non subiscono
 * interruzioni da parte della navigazione, che servizi istantanei, i quali vengono terminati in caso di cambio di rotta
 * la classe mette a disposizione gia tutto l'occorrente 
 */
@Injectable({
  providedIn: "root"
})
/**
* ATTENZIONE, NON SI CONSIGLIA LA MODIFICA DI QUESTA CLASSE A CAUSA DI OSSERVATORI ESTERNI CHE NE FANNO USO SPECIFICO.
* IL SERVIZIO, E' STATO SPECIALIZZATO CON DEGLI EVENTI DI BROADCAST LANCIATI E ASCOLTATI NELLA GLOBALSERVICE QUESTO DA MODO
* DI EVITARE DI METTERE MANI A QUESTO SERVIZIO. 
* NELLA GLOBAL SERVICE SARA POSSIBILE GESTIRE IN AUTONOMIA GLI EVENTI LANCIATI
* QUAL'ORA FOSSENECESSARIO AGGIUNGERE ALTRI MEDODI , OCCORRE ESTENDERE LA CLASSE IN UN NUOVO SERVIZIO
*/  
export class <%=classify(prefixClass)%>HttpService {
  /********************************************************************************************************************/
  constructor(private injector: Injector, public plHttpService: PlHttpService) {

  }

  
  /**
   * @author l.piciollo
   * logtrace per visualizzare di default lo stato di avanzamento delle http
   * @param IDAjax 
   */
    private logTraceHttp(IDAjax: any) {
      let trace = this.TAILAJXCALL(IDAjax).subscribe(object => {
        console.log(object)
      }, () => { }, () => { trace.unsubscribe(); })
    }
  /********************************************************************************************************************/
  /**
   * @author l.piciollo
   * funzionlita per rimanere in ascolto su una progressione di chiamata al be.. utile per risalire allo stato di chiamate al BE
   * per il caricamento/scaricamento file. la funzione ritorna un Subject... dove possibile sottoscriversi per icevere i dati
   * in modalità realtime. utile per costruire barre di progressione a runtime.
   * @param IDAjax : id della chiamata ajax precedentemente chiamata, l'id viene restituido dalla callback in ingresso alle chiamate
   */
  TAILAJXCALL(IDAjax:string): Subject<any> { 
    try {
      return PlCoreUtils.progressBars[IDAjax].changed;
    } catch (error) { 
      throw new ErrorBean(error.message, ErrorCode.SYSTEMERRORCODE, false, true)
    }
  }
  /********************************************************************************************************************/
  /**
   * @author l.piciollo
   * funzionalità per la terminazione di una chiamata di rete che magari prende piu tempo del previsto.. passando in ingresso l'id AJAX 
   * staccato al momento della chiamata è utile per killare upload/download file. 
   * @param IDAjax : id della chiamata ajax precedentemente chiamata, l'id viene restituido dalla callback in ingresso alle chiamate
   */
  KILLAJXCALL(IDAjax:string) { 
    try {
      PlCoreUtils.progressBars[IDAjax].interrupt.next(true);
    } catch (error) { 
      throw new ErrorBean(error.message, ErrorCode.SYSTEMERRORCODE, false, true)
    }
  }
  /********************************************************************************************************************/
  /**
  * @author l.piciollo
  * funzione per il download dello straming in formato file
  * @param streamData :buffer di byte
  * @param headers   : headers  ajax
  * @param filename : nome file
  */
  DOWNLOAD(streamData, headers, fileName?: string): Promise<any> {
    return this.plHttpService.DOWNLOAD(streamData, headers,fileName);
  }
  /********************************************************************************************************************/  
  /**
   * @author l.piciollo
   * si occupa di effettuare il download dell'immagine contenuta nel blob creato con le altre funzionalità
   * funzionalità utilizzabile in combinazione con le funzione di creazione image o file
   * @param url : url del blob
   * @param filename : nome file
   */
  DOWNLOADURL(url: string, filename: string = new Date().getTime() + "txt") {
    this.plHttpService.DOWNLOADURL(url, filename);
  }
  /********************************************************************************************************************/
  /**
   * @author l.piciollo
   * Servizio GET 
   * @param url          :Url BE
   * @param params       :params
   * @param responseType :tipo di risposta RESPONSE_TYPE
   * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   */
  GET(url: string, params: any, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string, mocked?: boolean): Observable<HttpResponse<any>> {
    return new Observable<HttpResponse<any>>(observer => {
      this.plHttpService.GET(this.injector.get(BASE_URL_API).concat(url), JSON.changeValues(params,null,""),responseType || RESPONSE_TYPE.JSON, PlCoreModule.Routing().getIinterrupt(), contentType || null, callBack|| this.logTraceHttp.bind(this),mocked).subscribe(res => {
        observer.next(res)
        observer.complete();
      }, err => {
        observer.error(this.checkError(err));
      }, () => { });
    });
  }
  /********************************************************************************************************************/

  /**
   * @author l.piciollo
   * Servizio GET REST non influente al cambio di rotta.. il servizio gira in background
   * @param url          :Url BE
   * @param params       :params
   * @param responseType :tipo di risposta RESPONSE_TYPE 
   * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   */
  GETBG(url: string, params: any, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string, mocked?: boolean): Observable<HttpResponse<any>> {
    return new Observable<HttpResponse<any>>(observer => {
      this.plHttpService.GET(this.injector.get(BASE_URL_API).concat(url), JSON.changeValues(params,null,""), responseType || RESPONSE_TYPE.JSON, null, contentType || null, callBack|| this.logTraceHttp.bind(this),mocked).subscribe(res => {
        observer.next(res)
        observer.complete();
      }, err => {
        observer.error(this.checkError(err));
      }, () => { });
    });
  }


  /********************************************************************************************************************/

  /**
   * @author l.piciollo
   * Servizio PATCH 
   * @param url          :Url BE
   * @param params       :params
   * @param responseType :tipo di risposta RESPONSE_TYPE
   * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   */
  PATCH(url: string, params: any, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string, mocked?: boolean): Observable<HttpResponse<any>> {
    return new Observable<HttpResponse<any>>(observer => {
      this.plHttpService.PATCH(this.injector.get(BASE_URL_API).concat(url), params, responseType || RESPONSE_TYPE.JSON, PlCoreModule.Routing().getIinterrupt(), contentType || null, callBack|| this.logTraceHttp.bind(this),mocked).subscribe(res => {
        observer.next( res)
        observer.complete();
      }, err => {
        observer.error(this.checkError(err));
      }, () => { });
    });
  }
  /********************************************************************************************************************/
  /**
   * @author l.piciollo
   * Servizio PATCHBG REST non influente al cambio di rotta.. il servizio gira in background
   * @param url          :Url BE
   * @param params       :params
   * @param responseType :tipo di risposta RESPONSE_TYPE
   * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   */
  PATCHBG(url: string, params: any, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string, mocked?: boolean): Observable<HttpResponse<any>> {
    return new Observable<HttpResponse<any>>(observer => {
      this.plHttpService.PATCH(this.injector.get(BASE_URL_API).concat(url), params, responseType || RESPONSE_TYPE.JSON, null, contentType || null, callBack|| this.logTraceHttp.bind(this),mocked).subscribe(res => {
        observer.next( res)
        observer.complete();
      }, err => {
        observer.error(this.checkError(err));
      }, () => { });
    });
  }

  /********************************************************************************************************************/

  /**
   * @author l.piciollo
   * Servizio POST 
   * @param url          :Url BE
   * @param params       :params
   * @param responseType :tipo di risposta RESPONSE_TYPE
   * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   */
  POST(url: string, params: any, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string, mocked?: boolean): Observable<HttpResponse<any>> {
    return new Observable<HttpResponse<any>>(observer => {
      this.plHttpService.POST(this.injector.get(BASE_URL_API).concat(url), params, responseType || RESPONSE_TYPE.JSON, PlCoreModule.Routing().getIinterrupt(), contentType || null, callBack|| this.logTraceHttp.bind(this),mocked).subscribe(res => {
        observer.next( res)
        observer.complete();
      }, err => {
        observer.error(this.checkError(err));
      }, () => { });
    });
  }
  /********************************************************************************************************************/
  /**
   * @author l.piciollo
   * Servizio POSTBG REST  influente al cambio di rotta.. il servizio gira in background
   * @param url          :Url BE
   * @param params       :params
   * @param responseType :tipo di risposta RESPONSE_TYPE
   * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   */
  POSTBG(url: string, params: any, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string, mocked?: boolean): Observable<HttpResponse<any>> {
    return new Observable<HttpResponse<any>>(observer => {
      this.plHttpService.POST(this.injector.get(BASE_URL_API).concat(url), params, responseType || RESPONSE_TYPE.JSON, null, contentType || null, callBack|| this.logTraceHttp.bind(this),mocked).subscribe(res => {
        observer.next( res)
        observer.complete();
      }, err => {
        observer.error(this.checkError(err));
      }, () => { });
    });
  }
  /********************************************************************************************************************/
  /**
   * @author l.piciollo
   * Servizio POST REST non influente al cambio di rotta.. il servizio gira in background utile per la gestione dei file 
   * @param url          :Url BE
   * @param params       :params
   * @param responseType :tipo di risposta RESPONSE_TYPE
   * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   */
  POSTFILE(url: string, params: any, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string, mocked?: boolean): Observable<HttpResponse<any>> {
    return new Observable<HttpResponse<any>>(observer => {
      this.plHttpService.POST(this.injector.get(BASE_URL_API).concat(url), params, responseType, null, contentType, callBack|| this.logTraceHttp.bind(this),mocked).subscribe(res => {
        observer.next( res)
        observer.complete();
      }, err => {
        observer.error(this.checkError(err));
      }, () => { });
    });
  }

  /********************************************************************************************************************/
  /**
   * @author l.piciollo
   * Servizio GET REST non influente al cambio di rotta.. il servizio gira in background utile per la gestione dei file 
   * @param url          :Url BE
   * @param params       :params
   * @param responseType :tipo di risposta RESPONSE_TYPE
   * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   */
  GETFILE(url: string, params: any, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string, mocked?: boolean): Observable<HttpResponse<any>> {
    return new Observable<HttpResponse<any>>(observer => {
      this.plHttpService.GET(this.injector.get(BASE_URL_API).concat(url), JSON.changeValues(params,null,""), responseType, null, contentType, callBack|| this.logTraceHttp.bind(this),mocked).subscribe(res => {
        observer.next( res)
        observer.complete();
      }, err => {
        observer.error(this.checkError(err));
      }, () => { });
    });
  }

  /********************************************************************************************************************/
  /**
   * @author l.piciollo
   * Servizio PUT REST
   * @param url          :Url BE
   * @param params       :params
   * @param responseType :tipo di risposta RESPONSE_TYPE
   * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   */
  PUT(url: string, params: any, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string, mocked?: boolean): Observable<HttpResponse<any>> {
    return new Observable<HttpResponse<any>>(observer => {
      this.plHttpService.PUT(this.injector.get(BASE_URL_API).concat(url), params, responseType, PlCoreModule.Routing().getIinterrupt(), contentType, callBack|| this.logTraceHttp.bind(this),mocked).subscribe(res => {
        observer.next( res)
        observer.complete();
      }, err => {
        observer.error(this.checkError(err));
      }, () => { });
    });
  }
  /********************************************************************************************************************/
  /**
   * @author l.piciollo
   * Servizio PUTBG REST  influente al cambio di rotta.. il servizio gira in background
   * @param url          :Url BE
   * @param params       :params
   * @param responseType :tipo di risposta RESPONSE_TYPE
   * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   */
  PUTBG(url: string, params: any, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string, mocked?: boolean): Observable<HttpResponse<any>> {
    return new Observable<HttpResponse<any>>(observer => {
      this.plHttpService.PUT(this.injector.get(BASE_URL_API).concat(url), params, responseType || RESPONSE_TYPE.JSON, null, contentType || null, callBack|| this.logTraceHttp.bind(this),mocked).subscribe(res => {
        observer.next( res)
        observer.complete();
      }, err => {
        observer.error(this.checkError(err));
      }, () => { });
    });
  }    
  /********************************************************************************************************************/
  /**
   * @author l.piciollo
   * Servizio DELETE REST
   * @param url          :Url BE
   * @param params       :params
   * @param responseType :tipo di risposta RESPONSE_TYPE
   * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
   * @param contentType  :tipo di contenuto ricevuto
   */
  DELETE(url: string, params: any, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string, mocked?: boolean): Observable<HttpResponse<any>> {
    return new Observable<HttpResponse<any>>(observer => {
      this.plHttpService.DELETE(this.injector.get(BASE_URL_API).concat(url), params, responseType, PlCoreModule.Routing().getIinterrupt(), contentType, callBack|| this.logTraceHttp.bind(this),mocked).subscribe(res => {
        observer.next( res)
        observer.complete();
      }, err => {
        observer.error(this.checkError(err));
      }, () => { });
    });
  }
  /********************************************************************************************************************/
  /**
   * @author l.piciollo
   * Servizio FORKJOIN REST
   * @param serviceUrls  :lista di url da richiamare in parallelo
   * @param params       :params 
   */
  FORKJOIN(serviceUrls: string[]  , params: any, mocked?: boolean): Observable<Array<HttpResponse<any>>> { 
    serviceUrls = serviceUrls.map(URL => {
      return this.injector.get(BASE_URL_API).concat(URL);
    })
    return new Observable<Array<HttpResponse<any>>> (observer => {
      this.plHttpService.FORKJOIN(serviceUrls, params, null,mocked).subscribe(res => {
        observer.next(res)
        observer.complete();
      }, err => {
        observer.error(this.checkError(err));
      }, () => { });
    });
  }

/********************************************************************************************************************/
  /**
   * @author l.piciollo
   * funzione di utilita per la cattura delle eccezioni o errori riscontrati durante le chiamte al BE
   * @param error 
   */
  private checkError(error): ErrorBean {
    try {
      return new ErrorBean(error.error.errorResponse.description, ErrorCode.SYSTEMERRORCODE, false, true)
    } catch (e) {
      if (error.message)
        return new ErrorBean(error.message, ErrorCode.SYSTEMERRORCODE, false, true)
    }
  }
  /********************************************************************************************************************/
}
