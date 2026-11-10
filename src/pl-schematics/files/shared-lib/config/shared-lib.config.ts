import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders, Provider } from '@angular/core';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
<% if (i18n === "ngx-translate") { %>
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
<% } %>
<% if (logging === "advanced") { %>
import { LoggerLevel } from '../logging/logger-level.enum';
import { provideLogger } from '../logging/logger-provider';
<% } %>
<% if (http === "interceptor-functional" && standalone) { %>
import { httpInterceptorFn, provideHttpInterceptorConfig } from '../http/http-interceptor.provider';
<% } else if (http === "interceptor-classic" || http === "interceptor-functional") { %>
import { provideHttpInterceptor } from '../http/http-interceptor.provider';
<% } %>

/**
 * @author l.piciollo
 * Configurazione della libreria condivisa. La libreria NON importa mai il file
 * environment dell'applicazione (una libreria non puo' dipendere dall'app): l'app
 * passa questi valori a SharedModule.forRoot(config) (classic) o a
 * providePlShared(config) (standalone), oppure li fornisce con il token
 * SHARED_LIB_CONFIG.
 */
export interface SharedLibConfig {
  /** impostazioni di internazionalizzazione (usate solo con ngx-translate) */
  i18n?: {
    /** Lingua di default e di fallback (es. 'it'). */
    defaultLanguage: string;
    /** Cartella dei file di traduzione servita dall'app (es. 'assets/public/i18n/'). */
    assetsPath: string;
  };
  /** impostazioni dell'intercettore HTTP (usate solo se l'intercettore e' abilitato) */
  http?: {
    /** Timeout di default in ms delle chiamate HTTP. */
    timeout: number;
    /** Frammento di URL che identifica la chiamata di refresh-token. */
    refreshToken: string;
    /** abilita il log del tempo di esecuzione delle chiamate */
    enableExecutionTimeLog: boolean;
  };
  /** impostazioni del logger applicativo (usate solo con logging avanzato) */
  logging?: {
    /** interruttore generale del logging */
    enabled: boolean;
    /** 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'OFF' */
    level: string;
  };
}

/**
 * @author l.piciollo
 * InjectionToken con cui l'app puo' fornire la configurazione della libreria condivisa (SharedLibConfig).
 * Viene valorizzato da providePlShared (e quindi anche da SharedModule.forRoot).
 */
export const SHARED_LIB_CONFIG = new InjectionToken<SharedLibConfig>('SHARED_LIB_CONFIG');

/**
 * @author l.piciollo
 * Provider della libreria condivisa: HttpClient (con gli interceptor registrati
 * nel DI<% if (http === "interceptor-functional" && standalone) { %> e quello funzionale<% } %>)<% if (i18n === "ngx-translate") { %>, ngx-translate<% } %>.
 * Da usare nei providers dell'applicazione standalone (nelle app classic si usa SharedModule.forRoot).
 * @param config   :configurazione della libreria condivisa (lingua, timeout HTTP, logging)
 * @returns provider di ambiente Angular da registrare nel bootstrap
 */
export function providePlShared(config: SharedLibConfig): EnvironmentProviders {
  const providers: (Provider | EnvironmentProviders)[] = [
    { provide: SHARED_LIB_CONFIG, useValue: config },
  ];

  <% if (logging === "advanced") { %>
  providers.push(
    provideLogger({
      enabled: config.logging ? config.logging.enabled : true,
      level: config.logging ? (LoggerLevel as any)[config.logging.level] ?? LoggerLevel.DEBUG : LoggerLevel.DEBUG,
      features: {},
      showTimestamp: true,
      showFeature: true,
    }),
  );
  <% } %>

  <% if (http === "interceptor-classic" || http === "interceptor-functional") { %>
  const httpConfig = config.http
    ? {
        defaultTimeout: config.http.timeout,
        refreshUrlIncludes: config.http.refreshToken,
        enableExecutionTimeLog: config.http.enableExecutionTimeLog,
        reloadOnRefreshFailure: true,
      }
    : { reloadOnRefreshFailure: true };
  <% if (http === "interceptor-functional" && standalone) { %>
  providers.push(
    provideHttpInterceptorConfig(httpConfig),
    provideHttpClient(withInterceptors([httpInterceptorFn]), withInterceptorsFromDi()),
  );
  <% } else { %>
  providers.push(
    provideHttpInterceptor(httpConfig),
    provideHttpClient(withInterceptorsFromDi()),
  );
  <% } %>
  <% } else { %>
  providers.push(provideHttpClient(withInterceptorsFromDi()));
  <% } %>

  <% if (i18n === "ngx-translate") { %>
  const language = config.i18n ? config.i18n.defaultLanguage : 'it';
  const assetsPath = config.i18n ? config.i18n.assetsPath : 'assets/public/i18n/';

  providers.push(
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './' + assetsPath.replace(/^\.?\//, ''),
        suffix: '.json',
      }),
      fallbackLang: language,
      lang: language,
    }),
  );
  <% } %>

  return makeEnvironmentProviders(providers);
}
