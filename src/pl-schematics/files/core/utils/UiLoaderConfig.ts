/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-22 00:34:19
 * @modify date 2019-12-22 00:34:19
 * @desc [configurazione per la visualizzazione nel tempo e nello stile delle progress]
 */
import { NgxUiLoaderConfig } from "ngx-ui-loader";

/**
 * @author l.piciollo
 * configurazione per la visualizzazione nel tempo e nello stile delle progress
 */
export const UiLoaderConfig: NgxUiLoaderConfig = {
  "bgsColor": "rgba(252,0,0,0.75)",
  "bgsOpacity": 1,
  "bgsPosition": "bottom-right",
  "bgsSize": 120,
  "bgsType": "ball-scale-multiple",
  "blur": 4,
  "fgsColor": "rgba(252,0,0,0.75)",
  "fgsPosition": "center-center",
  "fgsSize": 120,
  "fgsType": "ball-scale-multiple",
  "gap": 10,
  "logoPosition": "center-center",
  "logoSize": 120,
  "masterLoaderId": "master",
  "overlayBorderRadius": "0",
  "overlayColor": "rgba(40,40,40,0.39)",
  "pbColor": "#00c116",
  "pbDirection": "ltr",
  "pbThickness": 3,
  "hasProgressBar": false,
  "text": "",
  "textColor": "#FFFFFF",
  "textPosition": "center-center",
  "threshold": 50
}
