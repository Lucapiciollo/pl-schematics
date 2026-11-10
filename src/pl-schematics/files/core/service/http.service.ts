/**
 * @format
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-09-09 09:39:39
 * @modify date 2019-09-09 09:39:39
 * @desc [wrapper di chiamata per i servizi di http esposti in PlHttpService, tutti i metodi sono interrotti durante la navigazione per garantire il corretto funzionamento applicativo.] ATTENZIONE, NON SI CONSIGLIA LA MODIFICA DI QUESTA CLASSE A CAUSA DI OSSERVATORI ESTERNI CHE NE FANNO USO SPECIFICO. IL SERVIZIO, E' STATO SPECIALIZZATO CON DEGLI EVENTI DI BROADCAST LANCIATI E ASCOLTATI NELLA GLOBALSERVICE QUESTO DA MODO DI EVITARE DI METTERE MANI A QUESTO SERVIZIO. NELLA GLOBAL SERVICE SARA POSSIBILE GESTIRE IN AUTONOMIA GLI EVENTI LANCIATI QUAL'ORA FOSSENECESSARIO AGGIUNGERE ALTRI MEDODI , OCCORRE ESTENDERE LA CLASSE IN UN NUOVO SERVIZIO
 */

import { HttpClient, HttpResponse } from '@angular/common/http';
import { effect, inject, Injectable, Injector } from '@angular/core';
import {   ErrorBean,   ErrorCode, BASE_URL_API } from '<%= sharedLibName %>';
 
import { CONTENT_TYPE, PlCoreModule, PlCoreUtils, PlHttpRequest, PlHttpService, RESPONSE_TYPE } from 'pl-core-utils-library';
import { Observable, Subject } from 'rxjs';
 
import { toSignal } from '@angular/core/rxjs-interop';
 
/**
 * @author l.piciollo
 * injectiontoken per la valorizzazione della baseurl per l'invocazione dei servizi del BE.
 * E.S http://baseurl:8080/api/v1/
 * Definito nella libreria condivisa (<%= sharedLibName %>): vedi lib/tokens/base-url-api.token.ts
 */

/**
 * @author l.piciollo
 * servizio base per l'interfacciamento con la PLHttpService.. qui sono esposti metodi sia per il background, quindi non subiscono
 * interruzioni da parte della navigazione, che servizi istantanei, i quali vengono terminati in caso di cambio di rotta
 * la classe mette a disposizione gia tutto l'occorrente
 */
@Injectable({
   providedIn: 'root',
})
/**
 * ATTENZIONE, NON SI CONSIGLIA LA MODIFICA DI QUESTA CLASSE A CAUSA DI OSSERVATORI ESTERNI CHE NE FANNO USO SPECIFICO.
 * IL SERVIZIO, E' STATO SPECIALIZZATO CON DEGLI EVENTI DI BROADCAST LANCIATI E ASCOLTATI NELLA GLOBALSERVICE QUESTO DA MODO
 * DI EVITARE DI METTERE MANI A QUESTO SERVIZIO.
 * NELLA GLOBAL SERVICE SARA POSSIBILE GESTIRE IN AUTONOMIA GLI EVENTI LANCIATI
 * QUAL'ORA FOSSENECESSARIO AGGIUNGERE ALTRI MEDODI , OCCORRE ESTENDERE LA CLASSE IN UN NUOVO SERVIZIO
 */
export class   HttpService {
   /**
    * @author l.piciollo
    * Costruttore del servizio: riceve per iniezione le dipendenze usate per delegare le chiamate di rete.
    * @param http :HttpClient di Angular (le chiamate effettive passano da plHttpService)
    * @param injector :injector Angular, usato per leggere BASE_URL_API e per creare signal/effect fuori dal contesto di iniezione
    * @param plHttpService :servizio della libreria pl-core-utils-library che esegue realmente le richieste
    */
   constructor(
      private http: HttpClient,
      private injector: Injector,
      public plHttpService: PlHttpService,
   ) {}

   /************************************************************************************************************************/

