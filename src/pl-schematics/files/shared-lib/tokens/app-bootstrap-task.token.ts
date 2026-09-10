import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * @author l.piciollo
 * Funzione di bootstrap custom eseguita da InitializerModule (dopo la login,
 * se configurata) prima che l'applicazione venga effettivamente avviata.
 * Deve restituire un Observable/Promise che si risolve con true in caso di
 * successo; se l'observable/promise va in errore, il bootstrap
 * dell'applicazione viene bloccato (stessa semantica della login).
 */
export type AppBootstrapTask = () => Observable<boolean> | Promise<boolean>;

/**
 * @author l.piciollo
 * InjectionToken multi-provider per registrare funzioni di bootstrap custom
 * OPZIONALI, eseguite da InitializerModule oltre alla login (se abilitata).
 * Se non viene fornito nessun task, il comportamento e' invariato: nessun
 * blocco aggiuntivo, l'app parte non appena la login (o il suo bypass) e'
 * risolta.
 *
 * @example
 * // in AppModule o in un modulo feature, ad esempio per attendere il
 * // caricamento di feature flag/config remota prima di avviare l'app:
 * providers: [
 *   {
 *     provide: APP_BOOTSTRAP_TASKS,
 *     useFactory: (featureFlags: FeatureFlagsService) => () => featureFlags.load(),
 *     deps: [FeatureFlagsService],
 *     multi: true,
 *   },
 * ]
 */
export const APP_BOOTSTRAP_TASKS = new InjectionToken<AppBootstrapTask[]>(
  'APP_BOOTSTRAP_TASKS',
);
