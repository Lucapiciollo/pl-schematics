import { LoggerFeature } from './logger-feature.enum';
import { LoggerLevel } from './logger-level.enum';

export interface LoggerEntry {
	level: LoggerLevel;
	feature: LoggerFeature;
	message: string;
	payload?: unknown;
	date: Date;
}
