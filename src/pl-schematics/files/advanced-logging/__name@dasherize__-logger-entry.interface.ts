import { <%= classify(prefixClass) %>LoggerFeature } from './<%= dasherize(name) %>-logger-feature.enum';
import { <%= classify(prefixClass) %>LoggerLevel } from './<%= dasherize(name) %>-logger-level.enum';

export interface <%= classify(prefixClass) %>LoggerEntry {
  level: <%= classify(prefixClass) %>LoggerLevel;
  feature: <%= classify(prefixClass) %>LoggerFeature;
  message: string;
  payload?: unknown;
  date: Date;
}