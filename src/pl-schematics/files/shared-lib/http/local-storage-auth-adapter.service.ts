import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import {
  HttpAuthAdapter,
  HttpRefreshTokenResponse,
} from './http-interceptor.tokens';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageAuthAdapterService implements HttpAuthAdapter {
  getAccessToken(): string | null {
    return localStorage.getItem('token');
  }

  setAccessToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
  }

  refreshToken(): Observable<HttpRefreshTokenResponse> {
    return throwError(
      () => new Error('Refresh token endpoint is not configured'),
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.reload();
  }
}