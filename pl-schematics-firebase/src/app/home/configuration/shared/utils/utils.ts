/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-21 23:18:12
 * @modify date 2019-12-21 23:18:12
 * @desc [Classe di utilita, qui vengono elencate tutte le funzionalità per l'itera applicazione.]
 */
import { UUID } from "angular2-uuid";
import { ErrorBean, ErrorCode } from 'src/app/home/configuration/core/bean/error-bean';

/**
 * @author l.piciollo
 * classe di utilità, qui vengono elencate tutte le funzioni utili per tutta l'applicazione
 */
export class Utils {
  /**
   * @author l.piciollo
   * genera un UUID da assegnare a componenti grafici come ID o altro
   */
  public static UUIDCODE(): any {
    try {
      return UUID.UUID();
    } catch (error) {
      throw new ErrorBean(error.message, ErrorCode.SYSTEMERRORCODE, false, false);
    }
  }
}
