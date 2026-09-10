import { InjectionToken } from '@angular/core';

/**
 * @author l.piciollo
 * Puntamento all'indirizzo del BE (baseUrl per le chiamate HTTP).
 * Definito qui, nella libreria condivisa (sempre generata, indipendentemente
 * dall'opzione 'http' scelta in fase di installazione), perche' e' usato sia
 * da HttpService (nel progetto applicativo, sempre presente) sia, quando
 * abilitato, dall'HttpInterceptorService (anch'esso nella libreria condivisa).
 * Un solo InjectionToken condiviso evita che i due servizi finiscano per usare
 * due token diversi con lo stesso nome (bug gia' riscontrato in precedenza).
 */
export const BASE_URL_API = new InjectionToken<any>(
  "Puntamento all'indirizzo del BE",
);
