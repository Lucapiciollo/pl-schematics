// src/pl-schematics/utils/workspace.utils.ts

import { Tree } from '@angular-devkit/schematics';
import { buildDefaultPath } from 'schematics-utilities';
import { JsonObject, readJsonFile } from './json.utils';
import { PlSchematicsOptions } from '../types/schema-options';

export function getDefaultProjectName(
  workspaceJson: JsonObject,
  options: PlSchematicsOptions,
): string {
  if (options.project) {
    return options.project;
  }

  if (workspaceJson.defaultProject) {
    return workspaceJson.defaultProject;
  }

  const projectNames = Object.keys(workspaceJson.projects || {});

  if (!projectNames.length) {
    throw new Error('No project found inside angular.json');
  }

  return projectNames[0];
}

export function getProjectObject(
  workspaceJson: JsonObject,
  options: PlSchematicsOptions,
): JsonObject {
  const projectName = getDefaultProjectName(workspaceJson, options);

  const projects = workspaceJson.projects || {};
  const project = projects[projectName];

  if (!project) {
    throw new Error('Project "' + projectName + '" not found inside angular.json');
  }

  return project;
}

export function getProjectDefaultPath(
  host: Tree,
  options: PlSchematicsOptions,
): string | null {
  const workspaceJson = readJsonFile(host, 'angular.json');

  if (!workspaceJson) {
    return null;
  }

  const projectObject = getProjectObject(workspaceJson, options);

  return buildDefaultPath(projectObject as any);
}