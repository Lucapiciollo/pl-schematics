import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { readJsonFile } from '../utils/json.utils';
import {  getProjectObject } from '../utils/workspace.utils';

function getBuildOptions(project: any): any {
  if (project.architect && project.architect.build && project.architect.build.options) {
    return project.architect.build.options;
  }

  if (project.targets && project.targets.build && project.targets.build.options) {
    return project.targets.build.options;
  }

  return {};
}

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