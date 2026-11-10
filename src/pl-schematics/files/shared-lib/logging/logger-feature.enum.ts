/**
 * @author l.piciollo
 * Elenco delle aree applicative (feature) che possono produrre log.
 * Usato dal LoggerService per filtrare i messaggi tramite LoggerConfig.features.
 */
export enum  LoggerFeature {
	APP = 'APP',
	AUTH = 'AUTH',
	HTTP = 'HTTP',
	ROUTER = 'ROUTER',
	STORE = 'STORE',
	FORM = 'FORM',
	UI = 'UI',
	MATERIAL = 'MATERIAL',
	NGRX = 'NGRX',
	MOCK_API = 'MOCK_API',
	INTERCEPTOR = 'INTERCEPTOR',
	GLOBAL_SERVICE = 'GLOBAL_SERVICE',
	ERROR_HANDLER = 'ERROR_HANDLER',
	INITIALIZER = 'INITIALIZER',
	UNKNOWN = 'UNKNOWN',
  ROUTING = 'ROUTING',
  STATE = 'STATE',
  STORAGE = 'STORAGE',
  PERFORMANCE = 'PERFORMANCE'
}
