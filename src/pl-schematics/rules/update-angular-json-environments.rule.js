"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_utils_1 = require("../utils/json.utils");
const workspace_utils_1 = require("../utils/workspace.utils");
function getBuildTarget(project) {
    if (project.architect && project.architect.build) {
        return project.architect.build;
    }
    if (project.targets && project.targets.build) {
        return project.targets.build;
    }
    return null;
}
function getBuildConfigurations(project) {
    const buildTarget = getBuildTarget(project);
    if (!buildTarget) {
        return null;
    }
    buildTarget.configurations = buildTarget.configurations || {};
    return buildTarget.configurations;
}
function pushFileReplacementIfMissing(fileReplacements, replacePath, withPath) {
    const exists = fileReplacements.some(function (item) {
        return item &&
            item.replace === replacePath &&
            item.with === withPath;
    });
    if (!exists) {
        fileReplacements.push({
            replace: replacePath,
            with: withPath,
        });
    }
}
function updateAngularJsonForEnvironments(options) {
    return (host, context) => {
        const workspaceJson = json_utils_1.readJsonFile(host, 'angular.json');
        if (!workspaceJson) {
            context.logger.warn('angular.json not found. Skipping environment configuration.');
            return host;
        }
        const projectName = workspace_utils_1.getDefaultProjectName(workspaceJson, options);
        const project = workspaceJson.projects && workspaceJson.projects[projectName];
        if (!project) {
            context.logger.warn('Project "' +
                projectName +
                '" not found. Skipping environment configuration.');
            return host;
        }
        const buildTarget = getBuildTarget(project);
        const configurations = getBuildConfigurations(project);
        if (!buildTarget || !configurations) {
            context.logger.warn('Build target not found for project "' +
                projectName +
                '". Skipping environment configuration.');
            return host;
        }
        const sourceRoot = project.sourceRoot || 'src';
        const environmentPath = sourceRoot + '/environments/environment.ts';
        const environmentProdPath = sourceRoot + '/environments/environment.prod.ts';
        configurations.production = configurations.production || {};
        configurations.production.fileReplacements =
            json_utils_1.ensureArray(configurations.production.fileReplacements);
        pushFileReplacementIfMissing(configurations.production.fileReplacements, environmentPath, environmentProdPath);
        configurations.development = configurations.development || {};
        json_utils_1.overwriteJsonFile(host, 'angular.json', workspaceJson);
        context.logger.info('Environment fileReplacements configured for project "' +
            projectName +
            '".');
        return host;
    };
}
exports.updateAngularJsonForEnvironments = updateAngularJsonForEnvironments;
