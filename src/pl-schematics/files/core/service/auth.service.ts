/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-22 16:59:27
 * @modify date 2026-05-25
 * @desc [
 * Servizio per la centralizzazione dell'autenticazione utente.
 * Predispone login, logout e integrazione Azure/MSAL quando configurata.
 * ]
 */
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscriber, Subscription } from 'rxjs';



<% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
import { inject, Inject } from '@angular/core';
import { filter } from 'rxjs/operators';
import { MsalBroadcastService, MSAL_GUARD_CONFIG, MSAL_INSTANCE } from '@azure/msal-angular';
import { MsalGuardConfiguration, MsalInterceptorConfiguration } from '@azure/msal-angular';
import { AccountInfo, AuthenticationResult, InteractionStatus, PopupRequest } from '@azure/msal-browser';
import { AuthenticationProvider, Client } from '@microsoft/microsoft-graph-client';
import { environment } from '../../../../<%= nsUp %>environments/environment';
<% } %>


<% if (logging === "advanced") { %>
import { LoggerFeature } from '<%= sharedLibName %>';
import { LoggerService } from '<%= sharedLibName %>';
<% } %>

<% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
/**
 * @author l.piciollo
 * Abstract adapter che disaccoppia  AuthService da qualsiasi libreria di state management.
 *
 * Implementa questa classe e forniscila via DI per integrare  AuthService
 * con NgRx, Signals, BehaviorSubject o qualsiasi altro meccanismo.
 * L'adapter e' @Optional: se non fornito, il servizio funziona standalone.
 *
 * @example
 * @Injectable({ providedIn: 'root' })
 * export class MyNgrxAuthAdapter extends  AuthStateAdapter {
 *   readonly token$ = this.store.select(selectToken);
 *   constructor(private store: Store) { super(); }
 *   onUserAuthenticated(account, result) { this.store.dispatch(setUser({ account, result })); }
 *   onUserLoggedOut() { this.store.dispatch(clearUser()); }
 * }
 */
export abstract class  AuthStateAdapter {
  /** Observable del token di autenticazione corrente. */
  abstract readonly token$: Observable<string | null>;

  /**
   * @author l.piciollo
   * Chiamato quando il login MSAL va a buon fine: permette di propagare utente e token allo store scelto.
   * @param account :account MSAL autenticato
   * @param result  :risultato completo dell'autenticazione (token, scope, ecc.)
   */
  abstract onUserAuthenticated(account: AccountInfo, result: AuthenticationResult): void;

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Chiamato quando viene avviato il logout: permette di ripulire lo stato utente nello store scelto.
   */
  abstract onUserLoggedOut(): void;
}
<% } %>

/**
 * Servizio centralizzato di autenticazione.
 *
 * <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
 * Costruito su MSAL: gestisce login, logout e client MS Graph senza accoppiare
 * il chiamante a una libreria di state management specifica.
 * L'integrazione con NgRx (o altri store) e' opt-in tramite  AuthStateAdapter.
 * <% } else { %>
 * Login disabilitata — il sistema emula l'utente autenticato all'avvio.
 * Inserire qui un SSO custom se necessario.
 * <% } %>
 *
 * @author l.piciollo
 */
@Injectable({
  providedIn: 'root',
})
export class  AuthService<% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %> implements OnDestroy, AuthenticationProvider<% } %> {

  <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
  /** Imposta il runtime corrente: 'web' | 'teams'. */
  static readonly applicationType: { type: string } = { type: '' };

  /** client Microsoft Graph, inizializzato quando esiste un account attivo */
  public graphClient!: Client;
  /** Subject emesso al logout per interrompere le operazioni in corso */
  public interrupt = new Subject<void>();
  /** token di autenticazione corrente, aggiornato dall'eventuale AuthStateAdapter */
  public token: string | null = null;

