// src/pl-schematics/rules/add-ngrx-library.rule.ts

/**
 * @author l.piciollo
 * Rule della chain di index.ts: viene eseguita dopo addPackageJsonDependencies e
 * logOptions, SOLO se options.state === 'ngrx' (altrimenti noop), e prima di
 * addSharedLibrary. Registra e popola la libreria Angular "ngrx" del workspace.
 */

import { chain, Rule } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { addLibraryClass } from './add-library-class.rule';
import {
  getLibraryRoot,
  getLibrarySourceDir,
  getLibrarySourceRoot,
  registerLibrary,
} from '../utils/library.utils';

/**
 * @author l.piciollo
 * Genera la libreria Angular "<namePackage>-ngrx": store NgRx (state module,
 * root reducers/effects/selectors, feature 'app' e 'storage') gia' pronto e
 * riutilizzabile. La libreria e' indipendente da "shared": lo StateModule
 * esportato dalla public-api viene importato dall'app (da update-app-shell:
 * imports di app.module.ts nelle app classic, importProvidersFrom(StateModule)
 * nei provider di app.config.ts nelle app standalone) quando lo stato NgRx e' abilitato.
 * @param options  :opzioni normalizzate; richiede ngrxLibName valorizzato da normalize-options
 * @returns Rule che registra la libreria nel workspace e copia i template ngrx-lib*
 */
export function addNgrxLibrary(options: PlSchematicsOptions): Rule {
  const libName = options.ngrxLibName as string;
  const libRoot = getLibraryRoot(libName);
  const libSrcDir = getLibrarySourceDir(libName);
  const libSourceRoot = getLibrarySourceRoot(libName);

  return chain([
    registerLibrary(options, libName),

    addLibraryClass(options, './files/ngrx-lib-scaffold', libRoot),
    addLibraryClass(options, './files/ngrx-lib-entrypoint', libSrcDir),
    addLibraryClass(options, './files/ngrx-lib', libSourceRoot),
  ]);
}
