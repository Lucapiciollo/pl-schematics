/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-22 00:32:28
 * @modify date 2019-12-22 00:32:28
 * @desc [configurazione per la progressione di chiamate al cambio rotta]
 */
import { NgxUiLoaderRouterConfig } from 'ngx-ui-loader';

/**
 * @author l.piciollo
 * configurazione per la progressione di chiamate al cambio rotta
 */
export const UiLoaderRouterConfig: NgxUiLoaderRouterConfig = {
    /** id del loader associato ai cambi di rotta; showForeground true: mostrato in primo piano */
    loaderId: "routerLoader", showForeground: true
}