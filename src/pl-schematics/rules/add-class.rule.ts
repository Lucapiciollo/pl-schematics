// src/pl-schematics/rules/add-class.rule.ts

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