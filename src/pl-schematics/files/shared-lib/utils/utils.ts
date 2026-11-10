/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-21 23:18:12
 * @modify date 2019-12-21 23:18:12
 * @desc [Classe di utilita, qui vengono elencate tutte le funzionalità per l'itera applicazione.]
 */
import { ErrorBean, ErrorCode } from '../bean/error-bean';

/**
 * @author l.piciollo
 * classe di utilità, qui vengono elencate tutte le funzioni utili per tutta l'applicazione
 */
export class  Utils {
  /**
   * @author l.piciollo
   * genera un UUID da assegnare a componenti grafici come ID o altro.
   * Utilizza l'API nativa crypto.randomUUID() (supportata da tutti i browser moderni e da Node.js 16.7+),
   * evitando cosi' la dipendenza da librerie esterne non piu' mantenute.
   * @returns stringa UUID v4 generata casualmente (lancia ErrorBean in caso di errore)
   */
  public static UUIDCODE(): any {
    try {
      return crypto.randomUUID();
    } catch (error:any) {
      throw new  ErrorBean(error.message,  ErrorCode.SYSTEMERRORCODE, false, false);
    }
  }

  /************************************************************************************************************************/

   /**
   * @author l.piciollo
   * crea un nome alfabetico stile xls, passare un valore numerico per riceverlo in formato testo
   * @param lenght :indice numerico (base 0) da convertire: 0 = A, 25 = Z, 26 = AA, ...
   * @returns il nome alfabetico corrispondente (es. "A", "B", ... "AA")
   */
  public static alphaName(lenght:number):string {
    try {
      let ordA = "A".charCodeAt(0);
      let ordZ = "Z".charCodeAt(0);
      let len = ordZ - ordA + 1;
      let alpha = "";
      while (lenght >= 0) {
        alpha = String.fromCharCode((lenght % len) + ordA) + alpha;
        lenght = Math.floor(lenght / len) - 1;
      }
      return alpha;
    } catch (error:any) {
      throw new  ErrorBean(error.message,  ErrorCode.SYSTEMERRORCODE, false, false);
    }
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * funzionalità utile a reperire cookie
   * @param nameCookie :nome del cookie da leggere
   * @returns il valore del cookie, oppure null se non presente
   */
  public static getCookie(nameCookie: string): string | null {
    try {
      let name = nameCookie + "=";
      let cookies = document.cookie.split(';');
      for (let ind = 0; ind < cookies.length; ind++) {
        let cookie = cookies[ind];
        while (cookie.charAt(0) == ' ') {
          cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) == 0) {
          return cookie.substring(name.length, cookie.length);
        }
      }
      return null;
    } catch (error:any) {
      throw new  ErrorBean(error.message,  ErrorCode.SYSTEMERRORCODE, false, false);
    }
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * funzionalità utile alla creazione dei cookie
   * @param nameCookie   :nome del cookie da creare
   * @param valueCookie  :valore da assegnare al cookie
   * @param time         :durata di validita' del cookie espressa in minuti
   */
  public static setCookie(nameCookie: string, valueCookie: string, time:number) {
    try {
      var date = new Date();
      date.setTime(date.getTime() + (time * 60 * 1000));
      var expires = "expires=" + date.toUTCString();
      document.cookie = nameCookie + "=" + valueCookie + ";expires=" + expires + ";path=/";
    } catch (error:any) {
      throw new  ErrorBean(error.message,  ErrorCode.SYSTEMERRORCODE, false, false);
    }
  }

  /************************************************************************************************************************/

    /**
   * @author l.piciollo
   * funzionalità utile ad invalidare un cookie
   * @param nameCookie :nome del cookie da invalidare (viene riscritto con scadenza immediata)
   */
  public static deleteCookie(nameCookie: string) {
    try {
       Utils.setCookie(nameCookie, "", 0);
    } catch (error:any) {
      throw new  ErrorBean(error.message,  ErrorCode.SYSTEMERRORCODE, false, false);
    }
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Decodifica il payload (seconda parte) di un token JWT: normalizza il base64url, lo decodifica gestendo i caratteri UTF-8
   * e lo converte da JSON. Non verifica la firma del token.
   * @param token  :token JWT nel formato header.payload.signature
   * @returns oggetto con il contenuto (claim) del payload
   */
  public static decodeJwtToken(token: string): object {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  /************************************************************************************************************************/

    /**
   * @author l.piciollo
   * si occupa di creare un proxy object 
   * restituisce un Proxy che in lettura ritorna la proprieta' solo se e' presente tra le chiavi dell'oggetto, altrimenti null.
   * @param object :oggetto da incapsulare nel proxy
   * @returns il proxy dell'oggetto
   */
     public static proxing<T extends object>(object: T): any {
      return new Proxy(object, {
        get: function (target: any, prop: string | symbol) {
          if (Object.keys(target).indexOf(String(prop)) > -1) {
            return target[prop];
          } else {
            return null
          }
        }
      })
    }
}
// riesporta i tipi e le funzioni di rilevamento del dispositivo cosi' da importarli da un unico punto
export * from './device-detector.constants';