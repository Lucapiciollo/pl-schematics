import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { PlSchematicsOptions } from '../types/schema-options';
import {
  ensureArray,
  overwriteJsonFile,
  readJsonFile,
} from '../utils/json.utils';
import { getDefaultProjectName } from '../utils/workspace.utils';

function getBuildTarget(project: any): any {
  if (project.architect && project.architect.build) {
    return project.architect.build;
  }

  if (project.targets && project.targets.build) {
    return project.targets.build;
  }

  return null;
}

function getBuildConfigurations(project: any): any {
  const buildTarget = getBuildTarget(project);

  if (!buildTarget) {
    return null;
  }

  buildTarget.configurations = buildTarget.configurations || {};

  return buildTarget.configurations;
}

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