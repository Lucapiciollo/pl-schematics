import { MsalInterceptorConfiguration } from '@azure/msal-angular';
import { InteractionType } from '@azure/msal-browser';
import { environment } from '@env/environment';

export default function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
   const protectedResourceMap = new Map<string, Array<string>>();
   environment.azure.scope.protectedResourceMap.forEach((resource, ind) => {
      protectedResourceMap.set(resource[ind][0], [...resource[ind][1]]);
   });

   return {
      interactionType: InteractionType.Redirect,
      protectedResourceMap,
   };
}
