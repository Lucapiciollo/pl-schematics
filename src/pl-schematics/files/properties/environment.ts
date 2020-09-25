/**
 * @author @l.piciollo
 * @email l.piciollo@accenture.com
 * @create date 2019-12-22 14:44:48
 * @modify date 2019-12-22 14:56:10
 * @desc [vengono inserite tutte le variabili d'ambiente ed eventuali puntamenti al BE o link vari. questo file deve essere
 * popolato con i dati relativi all'ambiente di sviluppo]
 */
<% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") {%> import { LogLevel } from 'msal'; <%}%>
export const environment = {
  production: false,
  /**
   * @author l.piciollo
   * chiave preimpostata, da valorizzare con il puntamento al BE.. ne fa uso il cor applicativo
   * E.S http://localhost:8080/
   */
  baseUrlRemoteApi: "",
  <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") {%> 
  /**
   * @author l.piciollo
   * configurazione per autenticazione con active directory di microsoft azure.
   * valorizzare le properties secondo il propio caso. queste sono automaticamente prelevate dal sistema
   * a causa dell'abilitazione al supposrto login.
   */
  azure: {
    clientID: null,
    authority: null,
    redirectUri: null,
    validateAuthority: true,
    storeAuthStateInCookie: true,
    cacheLocation: "localStorage",
    isAngular: true,
    navigateToLoginRequestUrl : true,
    popUp: false,
    level: LogLevel.Verbose,
    piiLoggingEnabled: true,
    api_key: null
  },
  <% } %>
  http: {
    /**
     * @author l.piciollo
     * inserire qui le chiamate al BE, è possibile effettuare delle sotto categorie 
     */
    api: {
      /**
       *  @author l.piciollo
       *  si riporta un esempio di una api riconosciuta come storable, grazie al tag @cacable@ presente nella URL.
       *  si nota come i parametri sono passati con {0} e {1}.. il sistema è equipagiato da una funzionalita che specializza
       *  le stringhe ad avere il format function.. quindi .. è possibile formattare la url richimandola in questo modo:
       *  E.S. 
       *    let url = environment.exampleApi.format("P1","P2")
       *    quindi avviene una formattazione per posizione dei paraetri..
       *  
       *  exampleApi: `@cacable@/example/cacable/api?param1={0}&param2={1}`
       */
      exampleApi: `@cacable@/example/cache/api?param1={0}&param2={1}`,
      exampleApeNoCache: `example/no/cache/api?param1={0}&param2={1}`
    }
  }
};

