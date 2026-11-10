import { MsalGuardConfiguration } from '@azure/msal-angular';
import { InteractionType } from '@azure/msal-browser';
import { environment } from '../../../../<%= nsUp %>environments/environment';

/**
 * @author l.piciollo
 * Factory di default della configurazione di MsalGuard: interazione di tipo Redirect, scope di consenso
 * presi dall'environment e rotta '/login-failed' in caso di login fallita.
 * @returns la configurazione MsalGuardConfiguration usata dal guard MSAL
 */
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: environment.azure.scope.consentScopes,
    },
    loginFailedRoute: '/login-failed',
  };
}

export default MSALGuardConfigFactory;
