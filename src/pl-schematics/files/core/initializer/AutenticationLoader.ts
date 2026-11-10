/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-22 16:25:52
 * @modify date 2026-09-10
 * @desc [funzionalità per l'intercettazione della creazione del portale e obbligare
 * in caso non lo fosse, l'autenticazione da parte dell'utente. Dopo la login (o il suo
 * bypass quando nessun provider e' configurato), esegue anche eventuali funzioni di
 * bootstrap custom registrate tramite l'injection token APP_BOOTSTRAP_TASKS: se non ne
 * e' stata fornita nessuna, il comportamento resta invariato rispetto a prima.]
 */

import { forkJoin, from, isObservable, Observable, of, switchMap } from 'rxjs';

import { AuthService } from '../service/auth.service';
import { APP_BOOTSTRAP_TASKS, AppBootstrapTask } from '<%= sharedLibName %>';

/**
 * @author l.piciollo
 * Esegue tutte le funzioni di bootstrap custom registrate (se presenti).
 * Ogni funzione puo' restituire un Observable o una Promise<boolean>: in entrambi i
 * casi viene normalizzata ad Observable prima di essere eseguita in parallelo con le
 * altre tramite forkJoin (se una fallisce, l'intero bootstrap fallisce).
 * @param tasks :elenco delle funzioni di bootstrap (APP_BOOTSTRAP_TASKS), null o vuoto se non ce ne sono
 * @returns Observable che emette true quando tutte le funzioni sono terminate (true subito se non ce ne sono)
 */
function runBootstrapTasks(
  tasks: AppBootstrapTask[] | null,
): Observable<boolean> {
  if (!tasks || tasks.length === 0) {
    return of(true);
  }

  const tasks$ = tasks.map((task) => {
    const result = task();

    return isObservable(result) ? result : from(Promise.resolve(result));
  });

  return forkJoin(tasks$).pipe(switchMap(() => of(true)));
}

/************************************************************************************************************************/

/**
* @author l.piciollo
* funzionalità per l'intercettazione della creazione del portale e obbligare
* in caso non lo fosse, l'autenticazione da parte dell'utente, oltre ad eventuali
* funzioni di bootstrap custom opzionali (APP_BOOTSTRAP_TASKS).
 * ATTENZIONE, NON SI CONSIGLIA LA MODIFICA DI QUESTA CLASSE A CAUSA DI OSSERVATORI ESTERNI CHE NE FANNO USO SPECIFICO.
 * @param authService :servizio di autenticazione applicativo che esegue la login
 * @param bootstrapTasks :funzioni di bootstrap custom (APP_BOOTSTRAP_TASKS), null se non fornite
 * @returns funzione di inizializzazione (APP_INITIALIZER) che restituisce una Promise, risolta a login e bootstrap riusciti
 */
export default function  AutenticationLoader(
    authService:  AuthService,
    bootstrapTasks: AppBootstrapTask[] | null,
) {
    /**
     * @author l.piciollo
     * Funzione di inizializzazione restituita dalla factory: esegue login e bootstrap tasks e risolve o rifiuta la Promise.
     * @returns Promise risolta con l'esito della login, rifiutata se login o bootstrap falliscono
     */
    return (): Promise<any> => {
        return new Promise((resolve, reject) => {
            /**
             * @author l.piciollo
             * invocazione al servizio specializzato alla login, in caso di ko il portale non si avvia.
             * Solo se la login va a buon fine vengono eseguite le eventuali funzioni di bootstrap
             * custom registrate: se anche una sola di queste fallisce, il portale non si avvia.
             */
            authService.login().pipe(
                switchMap((success) => runBootstrapTasks(bootstrapTasks).pipe(
                    switchMap(() => of(success)),
                )),
            ).subscribe({
                next: (success) => resolve(success),
                error: (err) => reject(err),
            });
        })
    };
}
