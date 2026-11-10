import { LoggerEntry } from './logger-entry.interface';

/**
 * @author l.piciollo
 * Porta di uscita del logger: contratto che un destinatario di log (console, remoto, ecc.) deve rispettare.
 * Viene iniettata nel LoggerService tramite il token LOGGER_PORT.
 */
export interface LoggerPort {
	/**
	 * @author l.piciollo
	 * Scrive un messaggio di log sul destinatario concreto.
	 * @param entry   :messaggio di log da scrivere
	 */
	write(entry: LoggerEntry): void;
}
