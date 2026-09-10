/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-21 12:30:36
 * @modify date 2019-12-21 12:30:36
 * @desc [modulo di inizializzazione applicativo.. viene inizializzata tutta la gestione degli errori, degli ambienti, della rete e altro
 *  in questo modulo non bisogna inserire componenti o altro, al difuori del gia presente, è un modulo di avvio applicativo 
 * 
 * ATTENZIONE, NON SI CONSIGLIA LA MODIFICA DI QUESTA CLASSE A CAUSA DI OSSERVATORI ESTERNI CHE NE FANNO USO SPECIFICO.
 * ]
 */
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, inject, NgModule, Optional } from '@angular/core'; 
import { NgxUiLoaderHttpModule, NgxUiLoaderModule, NgxUiLoaderRouterModule } from 'ngx-ui-loader';
import { BROWSER_VALID, CACHE_TAG, DISABLE_LOG, MAX_CACHE_AGE, PlAmbientModeLoaderService, PlCoreModule, DEFAULT_PATH_MOCK,BROWSER} from 'pl-core-utils-library';
import { BASE_URL_API, APP_BOOTSTRAP_TASKS } from '<%= sharedLibName %>';
import { UiLoaderConfig } from '../utils/UiLoaderConfig';
import { UiLoaderHttpConfig } from '../utils/UiLoaderHttpConfig';
import { UiLoaderRouterConfig } from '../utils/UiLoaderRouterConfig';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../service/auth.service';
import { GlobalService } from '../service/global.service';
import AmbientModeProviderFactory from '../initializer/AmbientModeLoader';
import AutenticationLoader from "../initializer/AutenticationLoader";

<% if (http !== 'none' && loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") { %>
import { HttpInterceptorFakeService } from '<%= sharedLibName %>';
<% } %>

<% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") {%>
  import { Router } from '@angular/router';
  import { Subject } from 'rxjs';
  import { filter, takeUntil } from 'rxjs/operators';
  import { InteractionStatus } from '@azure/msal-browser';
  import { MsalBroadcastService, MsalInterceptor, MsalModule, MsalService } from '@azure/msal-angular';
  import { MsalAuthModule } from './msal/msal-auth.module';
 /**Check if the application has been called for Teams or Web operation .. If Installing the MSAL interceptor for the token */
export const myServiceFactory = (httpInterceptorFakeService: any, msalInterceptor: any) => {
  return  AuthService.applicationType.type === 'teams' ? httpInterceptorFakeService : msalInterceptor;
};

<% } %>
/**
 * @author l.piciollo
 * modulo di inizializzazione applicativo.. viene inizializzata tutta la gestione degli errori, degli ambienti, della rete e altro
 * in questo modulo non bisogna inserire componenti o altro, al difuori del gia presente, è un modulo di avvio applicativo
 * 
 * ATTENZIONE, NON SI CONSIGLIA LA MODIFICA DI QUESTA CLASSE A CAUSA DI OSSERVATORI ESTERNI CHE NE FANNO USO SPECIFICO.
 *
 */
