import { Provider } from '@angular/core';
import { ConsoleLoggerService } from './logger-console-logger.service';
import { LoggerConfig } from './logger-config.interface';
import { LOGGER_CONFIG, LOGGER_PORT, LoggerService } from './logger.service';

/**
 * @author l.piciollo
 * Registra i provider del logger applicativo (LoggerService, ConsoleLoggerService, configurazione e porta di uscita su console).
 * Da usare nei providers dell'applicazione o del modulo.
 * @param config   :configurazione del logger (livello, feature abilitate, formato)
 * @returns elenco di provider Angular da registrare
 */
export function provideLogger(config: LoggerConfig): Provider[] {
	return [
		LoggerService,
		ConsoleLoggerService,
		{
			provide: LOGGER_CONFIG,
			useValue: config,
		},
		{
			provide: LOGGER_PORT,
			useExisting: ConsoleLoggerService,
		},
	];
}
