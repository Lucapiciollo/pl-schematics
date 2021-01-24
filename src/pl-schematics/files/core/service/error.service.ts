/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-21 15:14:28
 * @modify date 2019-12-21 15:14:28
 * @desc [intercettazione errori per la centralizzazione della loro gestione..]
 * 
 * ATTENZIONE, NON SI CONSIGLIA LA MODIFICA DI QUESTA CLASSE A CAUSA DI OSSERVATORI ESTERNI CHE NE FANNO USO SPECIFICO.
 * IL SERVIZIO, E' STATO SPECIALIZZATO CON DEGLI EVENTI DI BROADCAST LANCIATI E ASCOLTATI NELLA GLOBALSERVICE QUESTO DA MODO
 * DI EVITARE DI METTERE MANI A QUESTO SERVIZIO. 
 * NELLA GLOBAL SERVICE SARA POSSIBILE GESTIRE IN AUTONOMIA GLI EVENTI LANCIATI
 */

import { ErrorHandler, Injectable, Injector } from "@angular/core";
import { <%=classify(prefixClass)%>ErrorBean } from 'src/app/<%=namePackage%>/core/bean/error-bean'; 
import { PlCoreUtils } from 'pl-core-utils-library';
import { CORE_TYPE_EVENT } from '../type/type.event';
/**
 * @author l.piciollo
 * classe per la centralizzazione della gestione degli errori.. qui possono essere catalogati e gestiti come da richiesta
 * possono essere accodati per un servizio di ftp per l'analisi eventuale.
 */
@Injectable({
  providedIn: "root"
})
/**
* ATTENZIONE, NON SI CONSIGLIA LA MODIFICA DI QUESTA CLASSE A CAUSA DI OSSERVATORI ESTERNI CHE NE FANNO USO SPECIFICO.
* IL SERVIZIO, E' STATO SPECIALIZZATO CON DEGLI EVENTI DI BROADCAST LANCIATI E ASCOLTATI NELLA GLOBALSERVICE QUESTO DA MODO
* DI EVITARE DI METTERE MANI A QUESTO SERVIZIO. 
* NELLA GLOBAL SERVICE SARA POSSIBILE GESTIRE IN AUTONOMIA GLI EVENTI LANCIATI
*/
export class <%=classify(prefixClass)%>ErrorService implements ErrorHandler {

  constructor(private injector: Injector) { }
  /**
  * @author l.piciollo
  *  tutti gli errori applicativi saranno concentrati in questa funzione.. è possibile elaborarli in base alle proprie necessità
  */
  handleError(errorBean: <%=classify(prefixClass)%>ErrorBean) {
    try {
      /**
       * evento lanciato per indicare che l'errore riscontrato necessita di un messaggio di dialogo figurativo per il cliente 
       * l'evento viene raccolto nel global service, occorre specializzare l'operazione richiesta 
       */
      if (errorBean.dialog)
        PlCoreUtils.Broadcast().execEvent(CORE_TYPE_EVENT.CORE_ERROR_SERVICE_DIALOG, errorBean);
      /**
       * evento lanciato per indicare che l'errore riscontrato necessita di una redirect applicativa..
       * l'evento viene raccolto nel global service, occorre specializzare l'operazione richiesta 
       */      
      if (errorBean.redirect) {
        PlCoreUtils.Broadcast().execEvent(CORE_TYPE_EVENT.CORE_ERROR_SERVICE_REDIRECT, errorBean);
      }
      /**
       * selleva qualsiasi errore applicativo ritrovato, e passa la gestione all'ascoltatore di evento
       */
      PlCoreUtils.Broadcast().execEvent(CORE_TYPE_EVENT.CORE_ERROR_SERVICE , errorBean);        
     } catch (error) { 
      console.error(error)
    }
   }

} 