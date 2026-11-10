/**
 * @author @l.piciollo
 * @desc Provider MSAL (Azure AD) condivisi tra architettura classic
 * (MsalAuthModule.forRoot) e standalone (provideCore).
 *
 * Le factory sono esposte tramite InjectionToken sovrascrivibili:
 *
 *   providePlMsal({
 *     instanceFactory: myCustomMSALInstanceFactory,
 *     guardConfigFactory: myCustomGuardFactory,
 *     interceptorConfigFactory: myCustomInterceptorFactory,
 *   })
 */
import { Provider } from '@angular/core';
import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalBroadcastService,
  MsalGuard,
  MsalGuardConfiguration,
  MsalInterceptor,
  MsalInterceptorConfiguration,
  MsalService,
} from '@azure/msal-angular';
import { IPublicClientApplication } from '@azure/msal-browser';

import {
  PL_MSAL_GUARD_CONFIG_FACTORY,
  PL_MSAL_INSTANCE_FACTORY,
  PL_MSAL_INTERCEPTOR_CONFIG_FACTORY,
} from './msal-auth.tokens';

import { MSALGuardConfigFactory } from './MSALGuardConfigFactory';
import { MSALInstanceFactory } from './MSALInstanceFactory';
import { MSALInterceptorConfigFactory } from './MSALInterceptorConfigFactory';

/** Configurazione opzionale per sovrascrivere le factory di default. */
export interface MsalAuthConfig {
  instanceFactory?: () => IPublicClientApplication;
  guardConfigFactory?: () => MsalGuardConfiguration;
  interceptorConfigFactory?: () => MsalInterceptorConfiguration;
}

export function providePlMsal(config: MsalAuthConfig = {}): Provider[] {
  return [
    {
      provide: PL_MSAL_INSTANCE_FACTORY,
      useValue: config.instanceFactory ?? MSALInstanceFactory,
    },
    {
      provide: PL_MSAL_GUARD_CONFIG_FACTORY,
      useValue: config.guardConfigFactory ?? MSALGuardConfigFactory,
    },
    {
      provide: PL_MSAL_INTERCEPTOR_CONFIG_FACTORY,
      useValue: config.interceptorConfigFactory ?? MSALInterceptorConfigFactory,
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: (factory: () => IPublicClientApplication) => factory(),
      deps: [PL_MSAL_INSTANCE_FACTORY],
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: (factory: () => MsalGuardConfiguration) => factory(),
      deps: [PL_MSAL_GUARD_CONFIG_FACTORY],
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: (factory: () => MsalInterceptorConfiguration) => factory(),
      deps: [PL_MSAL_INTERCEPTOR_CONFIG_FACTORY],
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    /** Usato come dipendenza dell'interceptor che sceglie tra MSAL e fake (contesto Teams). */
    MsalInterceptor,
  ];
}
