// src/pl-schematics/rules/normalize-options.rule.ts

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { readJsonFile } from '../utils/json.utils';
import { getDefaultProjectName } from '../utils/workspace.utils';

export function normalizeOptions(options: PlSchematicsOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    const workspaceJson = readJsonFile(host, 'angular.json');

    if (workspaceJson) {
      options.project = getDefaultProjectName(workspaceJson, options);
    }

    if (!options.namePackage) {
      throw new Error('Option "namePackage" is required.');
    }

    options.nameCompany = options.nameCompany || 'mycompany';
    options.prefixClass = options.prefixClass || '';
    options.prefix = options.prefix || '';
    options.browserSupported = options.browserSupported || 'BROWSER.ALL';
    options.loginSupportConfiguration =
      options.loginSupportConfiguration || 'NONE';
    options.addSupportBootstrap = options.addSupportBootstrap || 'Y';
    options.enableSonarQube = options.enableSonarQube || 'Y';

    context.logger.info(
      'Options normalized for project: "' + (options.project || 'default') + '"',
    );

    return host;
  };
}