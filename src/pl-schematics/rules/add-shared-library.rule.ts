// src/pl-schematics/rules/add-shared-library.rule.ts

import { chain, noop, Rule } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { addLibraryClass } from './add-library-class.rule';
import {
  getLibraryRoot,
  getLibrarySourceDir,
  getLibrarySourceRoot,
  registerLibrary,
} from '../utils/library.utils';

function hasHttpInterceptor(options: PlSchematicsOptions): boolean {
  return (
    options.http === 'interceptor-classic' ||
    options.http === 'interceptor-functional'
  );
}

function hasMaterial(options: PlSchematicsOptions): boolean {
  return options.ui === 'material';
}

function hasAdvancedLogging(options: PlSchematicsOptions): boolean {
  return options.logging === 'advanced';
}

/**
 * @author l.piciollo
 * Genera la libreria Angular "<namePackage>-shared": componenti, moduli, pipe,
 * servizi e infrastruttura HTTP realmente condivisi, riutilizzabile da
 * qualunque app del workspace. Sostituisce la vecchia cartella
 * src/app/<namePackage>/shared, che non era una libreria ma solo codice
 * sorgente copiato dentro il progetto applicativo.
 */
export function addSharedLibrary(options: PlSchematicsOptions): Rule {
  const libName = options.sharedLibName as string;
  const libRoot = getLibraryRoot(libName);
  const libSrcDir = getLibrarySourceDir(libName);
  const libSourceRoot = getLibrarySourceRoot(libName);

  return chain([
    registerLibrary(options, libName),

    addLibraryClass(options, './files/shared-lib-scaffold', libRoot),
    addLibraryClass(options, './files/shared-lib-entrypoint', libSrcDir),

    addLibraryClass(
      options,
      './files/shared-lib/module',
      libSourceRoot + '/module',
    ),
    addLibraryClass(
      options,
      './files/shared-lib/pipe',
      libSourceRoot + '/pipe',
    ),
    addLibraryClass(
      options,
      './files/shared-lib/utils',
      libSourceRoot + '/utils',
    ),
    addLibraryClass(
      options,
      './files/shared-lib/bean',
      libSourceRoot + '/bean',
    ),
    addLibraryClass(
      options,
      './files/shared-lib/tokens',
      libSourceRoot + '/tokens',
    ),

    hasAdvancedLogging(options)
      ? addLibraryClass(
          options,
          './files/shared-lib/logging',
          libSourceRoot + '/logging',
        )
      : noop(),

    hasHttpInterceptor(options)
      ? chain([
          addLibraryClass(
            options,
            './files/shared-lib/http',
            libSourceRoot + '/http',
          ),
          addLibraryClass(
            options,
            './files/shared-lib/interceptor',
            libSourceRoot + '/interceptor',
          ),
        ])
      : noop(),

    hasMaterial(options)
      ? addLibraryClass(
          options,
          './files/shared-lib/material',
          libSourceRoot + '/material',
        )
      : noop(),
  ]);
}
