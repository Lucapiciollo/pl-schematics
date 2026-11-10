/**
 * @author l.piciollo
 * Modello (contratto) dell'environment applicativo: descrive la struttura che devono rispettare
 * environment.ts e environment.prod.ts. E' letto dal core (InitializerModule/provideCore, shared.config)
 * per configurare rete, i18n, logging, feature attive e, se abilitato, Azure AD.
 */
export interface AppEnvironment {
  /** true per la build di produzione (disabilita i log del core) */
  production: boolean;
  /** nome dell'applicazione */
  appName: string;
  /** versione dell'applicazione */
  appVersion: string;

  /** configurazione delle chiamate di rete */
  http: {
    api: {
      /** base url delle API del BE */
      baseUrl: string;
      /** percorso dei file mock locali */
      mock: string;
      /** url del servizio di autenticazione */
      auth: string;
      /** url del servizio di refresh del token */
      refreshToken: string;
    };
    /** timeout massimo (ms) delle richieste al BE */
    timeout: number;
    /** abilita il log dei tempi di esecuzione delle chiamate */
    enableExecutionTimeLog: boolean;
  };

  /** configurazione delle traduzioni */
  i18n: {
    /** lingua di default */
    defaultLanguage: string;
    /** lingue disponibili */
    availableLanguages: string[];
    /** percorso dei file di traduzione */
    assetsPath: string;
  };

  /** configurazione del logging */
  logging: {
    /** abilita o disabilita i log */
    enabled: boolean;
    /** livello minimo dei log da emettere */
    level: 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'OFF';
  };

  /** feature opzionali scelte in fase di generazione del progetto */
  features: {
    /** true se e' previsto un mock delle API (node-express o json-server) */
    mockApi: boolean;
    /** true se lo stato applicativo usa NgRx */
    ngrx: boolean;
    /** true se la UI usa Angular Material */
    material: boolean;
  };

  <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
  /** configurazione di Azure AD (MSAL) */
  azure: {
    /** client id dell'app registrata in Azure AD */
    clientId: string;
    /** authority (tenant) usata per la login */
    authority: string;
    /** uri di redirect dopo la login */
    redirectUri: string;
    /** uri di redirect dopo il logout */
    postLogoutRedirectUri: string;
    scope: {
      /** scope richiesti in fase di consenso */
      consentScopes: string[];
    };
  };
  <% } %>
}
