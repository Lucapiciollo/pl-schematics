import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { addClass } from './add-class.rule';

export function addAdvancedLogging(options: PlSchematicsOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (options.logging !== 'advanced') {
      context.logger.info(
        'Advanced logging skipped. Current logging option: "' + options.logging + '"',
      );

      return host;
    }

    return addClass(
      options,
      './files/advanced-logging',
      options.namePackage + '/core/logging/',
    )(host, context);
  };
}