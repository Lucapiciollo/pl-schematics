"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeDependencies = computeDependencies;
exports.addPackageJsonDependencies = addPackageJsonDependencies;
const schematics_1 = require("@angular-devkit/schematics");
const utility_1 = require("@schematics/angular/utility");
const versions_utils_1 = require("../utils/versions.utils");
function computeDependencies(options, angularMajor, angularMinor = 0) {
    const v = (0, versions_utils_1.getVersions)(angularMajor, angularMinor);
    const dependencies = [
        { type: utility_1.DependencyType.Default, name: 'pl-core-utils-library', version: v.plCoreUtilsLibrary },
        { type: utility_1.DependencyType.Default, name: 'pl-decorator', version: v.plDecorator },
        { type: utility_1.DependencyType.Default, name: 'ngx-ui-loader', version: v.ngxUiLoader },
        { type: utility_1.DependencyType.Default, name: 'bootstrap', version: v.bootstrap },
        { type: utility_1.DependencyType.Default, name: '@ng-bootstrap/ng-bootstrap', version: v.ngBootstrap },
        { type: utility_1.DependencyType.Default, name: '@angular/localize', version: v.angularFramework },
        { type: utility_1.DependencyType.Default, name: '@popperjs/core', version: v.popperCore },
        { type: utility_1.DependencyType.Default, name: '@compodoc/compodoc', version: '^1.1.19' },
        { type: utility_1.DependencyType.Dev, name: 'ng-packagr', version: v.angularAligned },
    ];
    if (options.i18n === 'ngx-translate') {
        dependencies.push({ type: utility_1.DependencyType.Default, name: '@ngx-translate/core', version: v.ngxTranslateCore }, { type: utility_1.DependencyType.Default, name: '@ngx-translate/http-loader', version: v.ngxTranslateHttpLoader });
    }
    if (options.ui === 'material') {
        dependencies.push({ type: utility_1.DependencyType.Default, name: '@angular/material', version: v.angularAligned }, { type: utility_1.DependencyType.Default, name: '@angular/cdk', version: v.angularAligned }, { type: utility_1.DependencyType.Default, name: '@angular/animations', version: v.angularFramework });
    }
    if (options.ui === 'bootstrap') {
        dependencies.push({ type: utility_1.DependencyType.Default, name: 'jquery', version: v.jquery }, { type: utility_1.DependencyType.Default, name: '@fortawesome/fontawesome-free', version: v.fontawesome });
    }
    if (options.state === 'ngrx') {
        ['@ngrx/store', '@ngrx/effects', '@ngrx/entity', '@ngrx/store-devtools'].forEach((name) => dependencies.push({ type: utility_1.DependencyType.Default, name, version: v.angularAligned }));
    }
    if (options.loginSupportConfiguration === 'AZURE-ACTIVE-DIRECT') {
        dependencies.push({ type: utility_1.DependencyType.Default, name: '@azure/msal-angular', version: v.msalAngular }, { type: utility_1.DependencyType.Default, name: '@azure/msal-browser', version: v.msalBrowser }, { type: utility_1.DependencyType.Default, name: '@microsoft/microsoft-graph-client', version: v.graphClient });
    }
    if (options.enableSonarQube === 'Y') {
        dependencies.push({ type: utility_1.DependencyType.Default, name: 'sonar-scanner', version: v.sonarScanner });
    }
    if (options.mockApi === 'node-express') {
        dependencies.push({ type: utility_1.DependencyType.Dev, name: 'express', version: '^4.18.2' }, { type: utility_1.DependencyType.Dev, name: 'cors', version: '^2.8.5' }, { type: utility_1.DependencyType.Dev, name: 'ts-node', version: '^10.9.2' }, { type: utility_1.DependencyType.Dev, name: 'ts-node-dev', version: '^2.0.0' }, { type: utility_1.DependencyType.Dev, name: '@types/express', version: '^4.17.21' }, { type: utility_1.DependencyType.Dev, name: '@types/cors', version: '^2.8.17' });
    }
    return dependencies;
}
function addPackageJsonDependencies(options) {
    return (host, context) => {
        const detected = options.angularMajor
            ? { major: options.angularMajor, minor: options.angularMinor || 0 }
            : (0, versions_utils_1.getAngularVersion)(host);
        const angularMajor = detected.major;
        const dependencies = computeDependencies(options, angularMajor, detected.minor);
        context.logger.info('Angular v' + angularMajor + ': adding ' + dependencies.length + ' dependencies with pinned ranges (no "latest").');
        return (0, schematics_1.chain)(dependencies.map((dependency) => (0, utility_1.addDependency)(dependency.name, dependency.version, {
            type: dependency.type,
            existing: utility_1.ExistingBehavior.Replace,
            install: utility_1.InstallBehavior.Auto,
        })));
    };
}