   /**
    * @author l.piciollo
    * logtrace per visualizzare di default lo stato di avanzamento delle http
    * @param IDAjax :id della chiamata ajax di cui tracciare l'avanzamento (al momento la traccia e' disattivata: il corpo e' interamente commentato)
    */
   private logTraceHttp(IDAjax: any) {
      // let trace = this.TAILAJXCALL(IDAjax).pipe(takeUntil(PlCoreUtils.progressBars[IDAjax].interrupt)).subscribe(object => {
      //   console.log(object)
      // }, () => { }, () => { trace.unsubscribe(); })
   }

   /********************************************************************************************************************/

   /**
    * @author l.piciollo
    * funzionlita per rimanere in ascolto su una progressione di chiamata al be.. utile per risalire allo stato di chiamate al BE
    * per il caricamento/scaricamento file. la funzione ritorna un Subject... dove possibile sottoscriversi per icevere i dati
    * in modalità realtime. utile per costruire barre di progressione a runtime.
    * @param IDAjax : id della chiamata ajax precedentemente chiamata, l'id viene restituido dalla callback in ingresso alle chiamate
    * @returns Subject che emette gli aggiornamenti di avanzamento della chiamata; se l'id non e' valido viene lanciato un ErrorBean
    */
   TAILAJXCALL(IDAjax: string): Subject<any> {
      try {
         return PlCoreUtils.progressBars[IDAjax].changed;
      } catch (error: any) {
         throw new ErrorBean(error.message, ErrorCode.SYSTEMERRORCODE, false, true);
      }
   }

   /********************************************************************************************************************/

   /**
    * @author l.piciollo
    * funzionalità per la terminazione di una chiamata di rete che magari prende piu tempo del previsto.. passando in ingresso l'id AJAX
    * staccato al momento della chiamata è utile per killare upload/download file.
    * @param IDAjax : id della chiamata ajax precedentemente chiamata, l'id viene restituido dalla callback in ingresso alle chiamate
    */
   KILLAJXCALL(IDAjax: string) {
      try {
         PlCoreUtils.progressBars[IDAjax].interrupt.next(true);
      } catch (error: any) {
         throw new ErrorBean(error.message, ErrorCode.SYSTEMERRORCODE, false, true);
      }
   }

   /********************************************************************************************************************/

   /**
    * @author l.piciollo
    * funzione per il download dello straming in formato file
    * @param streamData :buffer di byte
    * @param contentType : tipo di contenuto (CONTENT_TYPE o stringa mime) del file da scaricare
    * @param fileName : nome file (opzionale)
    * @returns Promise restituita da PlHttpService.DOWNLOAD al termine dell'operazione
    */
   DOWNLOAD(streamData: ArrayBuffer, contentType: CONTENT_TYPE | string, fileName?: string): Promise<any> {
      return this.plHttpService.DOWNLOAD(streamData, contentType, fileName);
   }

   /********************************************************************************************************************/

   /**
    * @author l.piciollo
    * si occupa di effettuare il download dell'immagine contenuta nel blob creato con le altre funzionalità
    * funzionalità utilizzabile in combinazione con le funzione di creazione image o file
    * @param url : url del blob
    * @param filename : nome file
    */
   DOWNLOADURL(url: string, filename: string = new Date().getTime() + 'txt') {
      this.plHttpService.DOWNLOADURL(url, filename);
   }

   /********************************************************************************************************************/


   /** profondita' corrente di annidamento delle graffe durante il parsing dello stream JSON */
   private level = 0;
   /** frammento di oggetto JSON non ancora completo, ricevuto a cavallo di due chunk */
   private partialItem = '';
   /** decoder utilizzato per convertire i byte dello stream in testo */
   private decoder = new TextDecoder();
   /** carattere che apre un oggetto JSON */
   private JTOKEN_START_OBJECT = '{';
   /** carattere che chiude un oggetto JSON */
   private JTOKEN_END_OBJECT = '}';

   /************************************************************************************************************************/

