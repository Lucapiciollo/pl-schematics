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

/**
 * @author l.piciollo
 * InjectionToken che contiene la factory dell'istanza MSAL (PublicClientApplication).
 * Il default e' MSALInstanceFactory (vedi msal-providers.ts); puo' essere sovrascritto dall'esterno.
 */
export const PL_MSAL_INSTANCE_FACTORY = new InjectionToken<() => IPublicClientApplication>(
  'PL_MSAL_INSTANCE_FACTORY'
);

/**
 * @author l.piciollo
 * InjectionToken che contiene la factory della configurazione di MsalGuard (tipo di interazione, scope, rotta di errore).
 * Il default e' MSALGuardConfigFactory; puo' essere sovrascritto dall'esterno.
 */
export const PL_MSAL_GUARD_CONFIG_FACTORY = new InjectionToken<() => MsalGuardConfiguration>(
  'PL_MSAL_GUARD_CONFIG_FACTORY'
);

/**
 * @author l.piciollo
 * InjectionToken che contiene la factory della configurazione di MsalInterceptor (mappa delle risorse protette e relativi scope).
 * Il default e' MSALInterceptorConfigFactory; puo' essere sovrascritto dall'esterno.
 */
export const PL_MSAL_INTERCEPTOR_CONFIG_FACTORY = new InjectionToken<() => MsalInterceptorConfiguration>(
  'PL_MSAL_INTERCEPTOR_CONFIG_FACTORY'
);
