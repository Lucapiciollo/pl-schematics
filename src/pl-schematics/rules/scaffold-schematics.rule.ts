// src/pl-schematics/rules/scaffold-schematics.rule.ts

/**
 * @author l.piciollo
 * Rule di basso livello (non e' un passo diretto della chain di index.ts): crea una
 * cartella "vuota" scrivendo un file .gitkeep. E' usata da scaffoldEmptyFolders().
 */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { getProjectDefaultPath } from '../utils/workspace.utils';

/**
 * @author l.piciollo
 * Crea una cartella vuota (file .gitkeep) dentro il progetto applicativo.
 * Se il file esiste gia' o il percorso di default non e' risolvibile non modifica nulla.
 * @param options   :opzioni normalizzate, usate per risolvere il percorso di default del progetto
 * @param destPath  :cartella da creare, relativa al percorso di default del progetto
 * @returns Rule che crea il .gitkeep e restituisce il Tree
 */
export function scaffoldSchematics(
  options: PlSchematicsOptions,
  destPath: string,
): Rule {
  return (host: Tree, context: SchematicContext) => {
    const defaultPath = getProjectDefaultPath(host, options);

    if (!defaultPath) {
      return host;
    }

    const filePath = defaultPath + '/' + destPath + '/.gitkeep';

    if (host.exists(filePath)) {
      context.logger.info('Empty folder already exists: "' + filePath + '"');
      return host;
    }

    host.create(filePath, '');

    context.logger.info('Created empty folder: "' + filePath + '"');

    return host;
  };
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Variante di scaffoldSchematics per creare cartelle vuote DENTRO una libreria
 * Angular (path assoluto rispetto alla root del workspace), invece che dentro
 * il progetto applicativo.
 * @param libraryAbsoluteDestPath  :cartella da creare, relativa alla root del workspace
 * @returns Rule che crea il .gitkeep (se assente) e restituisce il Tree
 */
export function scaffoldLibrarySchematics(
  libraryAbsoluteDestPath: string,
): Rule {
  return (host: Tree, context: SchematicContext) => {
    const filePath = libraryAbsoluteDestPath + '/.gitkeep';

    if (host.exists(filePath)) {
      context.logger.info('Empty folder already exists: "' + filePath + '"');
      return host;
    }

    host.create(filePath, '');

    context.logger.info('Created empty folder: "' + filePath + '"');

    return host;
  };
}