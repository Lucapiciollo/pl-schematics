/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-21 15:00:56
 * @modify date 2019-12-21 15:00:56
 * @desc [Teplate bean exception da lanciare in caso di eccezione riscontrata nel ry catch.. 
 *     è possibile anche specializzare il tipo di errore grazie all'enumeraition ErrorCode, inserire i proprio tipo
 *     in questa enumerazione.
 * ]
 */

 /**
  * @author l.piciollo
  * tipo enumerazione per identificare errori base dell'applicazione.. 
  * è possibile inserire qui altri tipi custom
  */
export enum  ErrorCode {
      /** errore generico di sistema (valore di default del bean ErrorBean) */
      SYSTEMERRORCODE = "SYSTEMERROR",
      /** errore di rete / comunicazione con il backend */
      NETWORKERROR = "NETWORKERROR"
}

/**
 * @author l.piciollo
 * bean di trasporto per l'errore.
 * Estende Error e aggiunge il codice di errore (ErrorCode) e due flag che indicano se l'applicazione deve
 * reindirizzare alla pagina di errore e/o mostrare una modale. Viene lanciato nei blocchi try/catch dei servizi
 * e delle utility e gestito in modo centralizzato (es. error.service).
 */
export class  ErrorBean extends Error {

      /**
       * @author l.piciollo
       * Costruttore: crea l'errore valorizzando messaggio, codice e flag di gestione (redirect e dialog).
       * @param message  :messaggio di errore 
       * @param eCode    :codice di errore
       * @param redirect :valore che indica se necessario andare in pagina di errore o meno (da centralizzare in error.service)
       * @param dialog   :valore che indica se necessario fare apparire una modale di errore o meno (da centralizzare in error.service)
       */
      constructor(public override message: string, public eCode: string =  ErrorCode.SYSTEMERRORCODE, public redirect: boolean = false, public dialog: boolean = false) {
            super();
      }


}
