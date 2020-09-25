/**
 * @author @l.piciollo
 * @email l.piciollo@accenture.com
 * @create date 2019-12-21 23:18:12
 * @modify date 2019-12-21 23:18:12
 * @desc [Classe di utilita, qui vengono elencate tutte le funzionalità per l'itera applicazione.]
 */
import { UUID } from "angular2-uuid";
import { <%=classify(prefixClass)%>ErrorBean, <%=classify(prefixClass)%>ErrorCode } from 'src/app/<%=namePackage%>/core/bean/error-bean';

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
      throw new <%=classify(prefixClass)%>ErrorBean(error.message, <%=classify(prefixClass)%>ErrorCode.SYSTEMERRORCODE, false, false);
    }
  }
}
