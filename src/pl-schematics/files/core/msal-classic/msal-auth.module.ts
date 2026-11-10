/**
 * @author @l.piciollo
 * @desc Modulo dedicato all'autenticazione MSAL (Azure AD), architettura classic.
 * Incapsula i provider MSAL (vedi msal-providers.ts, condiviso con l'architettura
 * standalone). Importare in InitializerModule con:
 *
 *   MsalAuthModule.forRoot()
 */
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MsalModule } from '@azure/msal-angular';

import { MsalAuthConfig, providePlMsal } from '../msal/msal-providers';

export type { MsalAuthConfig } from '../msal/msal-providers';

/**
 * @author l.piciollo
 * NgModule per l'autenticazione MSAL (Azure AD) nelle applicazioni classic: re-esporta MsalModule e,
 * tramite forRoot, registra i provider MSAL condivisi con l'architettura standalone.
 * E' importato da InitializerModule.
 */
@NgModule({
  imports: [MsalModule],
  exports: [MsalModule],
})
export class MsalAuthModule {
  /**
   * @author l.piciollo
   * Registra MsalAuthModule con i provider MSAL.
   * Chiamare una sola volta nella root (InitializerModule / AppModule).
   * @param config :factory MSAL opzionali per sovrascrivere i default
   * @returns il modulo con i provider MSAL (providePlMsal)
   */
  static forRoot(config: MsalAuthConfig = {}): ModuleWithProviders<MsalAuthModule> {
    return {
      ngModule: MsalAuthModule,
      providers: providePlMsal(config),
    };
  }
}
