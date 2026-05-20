// src/pl-schematics/rules/add-material-module-imports.rule.ts

import { chain, noop, Rule } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { addModuleToImports } from './add-module-to-imports.rule';

export function addMaterialModuleImports(options: PlSchematicsOptions): Rule {
  if (options.ui !== 'material') {
    return noop();
  }

  return chain([
    /**
     * BrowserAnimationsModule deve stare nel root AppModule.
     * MaterialModule invece lo importiamo/esportiamo nello SharedModule template.
     */
    addModuleToImports(
      options,
      'BrowserAnimationsModule',
      '@angular/platform-browser/animations',
    ),
  ]);
}