import { MsalInterceptorConfiguration } from '@azure/msal-angular';
import { InteractionType } from '@azure/msal-browser';
import { environment } from '../../../../<%= nsUp %>environments/environment';

/**
 * @author l.piciollo
 * Factory di default della configurazione di MsalInterceptor: associa le risorse protette (Microsoft Graph 'me'
 * e la base url del BE) agli scope di consenso presi dall'environment, con interazione di tipo Redirect.
 * @returns la configurazione MsalInterceptorConfiguration usata dall'interceptor MSAL
 */
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>([
    ['https://graph.microsoft.com/v1.0/me', environment.azure.scope.consentScopes],
    [environment.http.api.baseUrl, environment.azure.scope.consentScopes],
  ]);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}

export default MSALInterceptorConfigFactory;
