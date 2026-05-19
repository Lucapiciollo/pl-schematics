import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { <%= classify(prefixClass) %>LoggerConfig } from './<%= dasherize(name) %>-logger-config.interface';
import { <%= classify(prefixClass) %>LoggerEntry } from './<%= dasherize(name) %>-logger-entry.interface';
import { <%= classify(prefixClass) %>LoggerFeature } from './<%= dasherize(name) %>-logger-feature.enum';
import { <%= classify(prefixClass) %>LoggerLevel } from './<%= dasherize(name) %>-logger-level.enum';
import { <%= classify(prefixClass) %>LoggerPort } from './<%= dasherize(name) %>-logger-port.interface';

export const <%= classify(prefixClass) %>LOGGER_CONFIG =
  new InjectionToken<<%= classify(prefixClass) %>LoggerConfig>('<%= classify(prefixClass) %>LOGGER_CONFIG');

export const <%= classify(prefixClass) %>LOGGER_PORT =
  new InjectionToken<<%= classify(prefixClass) %>LoggerPort>('<%= classify(prefixClass) %>LOGGER_PORT');

const DEFAULT_LOGGER_CONFIG: <%= classify(prefixClass) %>LoggerConfig = {
  enabled: true,
  level: <%= classify(prefixClass) %>LoggerLevel.DEBUG,
  features: {
    APP: true,
    AUTH: true,
    HTTP: true,
    ROUTING: true,
    STATE: true,
    UI: true,
    FORM: true,
    STORAGE: true,
    PERFORMANCE: true
  },
  showTimestamp: true,
  showFeature: true
};

@Injectable()
export class <%= classify(prefixClass) %>LoggerService {
  private readonly config: <%= classify(prefixClass) %>LoggerConfig;

  constructor(
    @Optional()
    @Inject(<%= classify(prefixClass) %>LOGGER_CONFIG)
    config: <%= classify(prefixClass) %>LoggerConfig | null,

    @Optional()
    @Inject(<%= classify(prefixClass) %>LOGGER_PORT)
    private readonly port: <%= classify(prefixClass) %>LoggerPort | null,
  ) {
    this.config = config || DEFAULT_LOGGER_CONFIG;
  }

  trace(feature: <%= classify(prefixClass) %>LoggerFeature, message: string, payload?: unknown): void {
    this.write(<%= classify(prefixClass) %>LoggerLevel.TRACE, feature, message, payload);
  }

  debug(feature: <%= classify(prefixClass) %>LoggerFeature, message: string, payload?: unknown): void {
    this.write(<%= classify(prefixClass) %>LoggerLevel.DEBUG, feature, message, payload);
  }

  info(feature: <%= classify(prefixClass) %>LoggerFeature, message: string, payload?: unknown): void {
    this.write(<%= classify(prefixClass) %>LoggerLevel.INFO, feature, message, payload);
  }

  warn(feature: <%= classify(prefixClass) %>LoggerFeature, message: string, payload?: unknown): void {
    this.write(<%= classify(prefixClass) %>LoggerLevel.WARN, feature, message, payload);
  }

  error(feature: <%= classify(prefixClass) %>LoggerFeature, message: string, payload?: unknown): void {
    this.write(<%= classify(prefixClass) %>LoggerLevel.ERROR, feature, message, payload);
  }

  private write(
    level: <%= classify(prefixClass) %>LoggerLevel,
    feature: <%= classify(prefixClass) %>LoggerFeature,
    message: string,
    payload?: unknown,
  ): void {
    if (!this.canWrite(level, feature)) {
      return;
    }

    const entry: <%= classify(prefixClass) %>LoggerEntry = {
      level: level,
      feature: feature,
      message: message,
      payload: payload,
      date: new Date(),
    };

    if (this.port) {
      this.port.write(entry);
    }
  }

  private canWrite(
    level: <%= classify(prefixClass) %>LoggerLevel,
    feature: <%= classify(prefixClass) %>LoggerFeature,
  ): boolean {
    if (!this.config.enabled) {
      return false;
    }

    if (level < this.config.level) {
      return false;
    }

    if (this.config.features[feature] === false) {
      return false;
    }

    return true;
  }
}