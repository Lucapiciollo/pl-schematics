/**
 * @author @l.piciollo
 * @desc Modulo dedicato all'autenticazione MSAL (Azure AD).
 *
 * Incapsula tutti i provider MSAL e li espone tramite InjectionToken
 * sovrascrivibili. Importare in InitializerModule con:
 *
 *   MsalAuthModule.forRoot()
 *
 * Per usare factory personalizzate:
 *
 *   MsalAuthModule.forRoot({
 *     instanceFactory: myCustomMSALInstanceFactory,
 *     guardConfigFactory: myCustomGuardFactory,
 *     interceptorConfigFactory: myCustomInterceptorFactory,
 *   })
 *
 * ATTENZIONE: non modificare i provider interni senza aggiornare i token.
 */
import { ModuleWithProviders, NgModule } from '@angular/core';
import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalBroadcastService,
  MsalGuard,
  MsalModule,
  MsalService,
} from '@azure/msal-angular';
import { IPublicClientApplication } from '@azure/msal-browser';
import { MsalGuardConfiguration, MsalInterceptorConfiguration } from '@azure/msal-angular';

import {
  PL_MSAL_GUARD_CONFIG_FACTORY,
  PL_MSAL_INSTANCE_FACTORY,
  PL_MSAL_INTERCEPTOR_CONFIG_FACTORY,
} from './msal-auth.tokens';

import { MSALGuardConfigFactory } from '../MSALGuardConfigFactory';
import { MSALInstanceFactory } from '../MSALInstanceFactory';
import { MSALInterceptorConfigFactory } from '../MSALInterceptorConfigFactory';

/** Configurazione opzionale per sovrascrivere le factory di default. */
export interface MsalAuthConfig {
  instanceFactory?: () => IPublicClientApplication;
  guardConfigFactory?: () => MsalGuardConfiguration;
  interceptorConfigFactory?: () => MsalInterceptorConfiguration;
}

@NgModule({
  imports: [MsalModule],
  exports: [MsalModule],
})
export class MsalAuthModule {
  /**
   * Registra MsalAuthModule con i provider MSAL.
   * Chiamare una sola volta nella root (InitializerModule / AppModule).
   *
   * @param config  Factory opzionali; se omesse si usano le implementazioni di default.
   */
  static forRoot(config: MsalAuthConfig = {}): ModuleWithProviders<MsalAuthModule> {
    return {
      ngModule: MsalAuthModule,
      providers: [
        // ── Token che espongono le factory (sovrascrivibili dall'esterno) ──────
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

        // ── Provider MSAL che leggono dai token ──────────────────────────────
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

        // ── Servizi MSAL ──────────────────────────────────────────────────────
        MsalService,
        MsalGuard,
        MsalBroadcastService,
      ],
    };
  }
}
