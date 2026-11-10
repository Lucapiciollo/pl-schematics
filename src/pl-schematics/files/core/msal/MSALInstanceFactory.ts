import { IPublicClientApplication, PublicClientApplication, LogLevel } from '@azure/msal-browser';
import { environment } from '../../../../<%= nsUp %>environments/environment';

/**
 * @author l.piciollo
 * Factory di default dell'istanza MSAL (PublicClientApplication): legge clientId, authority e redirect URI
 * dall'environment, usa localStorage come cache e instrada i log MSAL su console (solo errori e warning, mai dati PII).
 * @returns l'istanza MSAL (IPublicClientApplication) usata per l'autenticazione Azure AD
 */
export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.azure.clientId,
      authority: environment.azure.authority,
      redirectUri: environment.azure.redirectUri,
      postLogoutRedirectUri: environment.azure.postLogoutRedirectUri,
    },
    cache: {
      cacheLocation: 'localStorage',
    },
    system: {
      loggerOptions: {
        loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
          if (containsPii) {
            return;
          }
          switch (level) {
            case LogLevel.Error:
              console.error(message);
              break;
            case LogLevel.Warning:
              console.warn(message);
              break;
            default:
              break;
          }
        },
      },
    },
  });
}

export default MSALInstanceFactory;
