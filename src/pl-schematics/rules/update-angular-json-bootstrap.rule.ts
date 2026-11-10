// src/pl-schematics/rules/update-angular-json-bootstrap.rule.ts

/**
 * @author l.piciollo
 * Rule della chain di index.ts: viene eseguita dopo updateIndexHtmlForMaterial, SOLO
 * se options.addSupportBootstrap === 'Y' (altrimenti noop). Aggiunge a angular.json gli
 * script e gli stili necessari a Bootstrap, jQuery e Font Awesome.
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
 * Aggiunge (senza duplicare) a angular.json script e stili di Bootstrap, jQuery e
 * Font Awesome nelle opzioni di build del progetto.
 * @param options  :opzioni normalizzate, usate per individuare il progetto in angular.json
 * @returns Rule che aggiorna angular.json e restituisce il Tree
 */
export function updateAngularJsonForBootstrap(
  options: PlSchematicsOptions,
): Rule {
  return (host: Tree, context: SchematicContext) => {
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
        'Cannot update angular.json bootstrap configuration. Build options not found.',
      );
      return host;
    }

    const optionsJson = project.architect.build.options;

    optionsJson.scripts = ensureArray<string>(optionsJson.scripts);
    optionsJson.styles = ensureArray<string>(optionsJson.styles);

    pushIfMissing(optionsJson.scripts, 'node_modules/jquery/dist/jquery.slim.min.js');
    // Bootstrap 5 usa Popper v2 (incluso in bootstrap.bundle): popper.js 1.x non serve.
    pushIfMissing(optionsJson.scripts, 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js');

    pushIfMissing(optionsJson.styles, 'node_modules/bootstrap/dist/css/bootstrap.min.css');
    pushIfMissing(
      optionsJson.styles,
      'node_modules/@fortawesome/fontawesome-free/css/all.min.css',
    );

    overwriteJsonFile(host, 'angular.json', workspaceJson);

    context.logger.info('Added bootstrap support into angular.json.');

    return host;
  };
}