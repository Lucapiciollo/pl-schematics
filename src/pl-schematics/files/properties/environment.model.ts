export interface AppEnvironment {
  production: boolean;
  appName: string;
  appVersion: string;

  http: {
    api: {
      baseUrl: string;
      mock: string;
      auth: string;
      refreshToken: string;
    };
    timeout: number;
    enableExecutionTimeLog: boolean;
  };

  i18n: {
    defaultLanguage: string;
    availableLanguages: string[];
    assetsPath: string;
  };

  logging: {
    enabled: boolean;
    level: 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'OFF';
  };

  features: {
    mockApi: boolean;
    ngrx: boolean;
    material: boolean;
  };

  <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
  azure: {
    clientId: string;
    authority: string;
    redirectUri: string;
    postLogoutRedirectUri: string;
    scope: {
      consentScopes: string[];
    };
  };
  <% } %>
}
