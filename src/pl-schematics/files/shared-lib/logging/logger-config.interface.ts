import { LoggerFeature } from './logger-feature.enum';
import { LoggerLevel } from './logger-level.enum';

/**
 * @author l.piciollo
 * Configurazione del logger applicativo (LoggerService).
 * Definisce se il logging e' attivo, il livello minimo di scrittura e le feature abilitate.
 * Viene fornita tramite il token LOGGER_CONFIG (vedi provideLogger).
 */
export interface LoggerConfig {
	/** interruttore generale: se false nessun messaggio viene scritto */
	enabled: boolean;
	/** livello minimo di log: i messaggi con livello inferiore vengono scartati */
	level: LoggerLevel;
	/** abilitazione per singola feature: se una feature e' impostata a false i suoi messaggi vengono scartati */
	features: Partial<Record<LoggerFeature, boolean>>;
	/** indica se mostrare il timestamp nel messaggio */
	showTimestamp: boolean;
	/** indica se mostrare la feature nel messaggio */
	showFeature: boolean;
}
