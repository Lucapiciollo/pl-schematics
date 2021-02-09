/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-21 15:25:51
 * @modify date 2019-12-21 15:25:51
 * @desc [intercettazione avvio applicazione, per il settaggio dell'ambiente, per determinare il tipo di browser..  
          l'applicazione non avrà inizio fin quando la funziona non termina con un OK 
*  ATTENZIONE, NON SI CONSIGLIA LA MODIFICA DI QUESTA CLASSE A CAUSA DI OSSERVATORI ESTERNI CHE NE FANNO USO SPECIFICO.]
 */

import { PlAmbientModeLoaderService } from 'pl-core-utils-library';
/**
* @author l.piciollo
* intercettazione avvio applicazione, per il settaggio dell'ambiente, per determinare il tipo di browser..  
* l'applicazione non avrà inizio fin quando la funziona non termina con un OK 
* ATTENZIONE, NON SI CONSIGLIA LA MODIFICA DI QUESTA CLASSE A CAUSA DI OSSERVATORI ESTERNI CHE NE FANNO USO SPECIFICO.
*/
export default function AmbientModeProviderFactory(ambientModeService: PlAmbientModeLoaderService) {
    return (): Promise<any> => {
        return new Promise((resolve, reject) => {
            /** caricamento dei dati per determinare l'ambiente, in caso di errore questo viene tramandato al gestore di errori
             * e l'applicazione non si avvierà
             */
            ambientModeService.detect().subscribe(success => {
                resolve(success)
            }, err => {
                reject(err);
            })
        })
    };
}
