"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_utils_1 = require("../utils/json.utils");
const workspace_utils_1 = require("../utils/workspace.utils");
function updateAngularJsonForMaterial(options) {
    return (host, context) => {
        if (options.ui !== 'material') {
            return host;
        }
        const workspaceJson = json_utils_1.readJsonFile(host, 'angular.json');
        if (!workspaceJson) {
            return host;
        }
        const projectName = workspace_utils_1.getDefaultProjectName(workspaceJson, options);
        const project = workspaceJson.projects[projectName];
        if (!project ||
            !project.architect ||
            !project.architect.build ||
            !project.architect.build.options) {
            context.logger.warn('Cannot update angular.json Material configuration. Build options not found.');
            return host;
        }
        const buildOptions = project.architect.build.options;
        buildOptions.styles = json_utils_1.ensureArray(buildOptions.styles);
        json_utils_1.pushIfMissing(buildOptions.styles, 'node_modules/@angular/material/prebuilt-themes/indigo-pink.css');
        json_utils_1.overwriteJsonFile(host, 'angular.json', workspaceJson);
        context.logger.info('Added Angular Material theme into angular.json.');
        return host;
    };
}
exports.updateAngularJsonForMaterial = updateAngularJsonForMaterial;
