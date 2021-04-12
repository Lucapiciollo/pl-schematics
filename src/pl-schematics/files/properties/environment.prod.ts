/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-22 14:44:48
 * @modify date 2019-12-22 14:44:48
 * @desc [vengono inserite tutte le variabili d'ambiente ed eventuali puntamenti al BE o link vari. questo file deve essere
 * popolato con i dati relativi all'ambiente di produzione]
 */
 <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") {%> 
  import { LogLevel } from 'msal'; 
  const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;
<%}%>
export const environment = {
  production: true,
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
      param: {
        auth: {
          clientId: '',
          authority: 'https://login.microsoftonline.com/common',
          redirectUri: 'http://localhost:4200/',
        },
        cache: {
          cacheLocation: 'localStorage',
          storeAuthStateInCookie: isIE, // set to true for IE 11
        }
      },
      scope: {
        popUp: !isIE,
        consentScopes: ['user.read', 'openid', 'profile',],
        unprotectedResources: [],
        protectedResourceMap: [
          ['https://graph.microsoft.com/v1.0/me', ['user.read']]
        ],
        extraQueryParameters: {}
      }
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
       *  si riporta un esempio di una api riconosciuta come storable, grazie al tag @cacheble@ presente nella URL.
       *  si nota come i parametri sono passati con {0} e {1}.. il sistema è equipagiato da una funzionalita che specializza
       *  le stringhe ad avere il format function.. quindi .. è possibile formattare la url richimandola in questo modo:
       *  E.S. 
       *    let url = environment.exampleApi.format("P1","P2")
       *    quindi avviene una formattazione per posizione dei paraetri..
       *  
       *  exampleApi: `@cacheble@/example/cacable/api?param1={0}&param2={1}`
       */
      exampleApi: `@cacheble@/example/cacable/api?param1={0}&param2={1}`,
      exampleApeNoCache: `example/no/cache/api?param1={0}&param2={1}`,
      /**
       *  @author l.piciollo
       *  è possibile dichiarare una chiamata ad un mock, si consiglia di rispettare il seguente formato dichiarativo
       *  E.S. 
       *    mock:{
       *            url: "/example/no/cache/api/122?param1={0}&param2={1}" ,
       *            mock: true
       *    }  
       *    il mock a true, impone al sistema di risalire alla folder assets/public/mock/example/no/cache/api/122 e prelevare il 
       *    json relativo al metodo utilizzato.. quindi post||get||put||delete||patch .json
       *  
       */
      mock: {
        url: "/example/:api/:files",
        mocked: true,
        method:"GET"
      }
    }
  }
};