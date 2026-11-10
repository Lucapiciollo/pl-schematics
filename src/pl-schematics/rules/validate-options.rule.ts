import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { validateNamePackage } from './normalize-options.rule';

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
