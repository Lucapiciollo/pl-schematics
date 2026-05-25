import { LoggerEntry } from './logger-entry.interface';

export interface LoggerPort {
	write(entry: LoggerEntry): void;
}
