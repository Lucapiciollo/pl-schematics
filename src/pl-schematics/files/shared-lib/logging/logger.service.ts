import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { LoggerConfig } from './logger-config.interface';
import { LoggerEntry } from './logger-entry.interface';
import { LoggerFeature } from './logger-feature.enum';
import { LoggerLevel } from './logger-level.enum';
import { LoggerPort } from './logger-port.interface';

/**
 * @author l.piciollo
 * InjectionToken per la configurazione del logger (LoggerConfig).
 * Se non fornito, il LoggerService usa la configurazione di default.
 */
export const LOGGER_CONFIG = new InjectionToken<LoggerConfig>('LOGGER_CONFIG');

/**
 * @author l.piciollo
 * InjectionToken per la porta di uscita del logger (LoggerPort), ad esempio la console.
 * Se non fornito, il LoggerService non scrive alcun messaggio.
 */
export const LOGGER_PORT = new InjectionToken<LoggerPort>('LOGGER_PORT');

/**
 * @author l.piciollo
 * Configurazione di default del logger, usata quando non viene fornito il token LOGGER_CONFIG:
 * logging attivo, livello DEBUG e principali feature applicative abilitate.
 */
const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
	enabled: true,
	level: LoggerLevel.DEBUG,
	features: {
		APP: true,
		AUTH: true,
		HTTP: true,
		ROUTING: true,
		STATE: true,
		UI: true,
		FORM: true,
		STORAGE: true,
		PERFORMANCE: true,
	},
	showTimestamp: true,
	showFeature: true,
};

/**
 * @author l.piciollo
 * Servizio di logging applicativo: filtra i messaggi in base a LoggerConfig (abilitazione, livello, feature)
 * e li inoltra alla porta di uscita LoggerPort. Espone un metodo per ogni livello di log.
 */
@Injectable()
export class LoggerService {
	private readonly config: LoggerConfig;

	/**
	 * @author l.piciollo
	 * Costruttore: risolve la configurazione (quella iniettata oppure il default) e la porta di uscita opzionale.
	 * @param config   :configurazione del logger, null per usare quella di default
	 * @param port   :porta di uscita dei messaggi, null per non scrivere alcun messaggio
	 */
	constructor(
		@Optional() @Inject(LOGGER_CONFIG) config: LoggerConfig | null,
		@Optional() @Inject(LOGGER_PORT) private readonly port: LoggerPort | null,
	) {
		this.config = config || DEFAULT_LOGGER_CONFIG;
	}

	/************************************************************************************************************************/

	/**
	 * @author l.piciollo
	 * Scrive un messaggio di livello TRACE (dettaglio massimo, utile per la diagnostica fine).
	 * @param feature   :area applicativa che genera il messaggio
	 * @param message   :testo del messaggio
	 * @param payload   :dati opzionali da allegare
	 */
	trace(feature: LoggerFeature, message: string, payload?: unknown): void {
		this.write(LoggerLevel.TRACE, feature, message, payload);
	}

	/************************************************************************************************************************/

	/**
	 * @author l.piciollo
	 * Scrive un messaggio di livello DEBUG (informazioni utili in fase di sviluppo).
	 * @param feature   :area applicativa che genera il messaggio
	 * @param message   :testo del messaggio
	 * @param payload   :dati opzionali da allegare
	 */
	debug(feature: LoggerFeature, message: string, payload?: unknown): void {
		this.write(LoggerLevel.DEBUG, feature, message, payload);
	}

	/************************************************************************************************************************/

	/**
	 * @author l.piciollo
	 * Scrive un messaggio di livello INFO (eventi normali del flusso applicativo).
	 * @param feature   :area applicativa che genera il messaggio
	 * @param message   :testo del messaggio
	 * @param payload   :dati opzionali da allegare
	 */
	info(feature: LoggerFeature, message: string, payload?: unknown): void {
		this.write(LoggerLevel.INFO, feature, message, payload);
	}

	/************************************************************************************************************************/

	/**
	 * @author l.piciollo
	 * Scrive un messaggio di livello WARN (situazione anomala non bloccante).
	 * @param feature   :area applicativa che genera il messaggio
	 * @param message   :testo del messaggio
	 * @param payload   :dati opzionali da allegare
	 */
	warn(feature: LoggerFeature, message: string, payload?: unknown): void {
		this.write(LoggerLevel.WARN, feature, message, payload);
	}

	/************************************************************************************************************************/

	/**
	 * @author l.piciollo
	 * Scrive un messaggio di livello ERROR (errore applicativo).
	 * @param feature   :area applicativa che genera il messaggio
	 * @param message   :testo del messaggio
	 * @param payload   :dati opzionali da allegare
	 */
	error(feature: LoggerFeature, message: string, payload?: unknown): void {
		this.write(LoggerLevel.ERROR, feature, message, payload);
	}

	/************************************************************************************************************************/

	/**
	 * @author l.piciollo
	 * Metodo interno comune: verifica se il messaggio puo' essere scritto, costruisce il LoggerEntry e lo inoltra alla porta.
	 * @param level   :livello di gravita' del messaggio
	 * @param feature   :area applicativa che genera il messaggio
	 * @param message   :testo del messaggio
	 * @param payload   :dati opzionali da allegare
	 */
	private write(
		level: LoggerLevel,
		feature: LoggerFeature,
		message: string,
		payload?: unknown,
	): void {
		if (!this.canWrite(level, feature)) {
			return;
		}
		const entry: LoggerEntry = {
			level,
			feature,
			message,
			payload,
			date: new Date(),
		};
		if (this.port) {
			this.port.write(entry);
		}
	}

	/************************************************************************************************************************/

	/**
	 * @author l.piciollo
	 * Verifica se un messaggio deve essere scritto in base alla configurazione:
	 * logger abilitato, livello pari o superiore al minimo e feature non disabilitata.
	 * @param level   :livello di gravita' del messaggio
	 * @param feature   :area applicativa che genera il messaggio
	 * @returns true se il messaggio puo' essere scritto, false altrimenti
	 */
	private canWrite(level: LoggerLevel, feature: LoggerFeature): boolean {
		if (!this.config.enabled) return false;
		if (level < this.config.level) return false;
		if (this.config.features[feature] === false) return false;
		return true;
	}
}
