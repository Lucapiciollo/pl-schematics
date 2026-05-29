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
import { APP_INITIALIZER, NgModule } from '@angular/core'; 
import { NgxUiLoaderHttpModule, NgxUiLoaderModule, NgxUiLoaderRouterModule } from 'ngx-ui-loader';
import { BROWSER_VALID, CACHE_TAG, DISABLE_LOG, MAX_CACHE_AGE, PlAmbientModeLoaderService, PlCoreModule, DEFAULT_PATH_MOCK,BROWSER} from 'pl-core-utils-library';
import { BASE_URL_API } from '../../shared/http/http-interceptor.tokens';
import { UiLoaderConfig } from '../utils/UiLoaderConfig';
import { UiLoaderHttpConfig } from '../utils/UiLoaderHttpConfig';
import { UiLoaderRouterConfig } from '../utils/UiLoaderRouterConfig';
import { environment } from '../../../../environments/environment';
import { HttpInterceptorService } from '../interceptor/http-interceptor.service';
import { AuthService } from '../service/auth.service';
import AmbientModeProviderFactory from '../initializer/AmbientModeLoader';
import AutenticationLoader from "../initializer/AutenticationLoader";
import { HttpInterceptorFakeService } from "../interceptor/http-interceptor-fake.service";

<% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") {%>
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
,
    <% } %>
  ],
  providers: [  
    <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") {%>
      /** Configurazione istanza MSAL per autenticazione Azure AD. */
      {
         provide: MSAL_INSTANCE,
         useFactory: MSALInstanceFactory,
      },
      /** Configurazione guard MSAL (interaction, scopes, fallback route). */
      {
         provide: MSAL_GUARD_CONFIG,
         useFactory: MSALGuardConfigFactory,
      },
      /** Configurazione interceptor MSAL e mappa resource->scopes. */
      {
         provide: MSAL_INTERCEPTOR_CONFIG,
         useFactory: MSALInterceptorConfigFactory,
      },
      MsalService,
      MsalGuard,
      MsalBroadcastService,
       HttpInterceptorFakeService,
    <%}%>
     HttpInterceptorService,
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
 
    <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") {%>
    /**
     * @author l.piciollo
     * intercettore msal per i reperimento del token in base allo scope per invocazione a microsoft graph
     * */
     { provide: HTTP_INTERCEPTORS, useFactory: myServiceFactory, multi: true, deps: [ HttpInterceptorFakeService, MsalInterceptor] },
    <%}%>

       /**
     * @author l.piciollo
     * specializzazione di un intercettore di rete, per la gestione di request e response centralizzate.
     */
        { provide: HTTP_INTERCEPTORS, useClass:  HttpInterceptorService, multi: true },
    /**
     * @author l.piciollo
     * viene iniettato il processo di login..
     * il servizio deve ritornare un ok che indica l'avvenuta login, altrimenti il portale non si avvia 
     */
    { provide: APP_INITIALIZER, useFactory:  AutenticationLoader, deps: [ AuthService ], multi: true },
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
