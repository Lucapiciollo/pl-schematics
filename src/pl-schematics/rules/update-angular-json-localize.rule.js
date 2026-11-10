"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAngularJsonForLocalize = updateAngularJsonForLocalize;
const json_utils_1 = require("../utils/json.utils");
const workspace_utils_1 = require("../utils/workspace.utils");
function updateAngularJsonForLocalize(options) {
    return (host, context) => {
        const workspaceJson = (0, json_utils_1.readJsonFile)(host, 'angular.json');
        if (!workspaceJson) {
            return host;
        }
        const project = (0, workspace_utils_1.getProjectObject)(workspaceJson, options);
        const build = project.architect && project.architect.build;
        if (!build || !build.options) {
            context.logger.warn('Build options not found: @angular/localize/init polyfill not added.');
            return host;
        }
        const polyfills = (0, json_utils_1.ensureArray)(build.options.polyfills);
        if (polyfills.indexOf('@angular/localize/init') < 0) {
            (0, json_utils_1.pushIfMissing)(polyfills, '@angular/localize/init');
            build.options.polyfills = polyfills;
            (0, json_utils_1.overwriteJsonFile)(host, 'angular.json', workspaceJson);
            context.logger.info('Added @angular/localize/init polyfill into angular.json.');
        }
        return host;
    };
}
