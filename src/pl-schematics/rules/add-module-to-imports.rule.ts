// src/pl-schematics/rules/add-module-to-imports.rule.ts

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  addModuleImportToRootModule,
  getProjectFromWorkspace,
  getWorkspace,
} from 'schematics-utilities';
import { PlSchematicsOptions } from '../types/schema-options';
import { getDefaultProjectName } from '../utils/workspace.utils';

export function addModuleToImports(
  options: PlSchematicsOptions,
  moduleName: string,
  libName: string,
): Rule {
  return (host: Tree, context: SchematicContext) => {
    const angularJsonFile = host.read('angular.json');

    if (!angularJsonFile) {
      return host;
    }

    const workspace = getWorkspace(host);
    const workspaceJson = JSON.parse(angularJsonFile.toString());
    const projectName = getDefaultProjectName(workspaceJson, options);
    const project = getProjectFromWorkspace(workspace, projectName);

    addModuleImportToRootModule(host, moduleName, libName, project as any);

    context.logger.info(
      'Insert module: "' + moduleName + '" from "' + libName + '"',
    );

    return host;
  };
}