// src/pl-schematics/rules/add-library-class.rule.ts

/**
 * @author l.piciollo
 * Rule di basso livello (non e' un passo diretto della chain di index.ts): copia
 * template EJS dentro una libreria Angular generata. E' usata da addSharedLibrary()
 * e addNgrxLibrary() per popolare projects/<libName>.
 */

import { strings } from '@angular-devkit/core';
import {
  apply,
  filter,
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
 * @param options              :opzioni normalizzate dello schematic, usate come contesto dei template
 * @param urlFile              :percorso relativo della cartella template (es. './files/shared-lib')
 * @param libraryRootDestPath  :cartella di destinazione, relativa alla root del workspace
 * @param skipFiles            :suffissi di path da escludere dalla copia (default: nessuno)
 * @returns Rule che unisce i template generati al Tree sovrascrivendo i file gia' presenti
 */
export function addLibraryClass(
  options: PlSchematicsOptions,
  urlFile: string,
  libraryRootDestPath: string,
  skipFiles: string[] = [],
): Rule {
  return (_host: Tree, context: SchematicContext) => {
    const sourceTemplate = url(urlFile);
    const source = apply(sourceTemplate, [
      filter((path) => !skipFiles.some((skip) => path.endsWith(skip))),
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
