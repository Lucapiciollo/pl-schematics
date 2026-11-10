/**
 * @author l.piciollo
 * Rule della chain di index.ts: viene eseguita subito dopo addTemplateFiles. Configura in
 * angular.json le sostituzioni dei file di environment per la build di produzione
 * (i file environment.* sono creati dai template di addTemplateFiles).
 */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { PlSchematicsOptions } from '../types/schema-options';
import {
  ensureArray,
  overwriteJsonFile,
  readJsonFile,
} from '../utils/json.utils';
import { getDefaultProjectName } from '../utils/workspace.utils';

/**
 * @author l.piciollo
 * Restituisce il target di build di un progetto (architect.build o targets.build).
 * @param project  :oggetto progetto di angular.json
 * @returns il target di build, oppure null se assente
 */
function getBuildTarget(project: any): any {
  if (project.architect && project.architect.build) {
    return project.architect.build;
  }

  if (project.targets && project.targets.build) {
    return project.targets.build;
  }

  return null;
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Restituisce (creandolo se manca) l'oggetto configurations del target di build.
 * @param project  :oggetto progetto di angular.json
 * @returns l'oggetto configurations, oppure null se il target di build non esiste
 */
function getBuildConfigurations(project: any): any {
  const buildTarget = getBuildTarget(project);

  if (!buildTarget) {
    return null;
  }

  buildTarget.configurations = buildTarget.configurations || {};

  return buildTarget.configurations;
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Aggiunge una voce fileReplacements solo se la stessa coppia replace/with non e' gia' presente.
 * @param fileReplacements  :array fileReplacements della configurazione, modificato in place
 * @param replacePath       :file da sostituire (es. environment.ts)
 * @param withPath          :file sostitutivo (es. environment.prod.ts)
 */
function pushFileReplacementIfMissing(
  fileReplacements: any[],
  replacePath: string,
  withPath: string,
): void {
  const exists = fileReplacements.some(function(item: any): boolean {
    return item &&
      item.replace === replacePath &&
      item.with === withPath;
  });

  if (!exists) {
    fileReplacements.push({
      replace: replacePath,
      with: withPath,
    });
  }
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Configura in angular.json la sostituzione environment.ts -> environment.prod.ts per la
 * configurazione production e assicura l'esistenza della configurazione development.
 * Se angular.json, il progetto o il target di build mancano, registra un warning e non modifica nulla.
 * @param options  :opzioni normalizzate, usate per individuare il progetto in angular.json
 * @returns Rule che aggiorna angular.json e restituisce il Tree
 */
export function updateAngularJsonForEnvironments(
  options: PlSchematicsOptions,
): Rule {
  return (host: Tree, context: SchematicContext) => {
    const workspaceJson = readJsonFile(host, 'angular.json');

    if (!workspaceJson) {
      context.logger.warn(
        'angular.json not found. Skipping environment configuration.',
      );

      return host;
    }

    const projectName = getDefaultProjectName(workspaceJson, options);
    const project = workspaceJson.projects && workspaceJson.projects[projectName];

    if (!project) {
      context.logger.warn(
        'Project "' +
          projectName +
          '" not found. Skipping environment configuration.',
      );

      return host;
    }

    const buildTarget = getBuildTarget(project);
    const configurations = getBuildConfigurations(project);

    if (!buildTarget || !configurations) {
      context.logger.warn(
        'Build target not found for project "' +
          projectName +
          '". Skipping environment configuration.',
      );

      return host;
    }

    const sourceRoot = project.sourceRoot || 'src';

    const environmentPath =
      sourceRoot + '/environments/environment.ts';

    const environmentProdPath =
      sourceRoot + '/environments/environment.prod.ts';

    configurations.production = configurations.production || {};
    configurations.production.fileReplacements =
      ensureArray<any>(configurations.production.fileReplacements);

    pushFileReplacementIfMissing(
      configurations.production.fileReplacements,
      environmentPath,
      environmentProdPath,
    );

    configurations.development = configurations.development || {};

    overwriteJsonFile(host, 'angular.json', workspaceJson);

    context.logger.info(
      'Environment fileReplacements configured for project "' +
        projectName +
        '".',
    );

    return host;
  };
}