@NgModule({
  declarations: [],
  imports: [
    PlCoreModule,
    /**
     * @author l.piciollo
     * inizializzazione di barre progressive, sono in ascolto sia sul cambio di rotta che durante le chiamate di rete
     * le progressioni sono configurabili tramite i file di configurazione
     * è possibile fare riferimento a https://github.com/t-ho/ngx-ui-loader/wiki/Custom-configuration-for-NgxUiLoaderModule
     */
    NgxUiLoaderModule.forRoot(UiLoaderConfig),
    NgxUiLoaderHttpModule.forRoot(UiLoaderHttpConfig),
    NgxUiLoaderRouterModule.forRoot(UiLoaderRouterConfig),    
    /**
     * @author l.piciollo
     * inserimento modulo per azure
     */ 
    <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") {%>
     MsalAuthModule.forRoot(),
    <% } %>
  ],
  providers: [  
    <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") {%>
      /**
       * @author l.piciollo
       * Istanza MSAL, guard config e interceptor config sono gia' fornite da MsalAuthModule.forRoot()
       * (vedi 'imports' sopra) tramite injection token PL_MSAL_*_FACTORY, sovrascrivibili dall'esterno.
       * MsalInterceptor va comunque dichiarato qui perche' usato come dipendenza in myServiceFactory.
       */
      MsalInterceptor,
      <% if (http !== 'none') { %>
      HttpInterceptorFakeService,
      <% } %>
    <%}%>
    /**
    * @author l.piciollo
    * inizializzazione della base url per le chiamate al BE, la configurazione prevede che venga valorizzata la chiave di accesso
    * nel file environment.
    */
    { provide: BASE_URL_API, useValue: environment.http.api.baseUrl },
     
    /**
    * @author l.piciollo
    * configurazione per la pl-library, si tratta di settare una configurazione iniziale di tutti i parametri
    * d'inizializzazione dell'applicativo
    */
    { provide: BROWSER_VALID, useValue: [<%=browserSupported%>] },  //Abilitati l'esecuzione del portale per il browser indicato
    { provide: DISABLE_LOG, useValue: environment.production }, //vengono disabilitati i log in caso di produzione
    { provide: MAX_CACHE_AGE, useValue: 300000 }, // viene impostato il tempo di validità per la cache di rete
    { provide: CACHE_TAG, useValue: '@cachable@' }, //indica come identificare le api che è possibile mettere in cache
 
    <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT" && http !== 'none') {%>
    /**
     * @author l.piciollo
     * intercettore msal per i reperimento del token in base allo scope per invocazione a microsoft graph
     * */
     { provide: HTTP_INTERCEPTORS, useFactory: myServiceFactory, multi: true, deps: [ HttpInterceptorFakeService, MsalInterceptor] },
    <%}%>

    /**
     * @author l.piciollo
     * Nota: la registrazione di HttpInterceptorService come HTTP_INTERCEPTORS avviene
     * in SharedModule.forRoot() (tramite provideHttpInterceptor), NON qui: registrarla
     * anche in InitializerModule causerebbe l'esecuzione doppia dell'interceptor (e quindi
     * doppio retry, doppio refresh-token, doppio timeout) per ogni singola richiesta HTTP.
     */
    /**
     * @author l.piciollo
     * viene iniettato il processo di login..
     * il servizio deve ritornare un ok che indica l'avvenuta login, altrimenti il portale non si avvia
     * Oltre alla login, vengono eseguite anche le eventuali funzioni di bootstrap custom
     * registrate tramite APP_BOOTSTRAP_TASKS (opzionale: se nessuna e' fornita, il
     * comportamento e' invariato rispetto alla sola login).
     */
    { provide: APP_INITIALIZER, useFactory:  AutenticationLoader, deps: [ AuthService, [new Optional(), APP_BOOTSTRAP_TASKS] ], multi: true },
    /**
    * @author l.piciollo
    * viene intercettata la creazione del portale.. 
    * viene identificato il tipo di browwser e vengono adeguate le funzionalita per il tipo di browser. 
    * l'adeguamento riane trasparente all'applicazione, il core ne gestisce le funzionalità
    */
    { provide: APP_INITIALIZER, useFactory:  AmbientModeProviderFactory, deps: [PlAmbientModeLoaderService], multi: true },
    /**
     * @author l.piciollo
     * impostazione tempo massimo di attesa per richieste al BE
     */
    { provide: DEFAULT_PATH_MOCK, useValue: "public/mock" } 
     
  ],
  exports: [
    PlCoreModule,
    NgxUiLoaderModule,
    NgxUiLoaderHttpModule,
    NgxUiLoaderRouterModule,
    <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") {%>
    MsalModule,
    <% } %>
  ]
})
export class    InitializerModule {

  /**
   * @author l.piciollo
   * Forza l'istanziazione eager di GlobalService all'avvio dell'applicazione
   * (indipendentemente da AZURE-ACTIVE-DIRECT/classic), cosi' che i listener di
   * eventi core (errori, cache HTTP, redirect, login su 401) vengano registrati
   * fin da subito, invece di attendere la prima injection "a domanda" da parte
   * di un componente qualsiasi.
   */
  private readonly globalService = inject(GlobalService);

  <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") { %>
  private readonly destroying$ = new Subject<void>();

    /**
     * @author l.piciollo
     * abilitato il supporto di intercettore di rotta per il controllo della login... in caso di mancata
     * login.. viene effettuato il redirect alla login .. 
     */
    constructor(
      private router: Router,
      private msalService: MsalService,
      private msalBroadcastService: MsalBroadcastService,
    ) {
      this.msalService.handleRedirectObservable().subscribe();

      this.msalBroadcastService.inProgress$.pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this.destroying$),
      ).subscribe(() => {
        const accounts = this.msalService.instance.getAllAccounts();
        if (accounts.length === 0) {
          this.msalService.loginRedirect();
        }
      });
    }

    ngOnDestroy(): void {
      this.destroying$.next();
      this.destroying$.complete();
    }
    <% } %>

  static forRoot() {
    return {
      ngModule:    InitializerModule,
      providers: [],
      import: []
    }
  }
}
