// src/pl-schematics/rules/get-prefix-from-angular-json.rule.ts

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { readJsonFile } from '../utils/json.utils';
import { getProjectObject } from '../utils/workspace.utils';

export function getPrefixFromAngularJson(options: PlSchematicsOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    const workspaceJson = readJsonFile(host, 'angular.json');

    if (!workspaceJson) {
      return host;
    }

    const projectObject = getProjectObject(workspaceJson, options);

    options.prefix = projectObject.prefix || '';

    context.logger.info('Finding prefix: "' + options.prefix + '"');

    return host;
  };
}