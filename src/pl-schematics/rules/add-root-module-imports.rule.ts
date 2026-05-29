import { chain, Rule } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { addModuleToImports } from './add-module-to-imports.rule';

export function addRootModuleImports(options: PlSchematicsOptions): Rule {
  return chain([
    addModuleToImports(
      options,
      'InitializerModule',
      './' + options.namePackage + '/core/module/initializer.module',
    ),

    addModuleToImports(
      options,
      'SharedModule',
      './' + options.namePackage + '/shared/module/shared.module',
    ),

    addModuleToImports(
      options,
      'AppRoutingModule',
      './app-routing.module',
    ),
  ]);
}