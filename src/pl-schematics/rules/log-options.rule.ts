// src/pl-schematics/rules/log-options.rule.ts

/**
 * @author l.piciollo
 * Rule della chain di index.ts: viene eseguita dopo addPackageJsonDependencies e prima
 * delle rule che generano le librerie. Serve solo a diagnostica: stampa nel logger le
 * opzioni definitive (dopo normalizzazione e rilevamento del workspace).
 */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';

/**
 * @author l.piciollo
 * Scrive nel logger dello schematic le opzioni risolte e il flag di documentazione.
 * Non modifica il Tree.
 * @param options  :opzioni normalizzate da stampare
 * @returns Rule che restituisce il Tree invariato
 */
export function logOptions(options: PlSchematicsOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    context.logger.info('PL schematics options:');
    context.logger.info(JSON.stringify(options, null, 2));
    context.logger.info('Include documentation: ' + options.includeDocumentation);
    return host;
  };
}