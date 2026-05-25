/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-21 15:14:28
 * @modify date 2026-05-20
 * @desc [
 * Servizio per la centralizzazione della gestione degli errori applicativi.
 * Gli errori vengono trasformati in eventi broadcast e gestiti dalla GlobalService.
 * ]
 */

import { ErrorHandler, Injectable } from '@angular/core';
<% if (logging === "advanced") { %>
import { inject } from '@angular/core';
<% } %>

import { PlCoreUtils } from 'pl-core-utils-library';

import {  ErrorBean } from '../bean/error-bean';
import { CORE_TYPE_EVENT } from '../type/type.event';

<% if (logging === "advanced") { %>
import { LoggerService } from '../logging/logger.service';
import { LoggerFeature } from '../logging/logger-feature.enum';
<% } %>

@Injectable({
  providedIn: 'root',
})
export class  ErrorService implements ErrorHandler {
  <% if (logging === "advanced") { %>
  private readonly logger = inject( LoggerService);
  <% } %>

  constructor() {}

  /**
   * Entry point globale Angular per la gestione errori.
   */
  handleError(error: unknown): void {
    try {
      const errorBean = this.resolveErrorBean(error);

      if (errorBean) {
        this.handleErrorBean(errorBean);
      }

      PlCoreUtils.Broadcast().execEvent(
        CORE_TYPE_EVENT.CORE_ERROR_SERVICE,
        errorBean || error,
      );

      if (!errorBean) {
        this.logError('Unhandled application error', error);
      }
    } catch (handlerError) {
      this.logError('ErrorService failed while handling an error', handlerError);
      console.error(handlerError);
    }
  }

  private handleErrorBean(errorBean:  ErrorBean): void {
    if (this.shouldOpenDialog(errorBean)) {
      PlCoreUtils.Broadcast().execEvent(
        CORE_TYPE_EVENT.CORE_ERROR_SERVICE_DIALOG,
        errorBean,
      );
    }

    if (this.shouldRedirect(errorBean)) {
      PlCoreUtils.Broadcast().execEvent(
        CORE_TYPE_EVENT.CORE_ERROR_SERVICE_REDIRECT,
        errorBean,
      );
    }

    this.logError('Application ErrorBean handled', errorBean);
  }

  /**
   * Angular spesso wrappa gli errori async dentro:
   * - error.rejection
   * - error.originalError
   *
   * Qui normalizziamo il valore in un ErrorBean, quando possibile.
   */
  private resolveErrorBean(error: unknown):  ErrorBean | null {
    if (error instanceof  ErrorBean) {
      return error;
    }

    const anyError = error as any;

    if (
      anyError &&
      anyError.rejection instanceof  ErrorBean
    ) {
      return anyError.rejection;
    }

    if (
      anyError &&
      anyError.originalError instanceof  ErrorBean
    ) {
      return anyError.originalError;
    }

    return null;
  }

  private shouldOpenDialog(errorBean:  ErrorBean): boolean {
    const anyError = errorBean as any;

    return anyError.dialog === true;
  }

  private shouldRedirect(errorBean:  ErrorBean): boolean {
    const anyError = errorBean as any;

    return anyError.redirect === true;
  }

  private logError(message: string, payload?: unknown): void {
    <% if (logging === "advanced") { %>
    this.logger.error(
       LoggerFeature.APP,
      message,
      payload,
    );
    <% } else { %>
    console.error(message, payload);
    <% } %>
  }
}