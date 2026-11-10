import { AppEnvironment } from './environment.model';

/**
 * @author l.piciollo
 * Environment di produzione: url relativi, log disabilitati e mock API spento.
 * Sostituisce environment.ts nella build di produzione.
 */
export const environment: AppEnvironment = {
  production: true,
  appName: '<%= libBaseName %>',
  appVersion: '1.0.0',

  http: {
    api: {
      baseUrl: '/api',
      mock: 'assets/public/mock/example',
      auth: '/api/auth',
      refreshToken: '/api/auth/refresh',
    },
    timeout: 30000,
    enableExecutionTimeLog: false,
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
    enabled: false,
    level: 'ERROR',
  },

  features: {
    mockApi: false,
    ngrx: <%= state === "ngrx" %>,
    material: <%= ui === "material" %>,
  },

  <% if (loginSupportConfiguration === "AZURE-ACTIVE-DIRECT") { %>
  azure: {
    clientId: 'CHANGE_ME_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/CHANGE_ME_TENANT_ID',
    redirectUri: '/',
    postLogoutRedirectUri: '/',
    scope: {
      consentScopes: [
        'user.read',
      ],
    },
  },
  <% } %>
};