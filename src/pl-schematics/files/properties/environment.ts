import { AppEnvironment } from './environment.model';

/**
 * @author l.piciollo
 * Environment di sviluppo: valori per l'esecuzione locale (API su localhost, log abilitati).
 * Viene sostituito da environment.prod.ts nella build di produzione tramite fileReplacements.
 */
export const environment: AppEnvironment = {
  production: false,
  appName: '<%= libBaseName %>',
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
    mockApi: <%= mockApi === "node-express" || mockApi === "json-server" %>,
    ngrx: <%= state === "ngrx" %>,
    material: <%= ui === "material" %>,
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