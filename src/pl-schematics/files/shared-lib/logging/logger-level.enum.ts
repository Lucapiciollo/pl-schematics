/**
 * @author l.piciollo
 * Livelli di gravita' dei log, in ordine crescente.
 * Un messaggio viene scritto solo se il suo livello e' maggiore o uguale a quello configurato; OFF disattiva ogni scrittura.
 */
export enum LoggerLevel {
	TRACE = 0,
	DEBUG = 1,
	INFO = 2,
	WARN = 3,
	ERROR = 4,
	OFF = 99
}
