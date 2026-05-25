import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Provider } from '@angular/core';

import {   HttpInterceptorService } from '../../core/interceptor/http-interceptor.service';

import {
  DEFAULT_HTTP_INTERCEPTOR_CONFIG,
  HTTP_AUTH_ADAPTER,
  HTTP_INTERCEPTOR_CONFIG,
  HttpAuthAdapter,
  HttpInterceptorConfig,
} from './http-interceptor.tokens';

import { LocalStorageAuthAdapterService } from './local-storage-auth-adapter.service';

export function provideHttpInterceptor(
  config?: Partial<HttpInterceptorConfig>,
  authAdapterProvider?: Provider,
): Provider[] {
  return [
    {
      provide: HTTP_INTERCEPTOR_CONFIG,
      useValue: {
        ...DEFAULT_HTTP_INTERCEPTOR_CONFIG,
        ...(config || {}),
      },
    },
    authAdapterProvider || {
      provide: HTTP_AUTH_ADAPTER,
      useExisting: LocalStorageAuthAdapterService,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass:  HttpInterceptorService,
      multi: true,
    } 
  ];
}