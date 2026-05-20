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

export const environment: AppEnvironment = {
  production: false,
  appName: '<%= dasherize(namePackage) %>',
  appVersion: '1.0.0',

  http: {
    api: {
      baseUrl: 'http://localhost:3001/api',
      mock: 'assets/public/mock/example',
      auth: 'http://localhost:3001/api/auth',
      refreshToken: 'http://localhost:3001/api/auth/refresh',
    },
    timeout: 30000,
    enableExecutionTimeLog: true,
  },

  i18n: {
    defaultLanguage: 'it',
    availableLanguages: [
      'it',
      'en',
    ],
    assetsPath: 'assets/public/i18n/',
  },

  logging: {
    enabled: true,
    level: 'DEBUG',
  },

  features: {
    mockApi: <%= mockApi === "node-express" || mockApi === "json-server" ? "true" : "false" %>,
    ngrx: <%= state === "ngrx" ? "true" : "false" %>,
    material: <%= ui === "material" ? "true" : "false" %>,
  },

  <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
  azure: {
    clientId: 'CHANGE_ME_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/CHANGE_ME_TENANT_ID',
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200',
    scope: {
      consentScopes: [
        'user.read',
      ],
    },
  },
  <% } %>
};