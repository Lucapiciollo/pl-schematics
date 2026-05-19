// src/pl-schematics/rules/log-options.rule.ts

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';

export function logOptions(options: PlSchematicsOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    context.logger.info('PL schematics options:');
    context.logger.info(JSON.stringify(options, null, 2));
    context.logger.info('Include documentation: ' + options.includeDocumentation);
    return host;
  };
}