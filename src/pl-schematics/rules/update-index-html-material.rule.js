"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateIndexHtmlForMaterial = void 0;
const json_utils_1 = require("../utils/json.utils");
const workspace_utils_1 = require("../utils/workspace.utils");
function getBuildOptions(project) {
    if (project.architect && project.architect.build && project.architect.build.options) {
        return project.architect.build.options;
    }
    if (project.targets && project.targets.build && project.targets.build.options) {
        return project.targets.build.options;
    }
    return {};
}
function updateIndexHtmlForMaterial(options) {
    return (host, context) => {
        if (options.ui !== 'material') {
            return host;
        }
        const workspaceJson = (0, json_utils_1.readJsonFile)(host, 'angular.json');
        if (!workspaceJson) {
            return host;
        }
        const project = (0, workspace_utils_1.getProjectObject)(workspaceJson, options);
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
        const materialIcons = '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">';
        const robotoFont = '<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap" rel="stylesheet">';
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
exports.updateIndexHtmlForMaterial = updateIndexHtmlForMaterial;