   /**
    * @author l.piciollo
    * Decodifica un chunk di byte di uno stream di oggetti JSON concatenati: individua gli oggetti completi contando le graffe,
    * ricompone quelli spezzati tra due chunk (partialItem) e invoca la callback per ciascun oggetto completo.
    * @param value :chunk di byte ricevuto dallo stream
    * @param decodedItemCallback :funzione invocata con ogni oggetto JSON completo gia' deserializzato
    */
   private decodeChunk<T>(value: Uint8Array, decodedItemCallback: (item: T) => void): void {
      const chunk = this.decoder.decode(value);
      let itemStart = 0;
      for (let i = 0; i < chunk.length; i++) {
         if (chunk[i] === this.JTOKEN_START_OBJECT) {
            if (this.level === 0) {
               itemStart = i;
            }
            this.level++;
         }
         if (chunk[i] === this.JTOKEN_END_OBJECT) {
            this.level--;
            if (this.level === 0) {
               let item = chunk.substring(itemStart, i + 1);
               if (this.partialItem) {
                  item = this.partialItem + item;
                  this.partialItem = '';
               }
               decodedItemCallback(JSON.parse(item));
            }
         }
      }
      if (this.level !== 0) {
         this.partialItem = chunk.substring(itemStart);
      }
   }

   /************************************************************************************************************************/

