"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_utils_1 = require("../utils/json.utils");
function normalizeString(value, defaultValue) {
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }
    return String(value);
}
function normalizeBoolean(value) {
    if (value === true) {
        return true;
    }
    if (value === false) {
        return false;
    }
    const normalized = String(value || '').toLowerCase();
    return normalized === 'true' ||
        normalized === 'y' ||
        normalized === 'yes' ||
        normalized === 's' ||
        normalized === 'si' ||
        normalized === 'sì' ||
        normalized === '1';
}
function normalizeYesNo(value) {
    if (value === true) {
        return 'Y';
    }
    if (value === false) {
        return 'N';
    }
    const normalized = String(value || '').toUpperCase();
    return normalized === 'Y' ||
        normalized === 'YES' ||
        normalized === 'TRUE' ||
        normalized === '1' ||
        normalized === 'S' ||
        normalized === 'SI' ||
        normalized === 'SÌ'
        ? 'Y'
        : 'N';
}
function normalizeOptionValue(value, defaultValue, allowedValues) {
    const normalized = normalizeString(value, defaultValue);
    return allowedValues.indexOf(normalized) >= 0
        ? normalized
        : defaultValue;
}
function getDefaultProjectName(host) {
    const workspace = json_utils_1.readJsonFile(host, 'angular.json');
    if (!workspace || !workspace.projects) {
        return '';
    }
    if (workspace.defaultProject) {
        return workspace.defaultProject;
    }
    const projectNames = Object.keys(workspace.projects);
    return projectNames.length > 0 ? projectNames[0] : '';
}
function getProjectPrefix(host, projectName) {
    const workspace = json_utils_1.readJsonFile(host, 'angular.json');
    if (!workspace ||
        !workspace.projects ||
        !workspace.projects[projectName]) {
        return 'app';
    }
    return workspace.projects[projectName].prefix || 'app';
}
function normalizeOptions(options) {
    return (host, context) => {
        const resolvedProject = normalizeString(options.project, getDefaultProjectName(host));
        options.project = resolvedProject;
        options.prefix = normalizeString(options.prefix, getProjectPrefix(host, resolvedProject));
        options.nameCompany = normalizeString(options.nameCompany, 'mycompany');
        options.prefixClass = normalizeString(options.prefixClass, 'Pl');
        options.ui = normalizeOptionValue(options.ui, 'none', [
            'none',
            'material',
            'bootstrap',
        ]);
        options.state = normalizeOptionValue(options.state, 'none', [
            'none',
            'ngrx',
        ]);
        options.logging = normalizeOptionValue(options.logging, 'console', [
            'none',
            'console',
            'advanced',
        ]);
        options.mockApi = normalizeOptionValue(options.mockApi, 'none', [
            'none',
            'node-express',
        ]);
        options.ci = normalizeOptionValue(options.ci, 'none', [
            'none',
            'github-actions',
            'azure-devops',
        ]);
        options.http = normalizeOptionValue(options.http, 'none', [
            'none',
            'interceptor-classic',
            'interceptor-functional',
        ]);
        options.architecture = normalizeOptionValue(options.architecture, 'classic', [
            'classic',
            'standalone',
        ]);
        options.i18n = normalizeOptionValue(options.i18n, 'ngx-translate', [
            'none',
            'ngx-translate',
        ]);
        options.tests = normalizeOptionValue(options.tests, 'jasmine', [
            'none',
            'jasmine',
            'jest',
        ]);
        options.loginSupportConfiguration = normalizeOptionValue(options.loginSupportConfiguration, 'NONE', [
            'NONE',
            'AZURE-ACTIVE-DIRECT',
        ]);
        options.browserSupported = normalizeOptionValue(options.browserSupported, 'BROWSER.ALL', [
            'BROWSER.ALL',
            'BROWSER.CHROME',
            'BROWSER.FIREFOX',
            'BROWSER.EDGE',
            'BROWSER.SAFARI',
        ]);
        options.includeDocumentation = normalizeBoolean(options.includeDocumentation);
        options.strict = normalizeBoolean(options.strict);
        options.enableSonarQube = normalizeYesNo(options.enableSonarQube);
        if (options.ui === 'bootstrap') {
            options.addSupportBootstrap = 'Y';
        }
        else {
            options.addSupportBootstrap = 'N';
        }
        context.logger.info('Options normalized for project: "' + options.project + '"');
        return host;
    };
}
exports.normalizeOptions = normalizeOptions;
