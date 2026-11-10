// src/pl-schematics/rules/add-class.rule.ts

/**
 * @author l.piciollo
 * Rule di basso livello (non e' un passo diretto della chain di index.ts): copia una
 * cartella di template EJS dentro il progetto applicativo target (cartella sorgente
 * dell'app). E' invocata da addTemplateFiles() (add-template-files.rule.ts) per ogni
 * voce del manifest dei template applicativi.
 */

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
import { getProjectDefaultPath } from '../utils/workspace.utils';

/**
 * @author l.piciollo
 * Copia i template di una cartella sorgente nel progetto target, applicando le opzioni
 * come variabili EJS e le utility di naming di @angular-devkit/core (strings).
 * Se il percorso di default del progetto non e' risolvibile non fa nulla.
 * @param options    :opzioni normalizzate dello schematic, usate come contesto dei template
 * @param urlFile    :percorso relativo della cartella template (es. './files/...')
 * @param destPath   :sottocartella di destinazione, relativa al percorso di default del progetto
 * @returns Rule che unisce i template generati al Tree sovrascrivendo i file gia' presenti
 */
export function addClass(
  options: PlSchematicsOptions,
  urlFile: string,
  destPath: string,
): Rule {
  return (host: Tree, context: SchematicContext) => {
    const defaultPath = getProjectDefaultPath(host, options);

    if (!defaultPath) {
      return host;
    }

    const sourceTemplate = url(urlFile);
    const source = apply(sourceTemplate, [
      template({
        ...options,
        name: options.namePackage,
        ...strings,
      }),
      move(defaultPath + '/' + destPath),
    ]);

    context.logger.info('Class created from: "' + urlFile + '"');

    /**
     * @author l.piciollo
     * Lo schematic sovrascrive intenzionalmente alcuni file gia' presenti nel progetto
     * target (es. app.module.ts, environment.ts, vedi README) per applicare il pattern.
     * Usiamo MergeStrategy.Overwrite esplicitamente invece di affidarci al flag CLI
     * --force: quest'ultimo governa solo il conflitto in scrittura su disco a fine
     * esecuzione e, a seconda della versione di @angular-devkit/schematics installata,
     * potrebbe non propagarsi al merge in-memory dell'albero dei template, facendo
     * fallire la generazione con "A merge conflicted on path" anche con --force attivo.
     */
    return mergeWith(source, MergeStrategy.Overwrite);
  };
}