import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { LoggerConfig } from './logger-config.interface';
import { LoggerEntry } from './logger-entry.interface';
import { LoggerFeature } from './logger-feature.enum';
import { LoggerLevel } from './logger-level.enum';
import { LoggerPort } from './logger-port.interface';

export const LOGGER_CONFIG = new InjectionToken<LoggerConfig>('LOGGER_CONFIG');
export const LOGGER_PORT = new InjectionToken<LoggerPort>('LOGGER_PORT');

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

@Injectable()
export class LoggerService {
	private readonly config: LoggerConfig;

	constructor(
		@Optional() @Inject(LOGGER_CONFIG) config: LoggerConfig | null,
		@Optional() @Inject(LOGGER_PORT) private readonly port: LoggerPort | null,
	) {
		this.config = config || DEFAULT_LOGGER_CONFIG;
	}

	trace(feature: LoggerFeature, message: string, payload?: unknown): void {
		this.write(LoggerLevel.TRACE, feature, message, payload);
	}

	debug(feature: LoggerFeature, message: string, payload?: unknown): void {
		this.write(LoggerLevel.DEBUG, feature, message, payload);
	}

	info(feature: LoggerFeature, message: string, payload?: unknown): void {
		this.write(LoggerLevel.INFO, feature, message, payload);
	}

	warn(feature: LoggerFeature, message: string, payload?: unknown): void {
		this.write(LoggerLevel.WARN, feature, message, payload);
	}

	error(feature: LoggerFeature, message: string, payload?: unknown): void {
		this.write(LoggerLevel.ERROR, feature, message, payload);
	}

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

	private canWrite(level: LoggerLevel, feature: LoggerFeature): boolean {
		if (!this.config.enabled) return false;
		if (level < this.config.level) return false;
		if (this.config.features[feature] === false) return false;
		return true;
	}
}
