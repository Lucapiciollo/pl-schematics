"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_utilities_1 = require("schematics-utilities");
function hasHttpInterceptor(options) {
    return options.http === 'interceptor-classic' ||
        options.http === 'interceptor-functional';
}
function addPackageJsonDependencies(options) {
    return (host, context) => {
        const dependencies = [
            {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: 'latest',
                name: 'pl-core-utils-library',
            },
        ];
        if (options.i18n === 'ngx-translate') {
            dependencies.push({
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: '^4.0.0',
                name: '@ngx-translate/http-loader',
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: '11.0.1',
                name: '@ngx-translate/core',
            });
        }
        if (options.ui === 'material') {
            dependencies.push({
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: 'latest',
                name: '@angular/material',
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: 'latest',
                name: '@angular/cdk',
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: 'latest',
                name: '@angular/animations',
            });
        }
        if (options.ui === 'bootstrap') {
            dependencies.push({
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: 'latest',
                name: 'popper.js',
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: 'latest',
                name: '@popperjs/core',
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: '^3.4.0',
                name: 'jquery',
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: '^5.0.0',
                name: 'bootstrap',
            });
        }
        if (options.state === 'ngrx') {
            dependencies.push({
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: 'latest',
                name: '@ngrx/store',
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: 'latest',
                name: '@ngrx/effects',
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: 'latest',
                name: '@ngrx/entity',
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: 'latest',
                name: '@ngrx/store-devtools',
            });
        }
        if (hasHttpInterceptor(options)) {
        }
        if (options.loginSupportConfiguration === 'AZURE-ACTIVE-DIRECT') {
            dependencies.push({
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: '^3.0.0-beta.0',
                name: '@azure/msal-angular',
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: '^3.0.0-beta.0',
                name: '@azure/msal-browser',
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: '^3.0.0',
                name: '@microsoft/microsoft-graph-client',
            }, {
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: '^2.0.0',
                name: '@microsoft/teams-js',
            });
        }
        if (options.enableSonarQube === 'Y') {
            dependencies.push({
                type: schematics_utilities_1.NodeDependencyType.Default,
                version: '^3.1.0',
                name: 'sonar-scanner',
            });
        }
        if (options.mockApi === 'node-express') {
            dependencies.push({
                type: schematics_utilities_1.NodeDependencyType.Dev,
                version: '^4.18.2',
                name: 'express',
            }, {
                type: schematics_utilities_1.NodeDependencyType.Dev,
                version: '^2.8.5',
                name: 'cors',
            }, {
                type: schematics_utilities_1.NodeDependencyType.Dev,
                version: '^10.9.2',
                name: 'ts-node',
            }, {
                type: schematics_utilities_1.NodeDependencyType.Dev,
                version: '^2.0.0',
                name: 'ts-node-dev',
            }, {
                type: schematics_utilities_1.NodeDependencyType.Dev,
                version: '^4.17.21',
                name: '@types/express',
            }, {
                type: schematics_utilities_1.NodeDependencyType.Dev,
                version: '^2.8.17',
                name: '@types/cors',
            });
        }
        if (options.logging === 'advanced') {
        }
        dependencies.forEach(function (dependency) {
            schematics_utilities_1.addPackageJsonDependency(host, dependency);
            context.logger.info('Library inserted: "' +
                dependency.name +
                '" into ' +
                dependency.type);
        });
        return host;
    };
}
exports.addPackageJsonDependencies = addPackageJsonDependencies;
