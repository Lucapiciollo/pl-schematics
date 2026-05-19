import { Injectable } from '@angular/core';
import { <%= classify(prefixClass) %>LoggerEntry } from './<%= dasherize(name) %>-logger-entry.interface';
import { <%= classify(prefixClass) %>LoggerLevel } from './<%= dasherize(name) %>-logger-level.enum';
import { <%= classify(prefixClass) %>LoggerPort } from './<%= dasherize(name) %>-logger-port.interface';

@Injectable()
export class <%= classify(prefixClass) %>ConsoleLoggerService implements <%= classify(prefixClass) %>LoggerPort {
  write(entry: <%= classify(prefixClass) %>LoggerEntry): void {
    const prefix = '[' + entry.date.toISOString() + '] [' + entry.feature + ']';
    const args: unknown[] = [prefix + ' ' + entry.message];

    if (entry.payload !== undefined) {
      args.push(entry.payload);
    }

    switch (entry.level) {
      case <%= classify(prefixClass) %>LoggerLevel.TRACE:
      case <%= classify(prefixClass) %>LoggerLevel.DEBUG:
        console.debug.apply(console, args as any);
        break;

      case <%= classify(prefixClass) %>LoggerLevel.INFO:
        console.info.apply(console, args as any);
        break;

      case <%= classify(prefixClass) %>LoggerLevel.WARN:
        console.warn.apply(console, args as any);
        break;

      case <%= classify(prefixClass) %>LoggerLevel.ERROR:
        console.error.apply(console, args as any);
        break;

      default:
        break;
    }
  }
}