import { MsalGuardConfiguration } from '@azure/msal-angular';
import { InteractionType } from '@azure/msal-browser';
import { environment } from '@env/environment';

export default function MSALGuardConfigFactory(): MsalGuardConfiguration {
   return {
      interactionType: InteractionType.Redirect,
      authRequest: {
         scopes: environment.azure.scope.consentScopes,
      },
      loginFailedRoute: '#/login',
   };
}
