"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_utilities_1 = require("schematics-utilities");
const json_utils_1 = require("./json.utils");
function getDefaultProjectName(workspaceJson, options) {
    if (options.project) {
        return options.project;
    }
    if (workspaceJson.defaultProject) {
        return workspaceJson.defaultProject;
    }
    const projectNames = Object.keys(workspaceJson.projects || {});
    if (!projectNames.length) {
        throw new Error('No project found inside angular.json');
    }
    return projectNames[0];
}
exports.getDefaultProjectName = getDefaultProjectName;
function getProjectObject(workspaceJson, options) {
    const projectName = getDefaultProjectName(workspaceJson, options);
    const projects = workspaceJson.projects || {};
    const project = projects[projectName];
    if (!project) {
        throw new Error('Project "' + projectName + '" not found inside angular.json');
    }
    return project;
}
exports.getProjectObject = getProjectObject;
function getProjectDefaultPath(host, options) {
    const workspaceJson = json_utils_1.readJsonFile(host, 'angular.json');
    if (!workspaceJson) {
        return null;
    }
    const projectObject = getProjectObject(workspaceJson, options);
    return schematics_utilities_1.buildDefaultPath(projectObject);
}
exports.getProjectDefaultPath = getProjectDefaultPath;
