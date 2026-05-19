import { <%= classify(prefixClass) %>LoggerFeature } from './<%= dasherize(name) %>-logger-feature.enum';
import { <%= classify(prefixClass) %>LoggerLevel } from './<%= dasherize(name) %>-logger-level.enum';

export interface <%= classify(prefixClass) %>LoggerConfig {
  enabled: boolean;
  level: <%= classify(prefixClass) %>LoggerLevel;
  features: Partial<Record<<%= classify(prefixClass) %>LoggerFeature, boolean>>;
  showTimestamp: boolean;
  showFeature: boolean;
}