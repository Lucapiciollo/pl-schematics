/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-22 00:33:10
 * @modify date 2019-12-22 00:33:10
 * @desc [configurazione per la progressione di chiamate alla rete]
 */
import { NgxUiLoaderHttpConfig } from 'ngx-ui-loader';

/**
 * @author l.piciollo
 * configurazione per la progressione di chiamate alla rete
 */
export const UiLoaderHttpConfig: NgxUiLoaderHttpConfig ={
    exclude : [],
    excludeRegexp:[],
    loaderId: "httpLoader",
    showForeground: false
    
}