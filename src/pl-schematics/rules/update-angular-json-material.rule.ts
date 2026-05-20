import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import {
  ensureArray,
  overwriteJsonFile,
  pushIfMissing,
  readJsonFile,
} from '../utils/json.utils';
import { getDefaultProjectName } from '../utils/workspace.utils';

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