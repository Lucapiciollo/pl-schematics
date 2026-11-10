import { SharedLibConfig } from '<%= sharedLibName %>';
import { environment } from '../../../../<%= nsUp %>environments/environment';

/**
 * @author l.piciollo
 * Configurazione della libreria condivisa (<%= sharedLibName %>) ricavata dall'environment
 * dell'app: la libreria non puo' importare l'environment, quindi la config viaggia da qui.
 */
export const appSharedConfig: SharedLibConfig = {
  /** configurazione i18n: lingua di default e percorso dei file di traduzione */
  i18n: {
    defaultLanguage: environment.i18n.defaultLanguage,
    assetsPath: environment.i18n.assetsPath,
  },
  /** configurazione HTTP: timeout, url di refresh del token e log dei tempi di esecuzione */
  http: {
    timeout: environment.http.timeout,
    refreshToken: environment.http.api.refreshToken,
    enableExecutionTimeLog: environment.http.enableExecutionTimeLog,
  },
  /** configurazione del logging: abilitazione e livello minimo */
  logging: {
    enabled: environment.logging.enabled,
    level: environment.logging.level,
  },
};
