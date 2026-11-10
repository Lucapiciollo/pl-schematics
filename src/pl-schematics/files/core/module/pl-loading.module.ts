/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @desc [modulo del loader grafico (libreria pl-loading-trace) per le app classic: barra al cambio di rotta e
 * spinner durante le chiamate di rete. Va importato in AppModule PRIMA di SharedModule.forRoot (lo fa lo schematic),
 * vedi la nota sull'ordine degli interceptor piu' sotto.]
 */
import { NgModule } from '@angular/core';
import { PlLoadingRegistryService, PlLoadingTraceModule } from 'pl-loading-trace';
import { plLoadingTraceOptions } from '../utils/pl-loading.config';

/**
 * @author l.piciollo
 * Modulo del loader grafico. Gli overlay <pl-loading-overlay> stanno nel template del componente root
 * (AppModule lo importa e questo modulo riesporta PlLoadingTraceModule); la configurazione e' in
 * core/utils/pl-loading.config.ts.
 *
 * ORDINE DEGLI INTERCEPTOR: PlLoadingTraceModule.forRoot registra gia' l'interceptor HTTP del loader in HTTP_INTERCEPTORS
 * (non va registrato una seconda volta). Deve restare PRIMA di quello di SharedModule.forRoot (HttpInterceptorService, che
 * fa retry e refresh-token): cosi' avvolge tutti i tentativi e conta una sola richiesta; se fosse dopo, ogni fallimento
 * intermedio rilascerebbe il contatore del loader (spinner nascosto durante i retry o per altre richieste ancora in corso).
 */
@NgModule({
  imports: [PlLoadingTraceModule.forRoot(plLoadingTraceOptions)],
  providers: [
    /**
     * @author l.piciollo
     * PlLoadingTraceModule.forRoot (v1.2.x) non fornisce PlLoadingRegistryService, richiesto da <pl-loading-overlay>:
     * senza questo provider l'overlay non viene creato (NullInjectorError).
     */
    PlLoadingRegistryService,
  ],
  exports: [PlLoadingTraceModule],
})
export class PlLoadingModule {}
