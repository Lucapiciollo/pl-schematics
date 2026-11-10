/**
 * @author l.piciollo
 * Rule della chain di index.ts: e' la PRIMA della chain. Verifica le opzioni prima che
 * qualunque altra rule modifichi il Tree.
 */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { validateNamePackage } from './normalize-options.rule';

/**
 * @author l.piciollo
 * Valida namePackage (lancia un'eccezione se non valido) e segnala con un log
 * l'uso dell'interceptor funzionale su app classic, dove viene registrato via HTTP_INTERCEPTORS.
 * @param options  :opzioni normalizzate da validare
 * @returns Rule che restituisce il Tree invariato
 */
export function validateOptions(options: PlSchematicsOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    validateNamePackage(options.namePackage);

    if (options.http === 'interceptor-functional' && !options.standalone) {
      context.logger.info(
        'http=interceptor-functional on a classic (NgModule) app: the interceptor is registered through HTTP_INTERCEPTORS (class based); the functional form is used on standalone apps.',
      );
    }

    return host;
  };
}
