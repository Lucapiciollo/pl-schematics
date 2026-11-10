import { LoggerFeature } from './logger-feature.enum';
import { LoggerLevel } from './logger-level.enum';

/**
 * @author l.piciollo
 * Singolo messaggio di log prodotto dal LoggerService e consegnato alla porta di uscita (LoggerPort).
 */
export interface LoggerEntry {
	/** livello di gravita' del messaggio */
	level: LoggerLevel;
	/** area applicativa che ha generato il messaggio */
	feature: LoggerFeature;
	/** testo del messaggio */
	message: string;
	/** dati opzionali allegati al messaggio */
	payload?: unknown;
	/** data e ora di creazione del messaggio */
	date: Date;
}
