"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_ANGULAR_MAJORS = void 0;
exports.getVersions = getVersions;
exports.getAngularVersion = getAngularVersion;
exports.getAngularMajorVersion = getAngularMajorVersion;
const schematics_1 = require("@angular-devkit/schematics");
const json_utils_1 = require("./json.utils");
exports.SUPPORTED_ANGULAR_MAJORS = [19, 20, 21];
const NG_BOOTSTRAP_BY_ANGULAR = {
    19: '^18.0.0',
    20: '^19.0.1',
    21: '^20.0.0',
};
function buildVersions(major, minor) {
    return {
        angularAligned: '^' + major + '.0.0',
        angularFramework: '^' + major + '.' + minor + '.0',
        ngxTranslateCore: '^17.0.0',
        ngxTranslateHttpLoader: '^17.0.0',
        ngxUiLoader: '^19.0.0',
        plCoreUtilsLibrary: '~2.1.3',
        plDecorator: '^1.4.28',
        bootstrap: '^5.3.0',
        popperCore: '^2.11.8',
        ngBootstrap: NG_BOOTSTRAP_BY_ANGULAR[major],
        jquery: '^3.7.0',
        fontawesome: '^6.1.1',
        msalAngular: '^6.3.0',
        msalBrowser: '^5.29.0',
        graphClient: '^3.0.7',
        sonarScanner: '^3.1.0',
    };
}
function getVersions(major, minor = 0) {
    if (exports.SUPPORTED_ANGULAR_MAJORS.indexOf(major) < 0) {
        throw new schematics_1.SchematicsException('Angular ' + major + ' is not supported by this version of pl-schematics (supported: ' +
            exports.SUPPORTED_ANGULAR_MAJORS.join(', ') + ').');
    }
    return buildVersions(major, minor);
}
function getAngularVersion(host) {
    const packageJson = (0, json_utils_1.readJsonFile)(host, 'package.json');
    if (!packageJson) {
        throw new schematics_1.SchematicsException('package.json not found: run the schematic inside an Angular CLI workspace.');
    }
    const raw = (packageJson.dependencies && packageJson.dependencies['@angular/core']) ||
        (packageJson.devDependencies && packageJson.devDependencies['@angular/core']);
    const match = raw ? String(raw).match(/(\d+)(?:\.(\d+))?/) : null;
    if (!match) {
        throw new schematics_1.SchematicsException('Cannot determine the Angular version: "@angular/core" is missing or has a non-numeric range ("' + raw + '") in package.json.');
    }
    const major = parseInt(match[1], 10);
    getVersions(major);
    return { major, minor: match[2] ? parseInt(match[2], 10) : 0 };
}
function getAngularMajorVersion(host) {
    return getAngularVersion(host).major;
}
