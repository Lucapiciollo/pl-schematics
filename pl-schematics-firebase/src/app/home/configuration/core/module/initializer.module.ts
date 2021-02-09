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
import { APP_INITIALIZER, ErrorHandler, NgModule ,Injector} from '@angular/core';
import { NgxUiLoaderHttpModule, NgxUiLoaderModule, NgxUiLoaderRouterModule } from 'ngx-ui-loader';
import { BROWSER_VALID, CACHE_TAG, DISABLE_LOG, MAX_CACHE_AGE, PlAmbientModeLoaderService, PlCoreModule ,BROWSER, DEFAULT_PATH_MOCK} from 'pl-core-utils-library';
import { BASE_URL_API } from 'src/app/home/configuration/core/service/http.service';
import { UiLoaderConfig } from 'src/app/home/configuration/core/utils/UiLoaderConfig';
import { UiLoaderHttpConfig } from 'src/app/home/configuration/core/utils/UiLoaderHttpConfig';
import { UiLoaderRouterConfig } from 'src/app/home/configuration/core/utils/UiLoaderRouterConfig';
import { environment } from 'src/environments/environment';
import {DEFAULT_TIMEOUT, HttpInterceptorService } from 'src/app/home/configuration/core/interceptor/http-interceptor.service';
import {ErrorService } from 'src/app/home/configuration/core/service/error.service';
import {AuthService } from 'src/app/home/configuration/core/service/auth.service';
import AmbientModeProviderFactory from 'src/app/home/configuration/core/initializer/AmbientModeLoader';
import AutenticationLoader from "src/app/home/configuration/core/initializer/AutenticationLoader";


import { MSAL_CONFIG } from "@azure/msal-angular/dist/msal.service";
import { BroadcastService, MsalModule, MsalService,MsalGuard } from "@azure/msal-angular";
import { Router, NavigationStart,ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

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
    MsalModule
  
  ],
  providers: [  
    
    /**
     *  @author l.piciollo
     * inserimento servizi azure
     */  
      BroadcastService,
      MsalService,
    
    /**
    * @author l.piciollo
    * inizializzazione della base url per le chiamate al BE, la configurazione prevede che venga valorizzata la chiave di accesso
    * nel file environment.
    */
    { provide: BASE_URL_API, useValue: environment.baseUrlRemoteApi },
    /**
     * @author l.piciollo
     * vengono intercettati tutti gli errori applicativi e rediretti al servizio predisposto alla loro lavorazione,
     * è possibile specializzare il servizio per ogni eventualità di errore.    
     */
    { provide: ErrorHandler, useClass: ErrorService },
    /**
    * @author l.piciollo
    * configurazione per la pl-library, si tratta di settare una configurazione iniziale di tutti i parametri
    * d'inizializzazione dell'applicativo
    */
    { provide: BROWSER_VALID, useValue: [BROWSER.ALL] },  //Abilitati l'esecuzione del portale per il browser indicato
    { provide: DISABLE_LOG, useValue: environment.production }, //vengono disabilitati i log in caso di produzione
    { provide: MAX_CACHE_AGE, useValue: 300000 }, // viene impostato il tempo di validità per la cache di rete
    { provide: CACHE_TAG, useValue: '@cacable@' }, //indica come identificare le api che è possibile mettere in cache
    /**
     * @author l.piciollo
     * specializzazione di un intercettore di rete, per la gestione di request e response centralizzate.
     */
    { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true },
    /**
     * @author l.piciollo
     * viene iniettato il processo di login..
     * il servizio deve ritornare un ok che indica l'avvenuta login, altrimenti il portale non si avvia 
     */
    { provide: APP_INITIALIZER, useFactory: AutenticationLoader, deps: [AuthService ], multi: true },
    /**
    * @author l.piciollo
    * viene intercettata la creazione del portale.. 
    * viene identificato il tipo di browwser e vengono adeguate le funzionalita per il tipo di browser. 
    * l'adeguamento riane trasparente all'applicazione, il core ne gestisce le funzionalità
    */
    { provide: APP_INITIALIZER, useFactory: AmbientModeProviderFactory, deps: [PlAmbientModeLoaderService], multi: true },
    /**
     * @author l.piciollo
     * impostazione tempo massimo di attesa per richieste al BE
     */
    { provide: DEFAULT_TIMEOUT, useValue: 300000 },    
    { provide: DEFAULT_PATH_MOCK, useValue: "public/mock" },
     
    /**
     * @author l.piciollo
     * inizializzazione della configurazione per la login tramite active directory azure
     */
    { provide: MSAL_CONFIG, useValue: environment.azure }
    
  ],
  exports: [
    PlCoreModule,
    NgxUiLoaderModule,
    NgxUiLoaderHttpModule,
    NgxUiLoaderRouterModule,
    
    MsalModule
    
  ]
})
export class   InitializerModule {
  
  
    /**
     * @author l.piciollo
     * abilitato il supporto di intercettore di rotta per il controllo della login... in caso di mancata
     * login.. viene effettuato il redirect alla login .. 
     */
    constructor( private router: Router,private msalService:MsalService,private msalGuard: MsalGuard,private activatedRoute: ActivatedRoute) { 
      router.events.pipe(filter(event => event instanceof NavigationStart)).subscribe(event => {          
         try { 
           if (!msalGuard.canActivate(this.activatedRoute.snapshot,this.router.routerState.snapshot)) {
             this.msalService.loginRedirect();
          }  
        }catch(e){
          this.msalService.loginRedirect();
        }
      });
    }
    

  static forRoot() {
    return {
      ngModule:   InitializerModule,
      providers: [],
      import: []
    }
  }
}
