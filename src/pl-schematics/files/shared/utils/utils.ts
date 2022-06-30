/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
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
export class <%=classify(prefixClass)%>Utils {
  /**
   * @author l.piciollo
   * genera un UUID da assegnare a componenti grafici come ID o altro
   */
  public static UUIDCODE(): any {
    try {
      return UUID.UUID();
    } catch (error:any) {
      throw new <%=classify(prefixClass)%>ErrorBean(error.message, <%=classify(prefixClass)%>ErrorCode.SYSTEMERRORCODE, false, false);
    }
  }

   /**
   * @author l.piciollo
   * crea un nome alfabetico stile xls, passare un valore numerico per riceverlo in formato testo
   * @param lenght Numero che indica la lunghezza dell'alfabeto
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
      throw new <%=classify(prefixClass)%>ErrorBean(error.message, <%=classify(prefixClass)%>ErrorCode.SYSTEMERRORCODE, false, false);
    }
  }

  /**
   * @author l.piciollo
   * funzionalità utile a reperire cookie
   * @param nameCookie 
   */
  public static getCookie(nameCookie: string): string {
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
      throw new <%=classify(prefixClass)%>ErrorBean(error.message, <%=classify(prefixClass)%>ErrorCode.SYSTEMERRORCODE, false, false);
    }
  }

  /**
   * @author l.piciollo
   * funzionalità utile alla creazione dei cookie
   * @param nameCookie 
   * @param valueCookie
   * @param time
   */
  public static setCookie(nameCookie: string, valueCookie: string, time:number) {
    try {
      var date = new Date();
      date.setTime(date.getTime() + (time * 60 * 1000));
      var expires = "expires=" + date.toUTCString();
      document.cookie = nameCookie + "=" + valueCookie + ";expires=" + expires + ";path=/";
    } catch (error:any) {
      throw new <%=classify(prefixClass)%>ErrorBean(error.message, <%=classify(prefixClass)%>ErrorCode.SYSTEMERRORCODE, false, false);
    }
  }

    /**
   * @author l.piciollo
   * funzionalità utile ad invalidare un cookie
   * @param nameCookie 
   */
  public static deleteCookie(nameCookie: string) {
    try {
      <%=classify(prefixClass)%>Utils.setCookie(nameCookie, "", 0);
    } catch (error:any) {
      throw new <%=classify(prefixClass)%>ErrorBean(error.message, <%=classify(prefixClass)%>ErrorCode.SYSTEMERRORCODE, false, false);
    }
  }


  public static decodeJwtToken(token: string): object {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

    /**
   * @author l.piciollo
   * si occupa di creare un proxy object 
   * @param object 
   */
     public static proxing<Object>(object:{})  {
      return new Proxy(object, {
        get: function (target:any, prop:any, receiver:any) {
          if (Object.keys(target).indexOf(String(prop)) > -1) {
            return target[prop];
          } else {
            return null
          }
        }
      })
    }
}
