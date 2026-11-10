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

/**
 * @author l.piciollo
 * Configurazione opzionale per sovrascrivere le factory MSAL di default.
 * Viene passata a providePlMsal (standalone) o a MsalAuthModule.forRoot (classic).
 */
export interface MsalAuthConfig {
  /** Factory alternativa che restituisce l'istanza MSAL (default: MSALInstanceFactory). */
  instanceFactory?: () => IPublicClientApplication;
  /** Factory alternativa per la configurazione di MsalGuard (default: MSALGuardConfigFactory). */
  guardConfigFactory?: () => MsalGuardConfiguration;
  /** Factory alternativa per la configurazione di MsalInterceptor (default: MSALInterceptorConfigFactory). */
  interceptorConfigFactory?: () => MsalInterceptorConfiguration;
}

/**
 * @author l.piciollo
 * Costruisce l'elenco dei provider MSAL (istanza, guard config, interceptor config e servizi MSAL)
 * leggendo le factory dagli InjectionToken PL_MSAL_*_FACTORY, valorizzati con quelle passate in config
 * oppure con i default del core. Usata sia da MsalAuthModule.forRoot (classic) sia da provideCore (standalone).
 * @param config :factory opzionali per sovrascrivere i default (se omesso si usano le factory di default)
 * @returns array di Provider da registrare nell'injector applicativo
 */
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
