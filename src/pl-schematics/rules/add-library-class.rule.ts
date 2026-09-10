// src/pl-schematics/rules/add-library-class.rule.ts

import { strings } from '@angular-devkit/core';
import {
  apply,
  mergeWith,
  MergeStrategy,
  move,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';

/**
 * @author l.piciollo
 * Variante di addClass pensata per copiare template DENTRO una libreria Angular
 * generata dallo schematic (projects/<libName>/...), invece che dentro il
 * progetto applicativo. A differenza di addClass, la destinazione non dipende
 * da getProjectDefaultPath (che risolve sempre e solo il progetto 'application'
 * di angular.json), ma da un path assoluto (rispetto alla root del workspace)
 * passato esplicitamente dal chiamante (vedi utils/library.utils.ts).
 */
export function addLibraryClass(
  options: PlSchematicsOptions,
  urlFile: string,
  libraryRootDestPath: string,
): Rule {
  return (_host: Tree, context: SchematicContext) => {
    const sourceTemplate = url(urlFile);
    const source = apply(sourceTemplate, [
      template({
        ...options,
        name: options.namePackage,
        ...strings,
      }),
      move(libraryRootDestPath),
    ]);

    context.logger.info(
      'Library class created from: "' + urlFile + '" into "' + libraryRootDestPath + '"',
    );

    return mergeWith(source, MergeStrategy.Overwrite);
  };
}
