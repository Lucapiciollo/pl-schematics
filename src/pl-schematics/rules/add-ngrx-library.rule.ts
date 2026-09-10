// src/pl-schematics/rules/add-ngrx-library.rule.ts

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
 * riutilizzabile. Il modulo StateModule esportato viene importato dalla
 * libreria "shared" quando lo stato NgRx e' abilitato.
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
