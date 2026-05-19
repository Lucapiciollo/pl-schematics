import { Provider } from '@angular/core';
import { <%= classify(prefixClass) %>ConsoleLoggerService } from './<%= dasherize(name) %>-console-logger.service';
import { <%= classify(prefixClass) %>LoggerConfig } from './<%= dasherize(name) %>-logger-config.interface';
import { <%= classify(prefixClass) %>LOGGER_CONFIG, <%= classify(prefixClass) %>LOGGER_PORT, <%= classify(prefixClass) %>LoggerService } from './<%= dasherize(name) %>-logger.service';

export function provide<%= classify(prefixClass) %>Logger(
  config: <%= classify(prefixClass) %>LoggerConfig,
): Provider[] {
  return [
    <%= classify(prefixClass) %>LoggerService,
    <%= classify(prefixClass) %>ConsoleLoggerService,
    {
      provide: <%= classify(prefixClass) %>LOGGER_CONFIG,
      useValue: config,
    },
    {
      provide: <%= classify(prefixClass) %>LOGGER_PORT,
      useExisting: <%= classify(prefixClass) %>ConsoleLoggerService,
    },
  ];
}