"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTemplateFiles = void 0;
function hasAzureActiveDirectory(options) {
    return options.loginSupportConfiguration === 'AZURE-ACTIVE-DIRECT';
}
const schematics_1 = require("@angular-devkit/schematics");
const add_class_rule_1 = require("./add-class.rule");
function hasMockApi(options) {
    return options.mockApi === 'node-express';
}
const TEMPLATE_FOLDERS = [
    {
        source: './files/core/service',
        destination: '<namePackage>/core/service/',
    },
    {
        source: './files/core/initializer',
        destination: '<namePackage>/core/initializer/',
    },
    {
        source: './files/core/module',
        destination: '<namePackage>/core/module/',
    },
    {
        source: './files/core/msal',
        destination: '<namePackage>/core/module/msal/',
        enabled: hasAzureActiveDirectory,
    },
    {
        source: './files/core/utils',
        destination: '<namePackage>/core/utils/',
    },
    {
        source: './files/core/type',
        destination: '<namePackage>/core/type/',
    },
    {
        source: './files/home',
        destination: '<namePackage>/component/page/home',
    },
    {
        source: './files/component',
        destination: '/',
    },
    {
        source: './files/extension',
        destination: '/',
    },
    {
        source: './files/customInterface',
        destination: '../',
    },
    {
        source: './files/properties',
        destination: '../environments/',
    },
    {
        source: './files/public',
        destination: '../assets/public',
    },
    {
        source: './files/application',
        destination: '../../',
        enabled: function (options) {
            return options.enableSonarQube === 'Y';
        },
    },
    {
        source: './documentation',
        destination: '../../pl-schematics/document',
        enabled: function (options) {
            return options.includeDocumentation === true;
        },
    },
    {
        source: './files/mock-api-node',
        destination: '../../mock-api',
        enabled: hasMockApi,
    },
    {
        source: './files/ci-azure-devops',
        destination: '../../',
        enabled: function (options) {
            return options.ci === 'azure-devops';
        },
    },
    {
        source: './files/ci-github-actions',
        destination: '../../',
        enabled: function (options) {
            return options.ci === 'github-actions';
        },
    },
    {
        source: './files/dependency-updater',
        destination: '../../',
    },
];
function resolveDestination(destination, options) {
    return destination.replace('<namePackage>', options.namePackage);
}
function addTemplateFiles(options) {
    return (0, schematics_1.chain)(TEMPLATE_FOLDERS.map(function (item) {
        if (item.enabled && !item.enabled(options)) {
            return (0, schematics_1.noop)();
        }
        return (0, add_class_rule_1.addClass)(options, item.source, resolveDestination(item.destination, options));
    }));
}
exports.addTemplateFiles = addTemplateFiles;
