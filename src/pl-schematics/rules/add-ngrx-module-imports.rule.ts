import { noop, Rule } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';

export function addNgrxModuleImports(options: PlSchematicsOptions): Rule {
  if (options.state !== 'ngrx') {
    return noop();
  }

  /**
   * NgRx viene inizializzato tramite:
   *
   * SharedModule -> StateModule
   *
   * Quindi non modifichiamo direttamente AppModule.
   */
  return noop();
}