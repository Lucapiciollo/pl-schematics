/**
 * @author @l.piciollo
 * @desc InjectionToken per le factory MSAL.
 *       Permettono di sovrascrivere le implementazioni default dall'esterno del modulo.
 *
 * Utilizzo override:
 *   MsalAuthModule.forRoot({
 *     instanceFactory: myCustomMSALInstanceFactory,
 *   })
 */
import { InjectionToken } from '@angular/core';
import { MsalGuardConfiguration, MsalInterceptorConfiguration } from '@azure/msal-angular';
import { IPublicClientApplication } from '@azure/msal-browser';

/** Factory che restituisce l'istanza MSAL (PublicClientApplication). */
export const PL_MSAL_INSTANCE_FACTORY = new InjectionToken<() => IPublicClientApplication>(
  'PL_MSAL_INSTANCE_FACTORY'
);

/** Factory che restituisce la configurazione MsalGuard. */
export const PL_MSAL_GUARD_CONFIG_FACTORY = new InjectionToken<() => MsalGuardConfiguration>(
  'PL_MSAL_GUARD_CONFIG_FACTORY'
);

/** Factory che restituisce la configurazione MsalInterceptor. */
export const PL_MSAL_INTERCEPTOR_CONFIG_FACTORY = new InjectionToken<() => MsalInterceptorConfiguration>(
  'PL_MSAL_INTERCEPTOR_CONFIG_FACTORY'
);
