/**
 * @author l.piciollo
 * Rule della chain di index.ts: viene eseguita dopo updateAngularJsonForMaterial e prima
 * del supporto Bootstrap. Con ui === 'material' aggiunge a index.html i link ai font
 * Material Icons e Roboto.
 */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { readJsonFile } from '../utils/json.utils';
import {  getProjectObject } from '../utils/workspace.utils';

/**
 * @author l.piciollo
 * Restituisce le opzioni di build di un progetto (architect.build o targets.build).
 * @param project  :oggetto progetto di angular.json
 * @returns le opzioni di build, oppure un oggetto vuoto se non presenti
 */
function getBuildOptions(project: any): any {
  if (project.architect && project.architect.build && project.architect.build.options) {
    return project.architect.build.options;
  }

  if (project.targets && project.targets.build && project.targets.build.options) {
    return project.targets.build.options;
  }

  return {};
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Inserisce prima di </head> i link ai font Material Icons e Roboto, se non gia' presenti.
 * Non fa nulla se la UI scelta non e' 'material' o se index.html non esiste.
 * @param options  :opzioni normalizzate (ui e progetto)
 * @returns Rule che aggiorna index.html e restituisce il Tree
 */
export function updateIndexHtmlForMaterial(
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

    const project = getProjectObject(workspaceJson, options);
    const buildOptions = getBuildOptions(project);
    const indexPath = buildOptions.index || 'src/index.html';

    if (!host.exists(indexPath)) {
      context.logger.warn('index.html not found. Skipping Material font links.');
      return host;
    }

    const buffer = host.read(indexPath);

    if (!buffer) {
      return host;
    }

    let content = buffer.toString();

    const materialIcons =
      '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">';
    const robotoFont =
      '<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap" rel="stylesheet">';

    if (content.indexOf('fonts.googleapis.com/icon?family=Material+Icons') < 0) {
      content = content.replace('</head>', '  ' + materialIcons + '\n</head>');
    }

    if (content.indexOf('fonts.googleapis.com/css?family=Roboto') < 0) {
      content = content.replace('</head>', '  ' + robotoFont + '\n</head>');
    }

    host.overwrite(indexPath, content);

    context.logger.info('Added Angular Material font links into index.html.');

    return host;
  };
}