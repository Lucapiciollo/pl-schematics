"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNgPackagrBuilder = getNgPackagrBuilder;
exports.getLibraryRoot = getLibraryRoot;
exports.getLibrarySourceRoot = getLibrarySourceRoot;
exports.getLibrarySourceDir = getLibrarySourceDir;
exports.addLibraryProjectToWorkspace = addLibraryProjectToWorkspace;
exports.addLibraryTsConfigPath = addLibraryTsConfigPath;
exports.registerLibrary = registerLibrary;
const json_utils_1 = require("./json.utils");
function getNgPackagrBuilder(host) {
    const packageJson = (0, json_utils_1.readJsonFile)(host, 'package.json') || {};
    const hasBuildAngular = (packageJson.devDependencies && packageJson.devDependencies['@angular-devkit/build-angular']) ||
        (packageJson.dependencies && packageJson.dependencies['@angular-devkit/build-angular']);
    return hasBuildAngular
        ? '@angular-devkit/build-angular:ng-packagr'
        : '@angular/build:ng-packagr';
}
function getLibraryRoot(libName) {
    return 'projects/' + libName;
}
function getLibrarySourceRoot(libName) {
    return getLibraryRoot(libName) + '/src/lib';
}
function getLibrarySourceDir(libName) {
    return getLibraryRoot(libName) + '/src';
}
function addLibraryProjectToWorkspace(host, context, libName, prefix) {
    const workspaceJson = (0, json_utils_1.readJsonFile)(host, 'angular.json');
    if (!workspaceJson) {
        context.logger.warn('angular.json not found. Skipping library project registration for "' +
            libName +
            '".');
        return;
    }
    workspaceJson.projects = workspaceJson.projects || {};
    if (workspaceJson.projects[libName]) {
        context.logger.info('Library project "' + libName + '" already present in angular.json.');
        return;
    }
    const projectRoot = getLibraryRoot(libName);
    workspaceJson.projects[libName] = {
        projectType: 'library',
        root: projectRoot,
        sourceRoot: projectRoot + '/src',
        prefix: prefix || 'lib',
        architect: {
            build: {
                builder: getNgPackagrBuilder(host),
                options: {
                    tsConfig: projectRoot + '/tsconfig.lib.json',
                    project: projectRoot + '/ng-package.json',
                },
                configurations: {
                    production: {
                        tsConfig: projectRoot + '/tsconfig.lib.prod.json',
                    },
                    development: {
                        tsConfig: projectRoot + '/tsconfig.lib.json',
                    },
                },
                defaultConfiguration: 'production',
            },
        },
    };
    (0, json_utils_1.overwriteJsonFile)(host, 'angular.json', workspaceJson);
    context.logger.info('Library project "' + libName + '" registered in angular.json.');
}
function addLibraryTsConfigPath(host, context, libName) {
    const tsConfigPath = 'tsconfig.json';
    const tsConfig = (0, json_utils_1.readJsonFile)(host, tsConfigPath);
    if (!tsConfig) {
        context.logger.warn('tsconfig.json not found. Skipping path mapping for library "' +
            libName +
            '".');
        return;
    }
    tsConfig.compilerOptions = tsConfig.compilerOptions || {};
    tsConfig.compilerOptions.paths = tsConfig.compilerOptions.paths || {};
    const entryPoint = './' + getLibraryRoot(libName) + '/src/public-api.ts';
    if (!tsConfig.compilerOptions.paths[libName]) {
        tsConfig.compilerOptions.paths[libName] = [entryPoint];
    }
    (0, json_utils_1.overwriteJsonFile)(host, tsConfigPath, tsConfig);
    context.logger.info('Path mapping "' + libName + '" -> "' + entryPoint + '" added to tsconfig.json.');
}
function registerLibrary(options, libName) {
    return (host, context) => {
        addLibraryProjectToWorkspace(host, context, libName, options.prefix || 'lib');
        addLibraryTsConfigPath(host, context, libName);
        return host;
    };
}
