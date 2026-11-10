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

@NgModule({
  imports: [MsalModule],
  exports: [MsalModule],
})
export class MsalAuthModule {
  /**
   * Registra MsalAuthModule con i provider MSAL.
   * Chiamare una sola volta nella root (InitializerModule / AppModule).
   */
  static forRoot(config: MsalAuthConfig = {}): ModuleWithProviders<MsalAuthModule> {
    return {
      ngModule: MsalAuthModule,
      providers: providePlMsal(config),
    };
  }
}