   /**
    * @author l.piciollo
    * Apre una chiamata in streaming verso il BE e restituisce un Observable che emette ogni elemento decodificato dallo stream.
    * L'url viene completato con la BASE_URL_API e la richiesta viene abortita quando il routing segnala l'interruzione (cambio di rotta).
    * @param plttpRequest :richiesta http (url, query params, body, headers)
    * @param responsetype :tipo di risposta (non utilizzato nell'implementazione attuale)
    * @param callBack     :funzione di avvio richiesta (non utilizzata nell'implementazione attuale)
    * @param contentType  :tipo di contenuto (non utilizzato nell'implementazione attuale)
    * @param decodeChunk  :decoder custom opzionale dei chunk, inoltrato a PlHttpService.STREAM
    * @returns Observable che emette ogni elemento T decodificato; in caso di errore emette un ErrorBean
    */
   STREAM<T>(plttpRequest: PlHttpRequest, responsetype?: XMLHttpRequestResponseType, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string, decodeChunk?: (value: Uint8Array, decodedItemCallback: (item: T) => void) => void): Observable<T> {
      const abortController = new AbortController();
      const abortSignal = abortController.signal;
      const sn = toSignal(PlCoreModule.Routing().getIinterrupt(), { initialValue: false, injector: this.injector });

      effect(() => {
         if (sn()  ) {
            abortController.abort();
         }
      }, { injector: this.injector });

      return new Observable(observer => {
         ['http', 'https'].indexOf(plttpRequest.url) < 0 ? (plttpRequest.url = this.injector.get(BASE_URL_API).concat(plttpRequest.url.replace(/\/\//gi, ''))) : undefined;
         this.plHttpService.STREAM(plttpRequest, abortController.signal, decodeChunk).subscribe({
            next: (item: T) => observer.next(item),
            error: (err) => observer.error(this.checkError(err)),
            complete: () => observer.complete()
         });
      });
   }

   /************************************************************************************************************************/

   /**
    * @author l.piciollo
    * Servizio BASICHTTP, richiama funzionalità di rete in modo generico, utilile per problemi di CORS.
    * @param plttpRequest :richiesta http (url relativo alla BASE_URL_API, query params, body, headers)
    * @param responseType :tipo di risposta RESPONSE_TYPE
    * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
    * @param contentType  :tipo di contenuto ricevuto
    * @returns Observable che emette la risposta ottenuta (secondo responsetype) e poi completa; in caso di errore emette un ErrorBean
    */
   BASICHTTP(plttpRequest: PlHttpRequest, responsetype?: XMLHttpRequestResponseType, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string): Observable<any> {
      return new Observable<HttpResponse<any>>(observer => {
         ['http', 'https'].indexOf(plttpRequest.url) < 0 ? (plttpRequest.url = this.injector.get(BASE_URL_API).concat(plttpRequest.url.replace(/\/\//gi, ''))) : undefined;
         this.plHttpService.nativeHttp(plttpRequest, responsetype || 'json', PlCoreModule.Routing().getIinterrupt(), contentType, callBack || this.logTraceHttp.bind(this)).subscribe(
            res => {
               observer.next(res as any);
               observer.complete();
            },
            err => {
               observer.error(this.checkError(err));
            },
            () => {},
         );
      });
   }

   /********************************************************************************************************************/

   /**
    * @author l.piciollo
    * Servizio GET
    * @param plttpRequest :richiesta http (url relativo alla BASE_URL_API, query params, body, headers)
    * @param responseType :tipo di risposta RESPONSE_TYPE
    * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
    * @param contentType  :tipo di contenuto ricevuto
    * @returns Observable che emette il body della risposta e poi completa; in caso di errore emette un ErrorBean
    */
   GET<T>(plttpRequest: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string): Observable<T> {
      return new Observable<T>(observer => {
         ['http', 'https'].indexOf(plttpRequest.url) < 0 ? (plttpRequest.url = this.injector.get(BASE_URL_API).concat(plttpRequest.url.replace(/\/\//gi, ''))) : undefined;

         this.plHttpService.GET(plttpRequest, responseType || RESPONSE_TYPE.JSON, PlCoreModule.Routing().getIinterrupt(), contentType, callBack || this.logTraceHttp.bind(this)).subscribe(
            res => {
               observer.next(res.body as any);
               observer.complete();
            },
            err => {
               observer.error(this.checkError(err));
            },
            () => {},
         );
      });
   }

   /********************************************************************************************************************/

   /**
    * @author l.piciollo
    * Servizio GET REST non influente al cambio di rotta.. il servizio gira in background
    * @param plttpRequest :richiesta http (url relativo alla BASE_URL_API, query params, body, headers)
    * @param responseType :tipo di risposta RESPONSE_TYPE
    * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
    * @param contentType  :tipo di contenuto ricevuto
    * @returns Observable che emette la HttpResponse completa e poi completa; in caso di errore emette un ErrorBean
    */
   GETBG(plttpRequest: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string): Observable<HttpResponse<any>> {
      return new Observable<HttpResponse<any>>(observer => {
         ['http', 'https'].indexOf(plttpRequest.url) < 0 ? (plttpRequest.url = this.injector.get(BASE_URL_API).concat(plttpRequest.url.replace(/\/\//gi, ''))) : undefined;
         try {
            let obs = this.plHttpService.GET(plttpRequest, responseType || RESPONSE_TYPE.JSON, undefined, contentType, callBack || this.logTraceHttp.bind(this));
            obs.subscribe(
               res => {
                  try {
                     observer.next(res as any);
                     observer.complete();
                  } catch (error: any) {}
               },
               err => {
                  observer.error(this.checkError(err));
               },
               () => {},
            );
         } catch (e) {
            console.error(e);
         }
      });

      // let header = plttpRequest.httpHeaders || new HttpHeaders();
      // plttpRequest.mocked ? header = header.append('mocked', "true") : null;
      // const options = this.injector.get(PlHttpService).requestOption(plttpRequest.queryParams, header, responseType, contentType);
      // return this.http.get(decodeURIComponent(plttpRequest.url ).replace(/\*/g, "%2A"), options).pipe(filter( (event : any)=>event.type ==4)) as any
   }

   /********************************************************************************************************************/

   /**
    * @author l.piciollo
    * Servizio PATCH
    * @param plttpRequest :richiesta http (url relativo alla BASE_URL_API, query params, body, headers)
    * @param responseType :tipo di risposta RESPONSE_TYPE
    * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
    * @param contentType  :tipo di contenuto ricevuto
    * @returns Observable che emette la HttpResponse completa e poi completa; in caso di errore emette un ErrorBean
    */
   PATCH(plttpRequest: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string): Observable<HttpResponse<any>> {
      return new Observable<HttpResponse<any>>(observer => {
         ['http', 'https'].indexOf(plttpRequest.url) < 0 ? (plttpRequest.url = this.injector.get(BASE_URL_API).concat(plttpRequest.url.replace(/\/\//gi, ''))) : undefined;
         this.plHttpService.PATCH(plttpRequest, responseType || RESPONSE_TYPE.JSON, PlCoreModule.Routing().getIinterrupt(), contentType, callBack || this.logTraceHttp.bind(this)).subscribe(
            res => {
               observer.next(res as any);
               observer.complete();
            },
            err => {
               observer.error(this.checkError(err));
            },
            () => {},
         );
      });
   }

   /********************************************************************************************************************/

   /**
    * @author l.piciollo
    * Servizio PATCHBG REST non influente al cambio di rotta.. il servizio gira in background
    * @param plttpRequest :richiesta http (url relativo alla BASE_URL_API, query params, body, headers)
    * @param responseType :tipo di risposta RESPONSE_TYPE
    * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
    * @param contentType  :tipo di contenuto ricevuto
    * @returns Observable che emette la HttpResponse completa e poi completa; in caso di errore emette un ErrorBean
    */
   PATCHBG(plttpRequest: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string): Observable<HttpResponse<any>> {
      return new Observable<HttpResponse<any>>(observer => {
         ['http', 'https'].indexOf(plttpRequest.url) < 0 ? (plttpRequest.url = this.injector.get(BASE_URL_API).concat(plttpRequest.url.replace(/\/\//gi, ''))) : undefined;
         this.plHttpService.PATCH(plttpRequest, responseType || RESPONSE_TYPE.JSON, undefined, contentType, callBack || this.logTraceHttp.bind(this)).subscribe(
            res => {
               observer.next(res as any);
               observer.complete();
            },
            err => {
               observer.error(this.checkError(err));
            },
            () => {},
         );
      });
   }

   /********************************************************************************************************************/

   /**
    * @author l.piciollo
    * Servizio POST
    * @param plttpRequest :richiesta http (url relativo alla BASE_URL_API, query params, body, headers)
    * @param responseType :tipo di risposta RESPONSE_TYPE
    * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
    * @param contentType  :tipo di contenuto ricevuto
    * @param interrupt    :Subject opzionale che interrompe la chiamata; se assente viene usato l'interrupt del routing (cambio di rotta)
    * @returns Observable che emette il body della risposta e poi completa; in caso di errore emette un ErrorBean
    */
   POST<T>(plttpRequest: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string, interrupt?: Subject<any>): Observable<T> {
      return new Observable<T>(observer => {
         ['http', 'https'].indexOf(plttpRequest.url) < 0 ? (plttpRequest.url = this.injector.get(BASE_URL_API).concat(plttpRequest.url.replace(/\/\//gi, ''))) : undefined;
         this.plHttpService.POST(plttpRequest, responseType || RESPONSE_TYPE.JSON, interrupt || PlCoreModule.Routing().getIinterrupt(), contentType, callBack || this.logTraceHttp.bind(this)).subscribe(
            res => {
               observer.next(res.body as any);
               observer.complete();
            },
            err => {
               observer.error(this.checkError(err));
            },
            () => {},
         );
      });
   }

   /********************************************************************************************************************/

   /**
    * @author l.piciollo
    * Servizio POSTBG REST NON influente al cambio di rotta.. il servizio gira in background
    * @param plttpRequest :richiesta http (url relativo alla BASE_URL_API, query params, body, headers)
    * @param responseType :tipo di risposta RESPONSE_TYPE
    * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
    * @param contentType  :tipo di contenuto ricevuto
    * @returns Observable che emette la HttpResponse completa e poi completa; in caso di errore emette un ErrorBean
    */
   POSTBG<T>(plttpRequest: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string): Observable<HttpResponse<T>> {
      return new Observable<HttpResponse<T>>(observer => {
         ['http', 'https'].indexOf(plttpRequest.url) < 0 ? (plttpRequest.url = this.injector.get(BASE_URL_API).concat(plttpRequest.url.replace(/\/\//gi, ''))) : undefined;
         this.plHttpService.POST(plttpRequest, responseType || RESPONSE_TYPE.JSON, undefined, contentType, callBack || this.logTraceHttp.bind(this)).subscribe(
            res => {
               observer.next(res as any);
               observer.complete();
            },
            err => {
               observer.error(this.checkError(err));
            },
            () => {},
         );
      });
   }

   /********************************************************************************************************************/

   /**
    * @author l.piciollo
    * Servizio POST REST non influente al cambio di rotta.. il servizio gira in background utile per la gestione dei file
    * @param plttpRequest :richiesta http (url relativo alla BASE_URL_API, query params, body, headers)
    * @param responseType :tipo di risposta RESPONSE_TYPE
    * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
    * @param contentType  :tipo di contenuto ricevuto
    * @returns Observable che emette la HttpResponse completa e poi completa; in caso di errore emette un ErrorBean
    */
   POSTFILE(plttpRequest: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string): Observable<HttpResponse<any>> {
      return new Observable<HttpResponse<any>>(observer => {
         ['http', 'https'].indexOf(plttpRequest.url) < 0 ? (plttpRequest.url = this.injector.get(BASE_URL_API).concat(plttpRequest.url.replace(/\/\//gi, ''))) : undefined;
         this.plHttpService.POST(plttpRequest, responseType, undefined, contentType, callBack || this.logTraceHttp.bind(this)).subscribe(
            res => {
               observer.next(res as any);
               observer.complete();
            },
            err => {
               observer.error(this.checkError(err));
            },
            () => {},
         );
      });
   }

   /********************************************************************************************************************/

   /**
    * @author l.piciollo
    * Servizio GET REST non influente al cambio di rotta.. il servizio gira in background utile per la gestione dei file
    * @param plttpRequest :richiesta http (url relativo alla BASE_URL_API, query params, body, headers)
    * @param responseType :tipo di risposta RESPONSE_TYPE
    * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
    * @param contentType  :tipo di contenuto ricevuto
    * @returns Observable che emette la HttpResponse completa e poi completa; in caso di errore emette un ErrorBean
    */
   GETFILE(plttpRequest: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string): Observable<HttpResponse<any>> {
      return new Observable<HttpResponse<any>>(observer => {
         ['http', 'https'].indexOf(plttpRequest.url) < 0 ? (plttpRequest.url = this.injector.get(BASE_URL_API).concat(plttpRequest.url.replace(/\/\//gi, ''))) : undefined;
         this.plHttpService.GET(plttpRequest, responseType, undefined, contentType, callBack || this.logTraceHttp.bind(this)).subscribe(
            res => {
               observer.next(res as any);
               observer.complete();
            },
            err => {
               observer.error(this.checkError(err));
            },
            () => {},
         );
      });
   }

   /********************************************************************************************************************/

   /**
    * @author l.piciollo
    * Servizio PUT REST
    * @param plttpRequest :richiesta http (url relativo alla BASE_URL_API, query params, body, headers)
    * @param responseType :tipo di risposta RESPONSE_TYPE
    * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
    * @param contentType  :tipo di contenuto ricevuto
    * @returns Observable che emette la HttpResponse completa e poi completa; in caso di errore emette un ErrorBean
    */
   PUT<T>(plttpRequest: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string): Observable<HttpResponse<any>> {
      return new Observable<HttpResponse<T>>(observer => {
         ['http', 'https'].indexOf(plttpRequest.url) < 0 ? (plttpRequest.url = this.injector.get(BASE_URL_API).concat(plttpRequest.url.replace(/\/\//gi, ''))) : undefined;
         this.plHttpService.PUT(plttpRequest, responseType, PlCoreModule.Routing().getIinterrupt(), contentType, callBack || this.logTraceHttp.bind(this)).subscribe(
            res => {
               observer.next(res as any);
               observer.complete();
            },
            err => {
               observer.error(this.checkError(err));
            },
            () => {},
         );
      });
   }

   /********************************************************************************************************************/

   /**
    * @author l.piciollo
    * Servizio PUTBG REST NON influente al cambio di rotta.. il servizio gira in background
    * @param plttpRequest :richiesta http (url relativo alla BASE_URL_API, query params, body, headers)
    * @param responseType :tipo di risposta RESPONSE_TYPE
    * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
    * @param contentType  :tipo di contenuto ricevuto
    * @returns Observable che emette la HttpResponse completa e poi completa; in caso di errore emette un ErrorBean
    */
   PUTBG(plttpRequest: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string): Observable<HttpResponse<any>> {
      return new Observable<HttpResponse<any>>(observer => {
         ['http', 'https'].indexOf(plttpRequest.url) < 0 ? (plttpRequest.url = this.injector.get(BASE_URL_API).concat(plttpRequest.url.replace(/\/\//gi, ''))) : undefined;
         this.plHttpService.PUT(plttpRequest, responseType || RESPONSE_TYPE.JSON, undefined, contentType, callBack || this.logTraceHttp.bind(this)).subscribe(
            res => {
               observer.next(res as any);
               observer.complete();
            },
            err => {
               observer.error(this.checkError(err));
            },
            () => {},
         );
      });
   }

   /********************************************************************************************************************/

   /**
    * @author l.piciollo
    * Servizio DELETE REST
    * @param plttpRequest :richiesta http (url relativo alla BASE_URL_API, query params, body, headers)
    * @param responseType :tipo di risposta RESPONSE_TYPE
    * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
    * @param contentType  :tipo di contenuto ricevuto
    * @returns Observable che emette la HttpResponse completa e poi completa; in caso di errore emette un ErrorBean
    */
   DELETE(plttpRequest: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string): Observable<HttpResponse<any>> {
      return new Observable<HttpResponse<any>>(observer => {
         ['http', 'https'].indexOf(plttpRequest.url) < 0 ? (plttpRequest.url = this.injector.get(BASE_URL_API).concat(plttpRequest.url.replace(/\/\//gi, ''))) : undefined;
         this.plHttpService.DELETE(plttpRequest, responseType, PlCoreModule.Routing().getIinterrupt(), contentType, callBack || this.logTraceHttp.bind(this)).subscribe(
            res => {
               observer.next(res as any);
               observer.complete();
            },
            err => {
               observer.error(this.checkError(err));
            },
            () => {},
         );
      });
   }

   /********************************************************************************************************************/

   /**
    * @author l.piciollo
    * Servizio FORKJOIN REST
    * @param plttpRequest :lista di richieste da eseguire in parallelo (l'url di ciascuna viene completato con la BASE_URL_API)
    * @param interrupt    :Subject opzionale che, se emette, interrompe le chiamate
    * @returns Observable che emette l'array delle risposte e poi completa
    */
   FORKJOIN(plttpRequest: Array<PlHttpRequest>, interrupt?: Subject<boolean>): Observable<Array<HttpResponse<any>>> {
      plttpRequest = plttpRequest.map(request => {
         request.url = this.injector.get(BASE_URL_API).concat(request.url);
         return request;
      });
      return new Observable<Array<HttpResponse<any>>>(observer => {
         this.plHttpService.FORKJOIN(plttpRequest, interrupt).subscribe(
            res => {
               observer.next(res as any);
               observer.complete();
            },
            err => {
               observer.error(this.checkError(err));
            },
            () => {},
         );
      });
   }

  

   /********************************************************************************************************************/

   /**
    * @author l.piciollo
    * funzione di utilita per la cattura delle eccezioni o errori riscontrati durante le chiamte al BE
    * @param error :errore ricevuto dalla chiamata (ErrorBean, Error, stringa o altro)
    * @returns ErrorBean: l'errore stesso se gia' ErrorBean, altrimenti un nuovo ErrorBean di sistema con il messaggio estratto
    */
   private checkError(error: any): ErrorBean {
      if (error instanceof ErrorBean) {
         return error;
      }
      const message = error && error.message ? error.message : typeof error === 'string' ? error : 'Unexpected network error';
      return new ErrorBean(message, ErrorCode.SYSTEMERRORCODE, false, true);
   }
}
