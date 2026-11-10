"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NAME_PACKAGE_SEGMENT = void 0;
exports.validateNamePackage = validateNamePackage;
exports.getLibBaseName = getLibBaseName;
exports.normalizeOptionsSync = normalizeOptionsSync;
exports.resolveWorkspaceOptions = resolveWorkspaceOptions;
exports.normalizeProjectAndPrefix = normalizeProjectAndPrefix;
const schematics_1 = require("@angular-devkit/schematics");
const json_utils_1 = require("../utils/json.utils");
const versions_utils_1 = require("../utils/versions.utils");
const workspace_utils_1 = require("../utils/workspace.utils");
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
    return ['true', 'y', 'yes', 's', 'si', 'sì', '1'].indexOf(normalized) >= 0;
}
function normalizeYesNo(value) {
    return normalizeBoolean(value) ? 'Y' : 'N';
}
function normalizeOptionValue(value, defaultValue, allowedValues) {
    const normalized = normalizeString(value, defaultValue);
    return allowedValues.indexOf(normalized) >= 0
        ? normalized
        : defaultValue;
}
exports.NAME_PACKAGE_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
function validateNamePackage(namePackage) {
    if (typeof namePackage !== 'string' || namePackage.trim() === '') {
        throw new schematics_1.SchematicsException('Option "namePackage" is required.');
    }
    const value = namePackage.trim();
    const segments = value.split('/');
    if (!segments.every((segment) => exports.NAME_PACKAGE_SEGMENT.test(segment))) {
        throw new schematics_1.SchematicsException('Option "namePackage" ("' + value + '") is invalid: use one or more segments separated by "/", ' +
            'each made of letters, numbers, dash and underscore (e.g. "my-app" or "cloud/agic").');
    }
    return value;
}
function getLibBaseName(namePackage) {
    return namePackage
        .split('/')
        .map((segment) => segment.toLowerCase().replace(/_/g, '-'))
        .join('-');
}
function getProjectPrefix(host, projectName) {
    const workspace = (0, json_utils_1.readJsonFile)(host, 'angular.json');
    if (!workspace ||
        !workspace.projects ||
        !workspace.projects[projectName]) {
        return 'app';
    }
    return workspace.projects[projectName].prefix || 'app';
}
function normalizeOptionsSync(options) {
    options.namePackage = validateNamePackage(options.namePackage);
    options.nameCompany = normalizeString(options.nameCompany, 'mycompany');
    options.ui = normalizeOptionValue(options.ui, 'none', ['none', 'material', 'bootstrap']);
    options.state = normalizeOptionValue(options.state, 'none', ['none', 'ngrx']);
    options.logging = normalizeOptionValue(options.logging, 'console', ['none', 'console', 'advanced']);
    options.mockApi = normalizeOptionValue(options.mockApi, 'none', ['none', 'node-express']);
    options.ci = normalizeOptionValue(options.ci, 'none', ['none', 'github-actions', 'azure-devops']);
    options.http = normalizeOptionValue(options.http, 'none', [
        'none',
        'interceptor-classic',
        'interceptor-functional',
    ]);
    options.architecture = normalizeOptionValue(options.architecture, 'auto', [
        'auto',
        'classic',
        'standalone',
    ]);
    options.i18n = normalizeOptionValue(options.i18n, 'ngx-translate', ['none', 'ngx-translate']);
    if (options.tests === 'jest') {
        throw new schematics_1.SchematicsException('Option --tests=jest is not supported: pl-schematics does not generate a Jest setup. Use --tests=jasmine (Angular default test runner: Karma/Jasmine on 19-20, Vitest on 21) or --tests=none.');
    }
    options.tests = normalizeOptionValue(options.tests, 'jasmine', ['none', 'jasmine', 'jest']);
    options.loginSupportConfiguration = normalizeOptionValue(options.loginSupportConfiguration, 'NONE', [
        'NONE',
        'AZURE-ACTIVE-DIRECT',
    ]);
    if (options.loginSupportConfiguration === 'AZURE-ACTIVE-DIRECT' && options.http === 'none') {
        options.http = 'interceptor-classic';
    }
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
    options.addSupportBootstrap = options.ui === 'bootstrap' ? 'Y' : 'N';
    const libBaseName = getLibBaseName(options.namePackage);
    const segments = options.namePackage.split('/').length;
    options.libBaseName = libBaseName;
    options.sharedLibName = libBaseName + '-shared';
    options.ngrxLibName = libBaseName + '-ngrx';
    options.nsUp = new Array(segments).join('../');
}
function resolveWorkspaceOptions(host, options, context) {
    const workspace = (0, json_utils_1.readJsonFile)(host, 'angular.json');
    if (!workspace) {
        throw new schematics_1.SchematicsException('angular.json not found: run the schematic inside an Angular CLI workspace.');
    }
    options.project = normalizeString(options.project, (0, workspace_utils_1.getDefaultProjectName)(workspace, options));
    options.prefix = normalizeString(options.prefix, getProjectPrefix(host, options.project));
    const angularVersion = (0, versions_utils_1.getAngularVersion)(host);
    options.angularMajor = angularVersion.major;
    options.angularMinor = angularVersion.minor;
    const app = (0, workspace_utils_1.detectApp)(host, options);
    const architecture = (0, workspace_utils_1.resolveArchitecture)(options.architecture, app.architecture);
    options.architecture = architecture;
    options.standalone = architecture === 'standalone';
    options.appInfo = app;
    const rootComponentPath = app.rootComponent.file.replace(/\.ts$/, '');
    const relative = rootComponentPath.substring(app.appDir.length + 1);
    options.rootComponentClass = app.rootComponent.className;
    options.rootComponentImport = './' + relative;
    if (context) {
        context.logger.info('Detected Angular ' + options.angularMajor + ' ' + architecture + ' application "' + options.project +
            '" (root component: ' + app.rootComponent.className + ').');
    }
}
function normalizeProjectAndPrefix(options) {
    return (host, context) => {
        resolveWorkspaceOptions(host, options, context);
        return host;
    };
}
