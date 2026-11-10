"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAngularJsonForAssets = updateAngularJsonForAssets;
const json_utils_1 = require("../utils/json.utils");
const workspace_utils_1 = require("../utils/workspace.utils");
function updateAngularJsonForAssets(options) {
    return (host, context) => {
        const workspaceJson = (0, json_utils_1.readJsonFile)(host, 'angular.json');
        if (!workspaceJson) {
            return host;
        }
        const project = (0, workspace_utils_1.getProjectObject)(workspaceJson, options);
        const buildOptions = (0, workspace_utils_1.getBuildOptions)(project);
        if (!buildOptions || !project.architect || !project.architect.build) {
            context.logger.warn('Build options not found: assets entry not added.');
            return host;
        }
        const input = (project.sourceRoot || 'src') + '/assets';
        const assets = (0, json_utils_1.ensureArray)(project.architect.build.options.assets);
        const present = assets.some((entry) => entry && typeof entry === 'object' && entry.input === input);
        if (!present) {
            assets.push({ glob: '**/*', input, output: '/assets' });
            project.architect.build.options.assets = assets;
            (0, json_utils_1.overwriteJsonFile)(host, 'angular.json', workspaceJson);
            context.logger.info('Added assets entry "' + input + '" into angular.json.');
        }
        return host;
    };
}
