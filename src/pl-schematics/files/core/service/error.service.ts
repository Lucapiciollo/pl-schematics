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

import { CORE_TYPE_EVENT } from '../type/type.event';

import { ErrorBean<% if (logging === "advanced") { %>, LoggerService, LoggerFeature<% } %> } from '<%= sharedLibName %>';

/**
 * @author l.piciollo
 * Gestore globale degli errori applicativi: implementa ErrorHandler di Angular, normalizza gli errori in ErrorBean quando possibile
 * e li ritrasmette come eventi broadcast CORE_TYPE_EVENT (generico, dialog, redirect), gestiti poi dalla GlobalService.
 */
@Injectable({
  providedIn: 'root',
})
export class  ErrorService implements ErrorHandler {
  <% if (logging === "advanced") { %>
  /** logger applicativo avanzato */
  private readonly logger = inject( LoggerService);
  <% } %>

  /**
   * @author l.piciollo
   * Costruttore senza dipendenze da iniettare.
   */
  constructor() {}

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Entry point globale Angular per la gestione errori.
   * Risolve l'errore in ErrorBean, lo gestisce e lancia l'evento broadcast CORE_ERROR_SERVICE; ogni eccezione interna viene solo loggata.
   * @param error :errore o rifiuto non gestito intercettato da Angular
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Gestisce un ErrorBean: lancia gli eventi broadcast di dialog e/o redirect in base ai flag dell'errore e lo registra nel log.
   * @param errorBean :errore applicativo da gestire
   */
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Angular spesso wrappa gli errori async dentro:
   * - error.rejection
   * - error.originalError
   *
   * Qui normalizziamo il valore in un ErrorBean, quando possibile.
   * @param error :errore ricevuto da Angular (ErrorBean oppure wrapper che lo contiene)
   * @returns l'ErrorBean individuato oppure null se l'errore non e' un ErrorBean
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

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Indica se per l'errore va aperta una dialog (flag dialog valorizzato a true).
   * @param errorBean :errore applicativo da valutare
   * @returns true se l'errore richiede la dialog
   */
  private shouldOpenDialog(errorBean:  ErrorBean): boolean {
    const anyError = errorBean as any;

    return anyError.dialog === true;
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Indica se per l'errore va eseguito un redirect (flag redirect valorizzato a true).
   * @param errorBean :errore applicativo da valutare
   * @returns true se l'errore richiede il redirect
   */
  private shouldRedirect(errorBean:  ErrorBean): boolean {
    const anyError = errorBean as any;

    return anyError.redirect === true;
  }

  /************************************************************************************************************************/

  /**
   * @author l.piciollo
   * Registra un errore nel log (logger advanced oppure console.error, in base alla configurazione).
   * @param message :messaggio descrittivo
   * @param payload :dati o errore originale da allegare (opzionale)
   */
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