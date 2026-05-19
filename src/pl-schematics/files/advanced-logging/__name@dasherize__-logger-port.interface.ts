import { <%= classify(prefixClass) %>LoggerEntry } from './<%= dasherize(name) %>-logger-entry.interface';

export interface <%= classify(prefixClass) %>LoggerPort {
  write(entry: <%= classify(prefixClass) %>LoggerEntry): void;
}