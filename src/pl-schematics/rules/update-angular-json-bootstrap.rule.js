"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_utils_1 = require("../utils/json.utils");
const workspace_utils_1 = require("../utils/workspace.utils");
function updateAngularJsonForBootstrap(options) {
    return (host, context) => {
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
            context.logger.warn('Cannot update angular.json bootstrap configuration. Build options not found.');
            return host;
        }
        const optionsJson = project.architect.build.options;
        optionsJson.scripts = json_utils_1.ensureArray(optionsJson.scripts);
        optionsJson.styles = json_utils_1.ensureArray(optionsJson.styles);
        json_utils_1.pushIfMissing(optionsJson.scripts, 'node_modules/jquery/dist/jquery.slim.min.js');
        json_utils_1.pushIfMissing(optionsJson.scripts, 'node_modules/popper.js/dist/umd/popper.min.js');
        json_utils_1.pushIfMissing(optionsJson.scripts, 'node_modules/bootstrap/dist/js/bootstrap.min.js');
        json_utils_1.pushIfMissing(optionsJson.styles, 'node_modules/bootstrap/dist/css/bootstrap.min.css');
        json_utils_1.pushIfMissing(optionsJson.styles, 'node_modules/@fortawesome/fontawesome-free/css/all.min.css');
        json_utils_1.overwriteJsonFile(host, 'angular.json', workspaceJson);
        context.logger.info('Added bootstrap support into angular.json.');
        return host;
    };
}
exports.updateAngularJsonForBootstrap = updateAngularJsonForBootstrap;
