import { LoggerFeature } from './logger-feature.enum';
import { LoggerLevel } from './logger-level.enum';

export interface LoggerConfig {
	enabled: boolean;
	level: LoggerLevel;
	features: Partial<Record<LoggerFeature, boolean>>;
	showTimestamp: boolean;
	showFeature: boolean;
}
