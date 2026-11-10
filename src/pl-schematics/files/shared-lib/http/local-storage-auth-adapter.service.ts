import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import {
  HttpAuthAdapter,
  HttpRefreshTokenResponse,
} from './http-interceptor.tokens';

/**
 * @author l.piciollo
 * Adapter di autenticazione di default per HttpInterceptorService: conserva access token e refresh token nel localStorage
 * (chiavi token e refreshToken). Il refresh non e' configurato (restituisce un errore) e il logout svuota i token e ricarica la pagina.
 */
@Injectable({
  providedIn: 'root',
})
export class LocalStorageAuthAdapterService implements HttpAuthAdapter {
  /**
   * @author l.piciollo
   * Legge l'access token dal localStorage.
   * @returns access token oppure null se assente
   */
  getAccessToken(): string | null {
    return localStorage.getItem('token');
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Salva l'access token nel localStorage.
   * @param token   :access token da salvare
   */
  setAccessToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Legge il refresh token dal localStorage.
   * @returns refresh token oppure null se assente
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Salva il refresh token nel localStorage.
   * @param token   :refresh token da salvare
   */
  setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Refresh del token non configurato di default: restituisce sempre un errore.
   * Per abilitarlo fornire un proprio adapter tramite HTTP_AUTH_ADAPTER.
   * @returns Observable che va subito in errore
   */
  refreshToken(): Observable<HttpRefreshTokenResponse> {
    return throwError(
      () => new Error('Refresh token endpoint is not configured'),
    );
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Esegue il logout: rimuove access token e refresh token dal localStorage e ricarica la pagina.
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.reload();
  }
}