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

        options.architecture = options.architecture || 'classic';
        options.state = options.state || 'none';
        options.http = options.http || 'interceptor-classic';
        options.ui = options.ui || 'bootstrap';
        options.i18n = options.i18n || 'ngx-translate';
        options.logging = options.logging || 'console';
        options.mockApi = options.mockApi || 'none';
        options.ci = options.ci || 'none';
        options.tests = options.tests || 'jasmine';

        options.docker = options.docker === true;
        options.strict = options.strict === true;

        context.logger.info(
            'Options normalized for project: "' + (options.project || 'default') + '"',
        );

        return host;
    };
}