/**
 * @author l.piciollo
 * Rule della chain di index.ts: viene eseguita dopo updateAngularJsonForBudgets, nel
 * blocco UI, prima di updateIndexHtmlForMaterial. Agisce solo con ui === 'material'.
 */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import {
  ensureArray,
  overwriteJsonFile,
  pushIfMissing,
  readJsonFile,
} from '../utils/json.utils';
import { getDefaultProjectName } from '../utils/workspace.utils';

/**
 * @author l.piciollo
 * Aggiunge a angular.json il tema precompilato di Angular Material (indigo-pink) agli
 * stili di build. Non fa nulla se la UI scelta non e' 'material'.
 * @param options  :opzioni normalizzate (ui e progetto)
 * @returns Rule che aggiorna angular.json e restituisce il Tree
 */
export function updateAngularJsonForMaterial(
  options: PlSchematicsOptions,
): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (options.ui !== 'material') {
      return host;
    }

    const workspaceJson = readJsonFile(host, 'angular.json');

    if (!workspaceJson) {
      return host;
    }

    const projectName = getDefaultProjectName(workspaceJson, options);
    const project = workspaceJson.projects[projectName];

    if (
      !project ||
      !project.architect ||
      !project.architect.build ||
      !project.architect.build.options
    ) {
      context.logger.warn(
        'Cannot update angular.json Material configuration. Build options not found.',
      );
      return host;
    }

    const buildOptions = project.architect.build.options;

    buildOptions.styles = ensureArray<string>(buildOptions.styles);

    pushIfMissing(
      buildOptions.styles,
      'node_modules/@angular/material/prebuilt-themes/indigo-pink.css',
    );

    overwriteJsonFile(host, 'angular.json', workspaceJson);

    context.logger.info('Added Angular Material theme into angular.json.');

    return host;
  };
}