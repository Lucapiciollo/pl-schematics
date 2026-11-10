/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @desc [configurazione del loader grafico (libreria pl-loading-trace): barra al cambio di rotta e spinner
 * durante le chiamate di rete. Viene passata a PlLoadingTraceModule.forRoot (classic) o a providePlLoadingTrace
 * (standalone) e puo' essere modificata senza toccare il resto dell'applicazione.]
 */
import { PlLoadingTraceOptions } from 'pl-loading-trace';

/**
 * @author l.piciollo
 * Opzioni del loader grafico, divise per origine: 'shared' vale per tutti gli overlay, 'http' e 'router'
 * sovrascrivono 'shared' rispettivamente per le chiamate di rete e per i cambi di rotta.
 * Gli overlay vanno inseriti una sola volta nel template del componente root:
 * <pl-loading-overlay source="router" /> e <pl-loading-overlay source="http" />.
 * Altre opzioni (colori, posizione, label, excludeUrls, ...) sono descritte nel README di pl-loading-trace.
 */
export const plLoadingTraceOptions: PlLoadingTraceOptions = {
  /** valori comuni a tutti gli overlay: debounceMs evita il lampeggio per le richieste piu' brevi di 200 ms */
  shared: { debounceMs: 200 },
  /** chiamate di rete: spinner centrale con sfondo semi-trasparente che blocca l'interazione (modal) */
  http: { animationType: 'spinner', modal: true },
  /** cambio di rotta: barra di avanzamento in cima alla pagina */
  router: { animationType: 'bar' },
};