  /** servizio MSAL che notifica lo stato delle interazioni di login */
  public readonly broadcastService: MsalBroadcastService = inject(MsalBroadcastService);
  /** insieme delle sottoscrizioni da chiudere in ngOnDestroy */
  private readonly subscriptions = new Subscription();
  /** adapter opzionale verso lo state management (NgRx, Signals, ecc.) */
  private readonly stateAdapter:  AuthStateAdapter | null = inject( AuthStateAdapter, { optional: true });
  <% if (logging === "advanced") { %>
    /** logger applicativo avanzato */
    private readonly logger:  LoggerService  = inject( LoggerService);
   <% } %>
  /**
   * @author l.piciollo
   * Costruttore (login Azure): collega il token dell'eventuale adapter, abilita la sincronizzazione account tra tab e,
   * a interazione MSAL conclusa, imposta l'account attivo e inizializza il client Graph.
   * @param msalInstance :istanza MSAL (token MSAL_INSTANCE)
   * @param msalGuardConfig :configurazione della guard MSAL (token MSAL_GUARD_CONFIG), usata per authRequest
   */
  constructor(
    @Inject(MSAL_INSTANCE) private readonly msalInstance: any,
    @Inject(MSAL_GUARD_CONFIG) private readonly msalGuardConfig: MsalGuardConfiguration,
  ) {
    if (this.stateAdapter) {
      this.subscriptions.add(
        this.stateAdapter.token$.subscribe(token => (this.token = token)),
      );
    }

    // msal-browser v5 sincronizza gli account tra tab da solo: il metodo esiste solo nelle versioni precedenti.
    this.msalInstance.enableAccountStorageEvents?.();

    this.subscriptions.add(
      this.broadcastService.inProgress$
        .pipe(filter((status: InteractionStatus) => status === InteractionStatus.None))
        .subscribe(() => this.checkAndSetActiveAccount()),
    );
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Rilascia le sottoscrizioni e completa il Subject interrupt alla distruzione del servizio.
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.interrupt.complete();
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Avvia il flusso di login MSAL (tentativo silent, poi redirect o popup).
   * @returns Observable<boolean> che emette true se l'utente risulta autenticato e poi completa; propaga l'errore in caso di KO
   */
  public login(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      const sub = this.loginEffect(observer).subscribe({
        error: err => observer.error(err),
      });
      return () => sub.unsubscribe();
    });
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Esegue il logout MSAL delegando a logoutEffect.
   * @param popup :se true usa il logout in finestra popup, altrimenti redirect (default false)
   */
  public logout(popup: boolean = false): void {
    this.logoutEffect(popup);
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Logout MSAL: interrompe le operazioni in corso (interrupt), notifica l'adapter e avvia il logout popup o redirect.
   * @param popup :se true usa il logout in finestra popup, altrimenti redirect (default false)
   * @returns risultato della chiamata MSAL di logout (popup o redirect)
   */
  logoutEffect(popup: boolean = false): Observable<any> {
    this.interrupt.next();
    this.stateAdapter?.onUserLoggedOut();
    return popup
      ? this.msalInstance.logoutPopup({ mainWindowRedirectUri: '/' })
      : this.msalInstance.logoutRedirect();
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Flusso di autenticazione MSAL: initialize, gestione del redirect, token silent e, in caso di fallimento, login redirect o popup.
   * Notifica l'esito sia sull'Observable restituito sia sul subscriber ricevuto.
   * @param obs :subscriber esterno su cui viene notificato l'esito (true/false) del login
   * @returns Observable che emette il risultato di autenticazione MSAL e poi completa
   */
  loginEffect(obs: Subscriber<any>): Observable<any> {
    return new Observable<any>(ob => {
      this.msalInstance.initialize().then(() => {
        this.msalInstance
          .handleRedirectPromise()
          .then(async (response: AuthenticationResult | null) => {
            if (!response) {
              const accounts: AccountInfo[] = this.msalInstance.getAllAccounts();
              this.msalInstance.setActiveAccount(accounts[0]);
              try {
                response = await this.msalInstance.acquireTokenSilent({
                  account: accounts[0],
                  scopes: environment.azure.scope.consentScopes,
                });
              } catch {
                try {
                  this.loginRedirect();
                } catch {
                  this.loginPopup(obs);
                }
                return;
              }
            }

            if (response) {
              this.stateAdapter?.onUserAuthenticated(response.account, response);
            }

            ob.next(response);
            ob.complete();
            obs.next(!!response);
            obs.complete();
          })
          .catch((error: any) => {
            <% if (logging === "advanced") { %>
            this.logger.error( LoggerFeature.AUTH, 'Login failed', error);
            <% } else { %>
            console.error(error);
            <% } %>
            ob.error(error);
            obs.error(error);
          });
      });
    });
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Avvia il login tramite redirect, usando authRequest della configurazione della guard quando presente.
   */
  private loginRedirect(): void {
    if (this.msalGuardConfig.authRequest) {
      this.msalInstance
        .loginRedirect({ ...this.msalGuardConfig.authRequest })
        .then((res: any) => {
          <% if (logging === "advanced") { %>
          this.logger.debug( LoggerFeature.AUTH, 'loginRedirect response', res);
          <% } else { %>
          console.debug(res);
          <% } %>
        })
        .catch((err: any) => {
          <% if (logging === "advanced") { %>
          this.logger.error( LoggerFeature.AUTH, 'loginRedirect error', err);
          <% } else { %>
          console.error(err);
          <% } %>
        });
    } else {
      this.msalInstance.loginRedirect();
    }
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Avvia il login tramite popup, usando authRequest della configurazione della guard quando presente.
   * @param obs :subscriber notificato con true se il login riesce, false se fallisce
   */
  private loginPopup(obs: Subscriber<any>): void {
    const popup$: Observable<AuthenticationResult> = this.msalGuardConfig.authRequest
      ? this.msalInstance.loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
      : this.msalInstance.loginPopup();

    this.subscriptions.add(
      popup$.subscribe({
        next: (response: AuthenticationResult) => {
          this.msalInstance.setActiveAccount(response.account);
          obs.next(true);
          obs.complete();
        },
        error: (err: any) => {
          <% if (logging === "advanced") { %>
          this.logger.error( LoggerFeature.AUTH, 'loginPopup error', err);
          <% } else { %>
          console.error(err);
          <% } %>
          obs.next(false);
          obs.complete();
        },
      }),
    );
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Se non c'e' un account attivo ma ne esistono di autenticati, imposta il primo come attivo; con un account attivo inizializza il client Graph.
   */
  private checkAndSetActiveAccount(): void {
    let activeAccount: AccountInfo | null = this.msalInstance.getActiveAccount();

    if (!activeAccount && this.msalInstance.getAllAccounts().length > 0) {
      const accounts: AccountInfo[] = this.msalInstance.getAllAccounts();
      this.msalInstance.setActiveAccount(accounts[0]);
      activeAccount = accounts[0];
    }

    if (!activeAccount) return;

    this.graphClient = Client.initWithMiddleware({ authProvider: this });
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * AuthenticationProvider di Microsoft Graph: restituisce un access token (silent) per gli scope
   * configurati in environment.azure.scope.consentScopes.
   * @returns Promise con l'access token dell'account attivo (o del primo account disponibile)
   */
  public async getAccessToken(): Promise<string> {
    const account: AccountInfo | undefined =
      this.msalInstance.getActiveAccount() || this.msalInstance.getAllAccounts()[0];

    const result: AuthenticationResult = await this.msalInstance.acquireTokenSilent({
      account,
      scopes: environment.azure.scope.consentScopes,
    });

    return result.accessToken;
  }

  <% } else { %>

  /**
   * @author l.piciollo
   * Costruttore (login disabilitata): inietta il logger quando e' attivo il logging advanced.
   * @param logger :logger applicativo (presente solo con logging advanced)
   */
  constructor(
    <% if (logging === "advanced") { %>
    private readonly logger:  LoggerService,
    <% } %>
  ) {}

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Login disabilitata: emula l'utente autenticato e consente l'avvio applicativo. Punto in cui inserire un eventuale SSO custom.
   * @returns Observable<boolean> che emette sempre true e poi completa
   */
  public login(): Observable<boolean> {
    return new Observable<boolean>((observer: Subscriber<boolean>) => {
      /**
       * Login disabilitata.
       * Il sistema emula l'utente autenticato e consente lo start applicativo.
       *
       * Inserire qui un SSO custom:
       * - observer.next(true) + observer.complete() in caso OK
       * - observer.error(...) in caso KO
       */
      <% if (logging === "advanced") { %>
      this.logger.debug( LoggerFeature.AUTH, 'Login bypass — no authentication provider configured');
      <% } %>
      observer.next(true);
      observer.complete();
    });
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Logout senza provider di autenticazione: non esegue alcuna operazione (solo log in modalita' advanced).
   */
  public logout(): void {
    <% if (logging === "advanced") { %>
    this.logger.debug( LoggerFeature.AUTH, 'Logout called without authentication provider');
    <% } %>
  }

  <% } %>
}
