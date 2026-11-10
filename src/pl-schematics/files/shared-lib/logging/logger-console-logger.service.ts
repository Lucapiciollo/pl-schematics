import { Injectable } from '@angular/core';
import { LoggerEntry } from './logger-entry.interface';
import { LoggerLevel } from './logger-level.enum';
import { LoggerPort } from './logger-port.interface';

/**
 * @author l.piciollo
 * Implementazione di LoggerPort che scrive i messaggi sulla console del browser,
 * scegliendo il metodo console in base al livello del messaggio.
 */
@Injectable()
export class ConsoleLoggerService implements LoggerPort {
	/**
	 * @author l.piciollo
	 * Scrive il messaggio sulla console (debug, info, warn o error in base al livello), con prefisso data e feature.
	 * Il payload, se presente, viene passato come argomento aggiuntivo.
	 * @param entry   :messaggio di log da scrivere
	 */
	write(entry: LoggerEntry): void {
		const prefix = `[${entry.date.toISOString()}] [${entry.feature}]`;
		const args: unknown[] = [prefix + ' ' + entry.message];
		if (entry.payload !== undefined) {
			args.push(entry.payload);
		}
		switch (entry.level) {
			case LoggerLevel.TRACE:
			case LoggerLevel.DEBUG:
				console.debug(...args);
				break;
			case LoggerLevel.INFO:
				console.info(...args);
				break;
			case LoggerLevel.WARN:
				console.warn(...args);
				break;
			case LoggerLevel.ERROR:
				console.error(...args);
				break;
			default:
				break;
		}
	}
}
