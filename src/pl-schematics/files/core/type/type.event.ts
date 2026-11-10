/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-22 18:15:21
 * @modify date 2019-12-22 18:15:21
 * @desc [eventi esportati per la parte core applicativa]
 */
/**
 * @author l.piciollo
 * Enum dei nomi degli eventi di broadcast del core applicativo: vengono lanciati dai servizi (HTTP, errori, login)
 * e ascoltati in GlobalService per gestire in un punto solo errori, cache, redirect e autenticazione.
 */
export  enum CORE_TYPE_EVENT {
    /** errore su una chiamata HTTP/AJAX */
    CORE_HTTP_AJAX_ERROR = "CORE:HTTP-AJAX-ERROR",
    /** evento legato alla cache delle chiamate HTTP/AJAX */
    CORE_HTTP_AJAX_CACHE="CORE:HTTP_AJAX_CACHE",
    /** chiamata HTTP/AJAX non autenticata (es. 401): richiede nuova login */
    CORE_HTTP_AJAX_AUTENTICATE_KO = "CORE:HTTP-AJAX-AUTENTICATE-KO",
    /** richiesta di redirect da parte del servizio errori */
    CORE_ERROR_SERVICE_REDIRECT = "CORE:ERROR_SERVICE_REDIRECT",
    /** richiesta di apertura di una dialog di errore da parte del servizio errori */
    CORE_ERROR_SERVICE_DIALOG = "CORE:ERROR_SERVICE_DIALOG",
    /** token di accesso acquisito con successo */
    CORE_ACQUIRE_TOKEN_SUCCESS = "CORE:ACQUIRE_TOKEN_SUCCESS",
    /** login completata con successo */
    CORE_LOGIN_SUCCESS= "CORE:LOGIN_SUCCESS",
    /** errore generico gestito dal servizio errori */
    CORE_ERROR_SERVICE="CORE:ERROR_SERVICE"
}