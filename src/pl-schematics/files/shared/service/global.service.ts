/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-22 14:22:00
 * @modify date 2019-12-22 14:22:00
 * @desc [classe di servizio per tutta l'applicazione, in questa classe ci saranno variabili comuni a tutti i componenti o chiamate
 * al BE di tipo generico, non vincolante ad un modulo.. come ad esempio chiamate al BE per risalire a delle tipologiche
 * che verranno poi distribuite in tutto il contesto applicavo vengono registrati gli eventi lanciati dalla parte core, per evitare di manipolare direttamente il core.]
 */

import { Injectable, OnDestroy,Injector } from "@angular/core";
import {ErrorBean,  ErrorCode } from "src/app/<%=namePackage%>/core/bean/error-bean";
import {HttpService } from 'src/app/<%=namePackage%>/core/service/http.service';
import { CONTENT_TYPE, PlHttpRequest,  RESPONSE_TYPE  } from 'pl-core-utils-library';
 import {  Unsubscribe  } from 'pl-decorator';
import { environment } from 'src/environments/environment';
import { Observable, Subject } from 'rxjs';
import { CORE_TYPE_EVENT } from 'src/app/<%=namePackage%>/core/type/type.event';
import { PlCoreUtils ,TYPE_EVENT_NETWORK} from 'pl-core-utils-library';
import { AuthService } from 'src/app/<%=namePackage%>/core/service/auth.service';
import { AuthenticationProvider, AuthenticationProviderOptions, Client, ClientOptions } from "@microsoft/microsoft-graph-client";

 /**
 * @author l.piciollo
 * classe di servizio per tutta l'applicazione, in questa classe ci saranno variabili comuni a tutti i componenti o chiamate
 * al BE di tipo generico, non vincolante ad un modulo.. come ad esempio chiamate al BE per risalire a delle tipologiche
 * che verranno poi distribuite in tutto il contesto applicavo.
 * vengono registrati gli eventi lanciati dalla parte core, per evitare di manipolare direttamente il core.
 */
@Injectable({
  providedIn: "root"
})
/**
 * @author l.piciollo
 * annotazione custom, indica di distrugere tutti gli osservatori eventualmente attivi, alla distruzione della classe
 * in ingresso è possibile passare la lista degli osservatoti che devono rimanere attivi
 */
@Unsubscribe()  
export class GlobalService implements OnDestroy {

  private clienteMsGraph:any;
  
/***************************************************************************************************************************** */
  constructor(private httpService: HttpService, private injector: Injector , private authService:  AuthService) {
     
    /**
     * @author l.piciollo
     * registrazione all'intercettore di interruzione di chiamata ajax.
     */
      PlCoreUtils.Broadcast().listenEvent(TYPE_EVENT_NETWORK.PL_BREACK_NET, (breack:any) => {
        console.log(breack.detail);
      })
    /**
     * @author l.piciollo
     * registrazione all'intercettore di errore per servire la richiesta di apertura modale di errore.
     */
      PlCoreUtils.Broadcast().listenEvent(CORE_TYPE_EVENT.CORE_ERROR_SERVICE_DIALOG, (error:any)=>{
        console.log(error.detail);
      });
     /**
      * @author l.piciollo
      * registrazione all'intercettore di errore per servire la richiesta di redirect
      */
      PlCoreUtils.Broadcast().listenEvent(CORE_TYPE_EVENT.CORE_ERROR_SERVICE_REDIRECT, (error:any)=>{
        console.log(error.detail);
      }); 
      /**
       * @author l.piciollo
       * registrazione all'evento di intercettazione della cache, da parte delle chiamate ajax.. in caso viene rilevato del contenuto in cache,
       * viene catturato in questa funzione.. qui è possibile gestirne in autonomia la casistica
       */
      PlCoreUtils.Broadcast().listenEvent(CORE_TYPE_EVENT.CORE_HTTP_AJAX_CACHE, (url:any) => {
        console.log("PlCoreUtils cache found for : {0}".format(url.detail));
      })  
        
      <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") { %> 
      /**
       * @author l.piciollo
       * registrazione all'evento di acquisizione silente del token da parte di azure lib
       */
      PlCoreUtils.Broadcast().listenEvent(CORE_TYPE_EVENT.CORE_ACQUIRE_TOKEN_SUCCESS, (OK:any) => { 
        console.log(OK)
      });
 
      /**
       * @author l.piciollo
       * registrazione all'evento di login ok da parte della azure lib
       */
      PlCoreUtils.Broadcast().listenEvent(CORE_TYPE_EVENT.CORE_LOGIN_SUCCESS, (OK:any) => { 
        console.log(OK)
      });
      <% } %> 
      /**
       * @author l.piciollo
       * registrazione all'evento di errore da parte delle chiamate ajax.. in caso viene rilevato qualsiasi errore,
       * viene catturato in questa funzione.. qui è possibile gestirne in autonomia la casistica
       */
        PlCoreUtils.Broadcast().listenEvent(CORE_TYPE_EVENT.CORE_HTTP_AJAX_ERROR, (error:any) => {
          <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") { %>
          /**
           * @author l.piciollo
           * inserimento del controllo per azure directry della corretta autenticazione, in caso di 401 si va alla login
           */
           if ([401].indexOf(error.detail.status) > -1) {
              this.injector.get(AuthService).login().subscribe();
            }
            <% } else { %>
              console.log(error.detail);
            <% } %>   
          })
          /**
           * @author l.piciollo
           * ascoltatore di evento di errore generico, qui è possibile gestire in autonomia il suo flusso
           */
          PlCoreUtils.Broadcast().listenEvent(CORE_TYPE_EVENT.CORE_ERROR_SERVICE, (errorBean:any) => {
            console.error("PlCoreUtils error found >> ", errorBean);
          });  
  }
/***************************************************************************************************************************** */
  
  ngOnDestroy(): void {
    try {
       console.log("GlobalService destroyed ... ")
    } catch (error:any) {
      throw new  ErrorBean(error.message,  ErrorCode.SYSTEMERRORCODE);
    }
  }
/***************************************************************************************************************************** */

  /**
   * @author l.piciollo
   * passando in ingresso l'ajaxToken, è possibile ricevere il 
   * subject per sottoscriversi e ricevere in tuntime i valori di stato della chiamata
   * @param idAjax 
   */
  getProgression(idAjax:string):Subject<any> { 
      try {
        return this.httpService.TAILAJXCALL(idAjax);
      }
      catch (error:any) { 
        throw new ErrorBean(error.message)
      }
   }
  

   /**
   * @author l.piciollo
   * esempio di chiamata http
   */
  callMock(p1: any, p2: any): Observable<any> {
    return new Observable<any>(obs => {
 
      let plHttpRequest: PlHttpRequest = new PlHttpRequest(
                            environment.http.api.mock , 
                            Object({ api: "api", files: "files" }),
                            Object({ api: p1, files: p2 }), 
                            null);
                            
      this.httpService.GETFILE(plHttpRequest, RESPONSE_TYPE.ARRAYBUFFER, undefined, undefined).subscribe(sb => {
        obs.next(sb);
        obs.complete()
      }, error => {
        obs.error(error);
      }, () => { })
    }) 
  }

  
  /********************GRAPH SDK CALL ::************************************************************************** */
  async getUserName(): Promise<string> {
    this.clienteMsGraph = Client.initWithMiddleware({ authProvider: this.authService });
    let userinfo = await this.clienteMsGraph.api("/me").get();
    return userinfo.displayName;
  }
}
