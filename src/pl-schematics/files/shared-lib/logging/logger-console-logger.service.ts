import { Injectable } from '@angular/core';
import { LoggerEntry } from './logger-entry.interface';
import { LoggerLevel } from './logger-level.enum';
import { LoggerPort } from './logger-port.interface';

@Injectable()
export class ConsoleLoggerService implements LoggerPort {
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
