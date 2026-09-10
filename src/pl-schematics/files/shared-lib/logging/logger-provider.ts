import { Provider } from '@angular/core';
import { ConsoleLoggerService } from './logger-console-logger.service';
import { LoggerConfig } from './logger-config.interface';
import { LOGGER_CONFIG, LOGGER_PORT, LoggerService } from './logger.service';

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
