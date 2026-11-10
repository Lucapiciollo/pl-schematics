"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTemplateFiles = addTemplateFiles;
const schematics_1 = require("@angular-devkit/schematics");
const add_class_rule_1 = require("./add-class.rule");
const isClassic = (options) => !options.standalone;
const isStandalone = (options) => !!options.standalone;
const hasAzure = (options) => options.loginSupportConfiguration === 'AZURE-ACTIVE-DIRECT';
const TEMPLATE_FOLDERS = [
    { source: './files/core/service', destination: '<namePackage>/core/service/' },
    { source: './files/core/initializer', destination: '<namePackage>/core/initializer/' },
    { source: './files/core/module', destination: '<namePackage>/core/module/', enabled: isClassic },
    { source: './files/core/standalone', destination: '<namePackage>/core/', enabled: isStandalone },
    { source: './files/core/msal', destination: '<namePackage>/core/msal/', enabled: hasAzure },
    {
        source: './files/core/msal-classic',
        destination: '<namePackage>/core/msal/',
        enabled: (options) => hasAzure(options) && isClassic(options),
    },
    { source: './files/core/utils', destination: '<namePackage>/core/utils/' },
    { source: './files/core/type', destination: '<namePackage>/core/type/' },
    { source: './files/home', destination: '<namePackage>/component/page/home' },
    {
        source: './files/home-classic',
        destination: '<namePackage>/component/page/home',
        enabled: isClassic,
    },
    { source: './files/properties', destination: '../environments/' },
    { source: './files/public', destination: '../assets/public' },
    {
        source: './files/application',
        destination: '../../',
        enabled: (options) => options.enableSonarQube === 'Y',
    },
    {
        source: './documentation',
        destination: '../../pl-schematics/document',
        enabled: (options) => options.includeDocumentation === true,
    },
    {
        source: './files/mock-api-node',
        destination: '../../mock-api',
        enabled: (options) => options.mockApi === 'node-express',
    },
    {
        source: './files/ci-azure-devops',
        destination: '../../',
        enabled: (options) => options.ci === 'azure-devops',
    },
    {
        source: './files/ci-github-actions',
        destination: '../../',
        enabled: (options) => options.ci === 'github-actions',
    },
    { source: './files/dependency-updater', destination: '../../' },
];
function resolveDestination(destination, options) {
    return destination.replace('<namePackage>', options.namePackage);
}
function addTemplateFiles(options) {
    return (0, schematics_1.chain)(TEMPLATE_FOLDERS.map((item) => {
        if (item.enabled && !item.enabled(options)) {
            return (0, schematics_1.noop)();
        }
        return (0, add_class_rule_1.addClass)(options, item.source, resolveDestination(item.destination, options));
    }));
}
