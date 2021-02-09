/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-22 16:25:52
 * @modify date 2019-12-22 16:25:52
 * @desc [funzionalità per l'intercettazione della creazione del portale e obbligare 
 * in caso non lo fosse, l'autenticazione da parte dell'utente]
 */

import { AuthService } from 'src/app/home/configuration/core/service/auth.service';


/**
* @author l.piciollo
* funzionalità per l'intercettazione della creazione del portale e obbligare 
* in caso non lo fosse, l'autenticazione da parte dell'utente
 * ATTENZIONE, NON SI CONSIGLIA LA MODIFICA DI QUESTA CLASSE A CAUSA DI OSSERVATORI ESTERNI CHE NE FANNO USO SPECIFICO.
  
 */
export default function AutenticationLoader(authService: AuthService) {
    return (): Promise<any> => {
        return new Promise((resolve, reject) => {
            /**
             * @author l.piciollo
             * invocazione al serivizio specializzato alla login, in caso di ko il portale non si avvia 
             */
            authService.login().subscribe(success => {
                resolve(success);
            }, err => {
                reject(err)
            })
        })
    };
}


