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
import { inject, Inject, Optional } from '@angular/core';
import { MsalBroadcastService, MsalGuard, MsalService, MSAL_GUARD_CONFIG, MSAL_INSTANCE } from '@azure/msal-angular';
import { MsalGuardConfiguration, MsalInterceptorConfiguration } from '@azure/msal-angular';
import { AccountInfo, AuthenticationResult, InteractionStatus, InteractionType, PublicClientApplication, LogLevel ,PopupRequest} from '@azure/msal-browser';
import { Client, AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client';
import { environment } from '../../../../environments/environment';
import { MSALGuardConfigFactory } from '../module/MSALGuardConfigFactory';
import { MSALInstanceFactory } from '../module/MSALInstanceFactory';
import { MSALInterceptorConfigFactory } from '../module/MSALInterceptorConfigFactory';
<% } %>


<% if (logging === "advanced") { %>
import { LoggerFeature } from '../logging/logger-feature.enum';
import { LoggerService } from '../logging/logger.service';
<% } %>

<% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
/**
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

  /** Chiamato quando il login MSAL va a buon fine. */
  abstract onUserAuthenticated(account: AccountInfo, result: AuthenticationResult): void;

  /** Chiamato quando viene avviato il logout. */
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
 * @author @l.piciollo
 */
@Injectable({
  providedIn: 'root',
})
export class  AuthService<% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %> implements OnDestroy<% } %> {

  <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
  /** Imposta il runtime corrente: 'web' | 'teams'. */
  static readonly applicationType: { type: string } = { type: '' };

  public graphClient!: Client;
  public interrupt = new Subject<void>();
  public token: string | null = null;

  public readonly broadcastService: MsalBroadcastService = inject(MsalBroadcastService);
  private readonly subscriptions = new Subscription();
  private readonly stateAdapter:  AuthStateAdapter | null = inject( AuthStateAdapter, { optional: true });
  <% if (logging === "advanced") { %>
    private readonly logger:  LoggerService  = inject( LoggerService);
   <% } %>
  constructor(
    @Inject(MSAL_INSTANCE) private readonly msalInstance: any,
    @Inject(MSAL_GUARD_CONFIG) private readonly msalGuardConfig: MsalGuardConfiguration,
  ) {
    if (this.stateAdapter) {
      this.subscriptions.add(
        this.stateAdapter.token$.subscribe(token => (this.token = token)),
      );
    }

    this.msalInstance.enableAccountStorageEvents();

    this.subscriptions.add(
      this.broadcastService.inProgress$
        .pipe(filter((status: InteractionStatus) => status === InteractionStatus.None))
        .subscribe(() => this.checkAndSetActiveAccount()),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.interrupt.complete();
  }

  /***********************************************************************************************/

  public login(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      const sub = this.loginEffect(observer).subscribe({
        error: err => observer.error(err),
      });
      return () => sub.unsubscribe();
    });
  }

  /***********************************************************************************************/

  public logout(popup: boolean = false): void {
    this.logoutEffect(popup);
  }

  /***********************************************************************************************/

  logoutEffect(popup: boolean = false): Observable<any> {
    this.interrupt.next();
    this.stateAdapter?.onUserLoggedOut();
    return popup
      ? this.msalInstance.logoutPopup({ mainWindowRedirectUri: '/' })
      : this.msalInstance.logoutRedirect();
  }

  /***********************************************************************************************/

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
                response = await this.msalInstance.acquireTokenSilent(accounts[0]);
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

  /***********************************************************************************************/

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

  /***********************************************************************************************/

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

  /***********************************************************************************************/

  private checkAndSetActiveAccount(): void {
    let activeAccount: AccountInfo | null = this.msalInstance.getActiveAccount();

    if (!activeAccount && this.msalInstance.getAllAccounts().length > 0) {
      const accounts: AccountInfo[] = this.msalInstance.getAllAccounts();
      this.msalInstance.setActiveAccount(accounts[0]);
      activeAccount = accounts[0];
    }

    if (!activeAccount) return;

    const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(
      this.msalInstance as PublicClientApplication,
      {
        account: activeAccount,
        scopes: environment.azure.scope.consentScopes,
        interactionType: InteractionType.Silent,
      },
    );
    this.graphClient = Client.initWithMiddleware({ authProvider });
  }

  <% } else { %>

  constructor(
    <% if (logging === "advanced") { %>
    private readonly logger:  LoggerService,
    <% } %>
  ) {}

  /***********************************************************************************************/

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

  /***********************************************************************************************/

  public logout(): void {
    <% if (logging === "advanced") { %>
    this.logger.debug( LoggerFeature.AUTH, 'Logout called without authentication provider');
    <% } %>
  }

  <% } %>
}
