"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const add_class_rule_1 = require("./add-class.rule");
function hasHttpInterceptor(options) {
    return options.http === 'interceptor-classic' ||
        options.http === 'interceptor-functional';
}
function hasAdvancedLogging(options) {
    return options.logging === 'advanced';
}
function hasMaterial(options) {
    return options.ui === 'material';
}
function hasNgrx(options) {
    return options.state === 'ngrx';
}
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
        source: './files/core/bean',
        destination: '<namePackage>/core/bean/',
    },
    {
        source: './files/core/module',
        destination: '<namePackage>/core/module/',
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
        source: './files/core/interceptor',
        destination: '<namePackage>/core/interceptor/',
        enabled: hasHttpInterceptor,
    },
    {
        source: './files/shared/module',
        destination: '<namePackage>/shared/module/',
    },
    {
        source: './files/shared/utils',
        destination: '<namePackage>/shared/utils/',
    },
    {
        source: './files/shared/service',
        destination: '<namePackage>/shared/service/',
    },
    {
        source: './files/shared/component',
        destination: '<namePackage>/shared/component/',
    },
    {
        source: './files/shared/pipe',
        destination: '<namePackage>/shared/pipe/',
    },
    {
        source: './files/shared/http',
        destination: '<namePackage>/shared/http/',
        enabled: hasHttpInterceptor,
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
        source: './files/advanced-logging',
        destination: '<namePackage>/core/logging/',
        enabled: hasAdvancedLogging,
    },
    {
        source: './files/material',
        destination: '<namePackage>/shared/material/',
        enabled: hasMaterial,
    },
    {
        source: './files/ngrx',
        destination: '<namePackage>/',
        enabled: hasNgrx,
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
    return schematics_1.chain(TEMPLATE_FOLDERS.map(function (item) {
        if (item.enabled && !item.enabled(options)) {
            return schematics_1.noop();
        }
        return add_class_rule_1.addClass(options, item.source, resolveDestination(item.destination, options));
    }));
}
exports.addTemplateFiles = addTemplateFiles;
