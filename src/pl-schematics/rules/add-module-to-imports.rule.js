"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_utils_1 = require("../utils/json.utils");
const workspace_utils_1 = require("../utils/workspace.utils");
function normalizePath(path) {
    return path.replace(/\\/g, '/');
}
function getBuildOptions(project) {
    if (project.architect && project.architect.build && project.architect.build.options) {
        return project.architect.build.options;
    }
    if (project.targets && project.targets.build && project.targets.build.options) {
        return project.targets.build.options;
    }
    return {};
}
function getRootModulePath(host, project) {
    const sourceRoot = project.sourceRoot || 'src';
    const candidates = [
        sourceRoot + '/app/app.module.ts',
        'src/app/app.module.ts',
    ];
    for (let i = 0; i < candidates.length; i++) {
        const candidate = normalizePath(candidates[i]);
        if (host.exists(candidate)) {
            return candidate;
        }
    }
    const buildOptions = getBuildOptions(project);
    const mainFile = buildOptions.main || buildOptions.browser;
    if (!mainFile || !host.exists(mainFile)) {
        return null;
    }
    const mainContentBuffer = host.read(mainFile);
    if (!mainContentBuffer) {
        return null;
    }
    const mainContent = mainContentBuffer.toString();
    const importMatch = mainContent.match(/import\s*\{\s*AppModule\s*\}\s*from\s*['"](.+)['"]/);
    if (!importMatch || !importMatch[1]) {
        return null;
    }
    const mainFolder = mainFile.substring(0, mainFile.lastIndexOf('/'));
    const moduleRelativePath = importMatch[1];
    const modulePath = normalizePath(mainFolder + '/' + moduleRelativePath.replace(/^\.\//, '') + '.ts');
    if (host.exists(modulePath)) {
        return modulePath;
    }
    return null;
}
function hasImport(content, moduleName, libName) {
    return (content.indexOf(moduleName) >= 0 &&
        content.indexOf(libName) >= 0);
}
function addImportStatement(content, moduleName, libName) {
    if (hasImport(content, moduleName, libName)) {
        return content;
    }
    return 'import { ' + moduleName + ' } from \'' + libName + '\';\n' + content;
}
function addModuleToNgModuleImports(content, moduleName) {
    const importsArrayRegex = /imports\s*:\s*\[([\s\S]*?)\]/m;
    const match = content.match(importsArrayRegex);
    if (!match) {
        return content;
    }
    const importsContent = match[1];
    if (importsContent.indexOf(moduleName) >= 0) {
        return content;
    }
    const replacement = 'imports: [' +
        importsContent +
        (importsContent.trim().length > 0 ? ',\n    ' : '\n    ') +
        moduleName +
        '\n  ]';
    return content.replace(importsArrayRegex, replacement);
}
function addModuleToImports(options, moduleName, libName) {
    return (host, context) => {
        const workspaceJson = json_utils_1.readJsonFile(host, 'angular.json');
        if (!workspaceJson) {
            context.logger.warn('angular.json not found. Skipping module import: "' + moduleName + '"');
            return host;
        }
        const projectName = workspace_utils_1.getDefaultProjectName(workspaceJson, options);
        const project = workspace_utils_1.getProjectObject(workspaceJson, options);
        const rootModulePath = getRootModulePath(host, project);
        if (!rootModulePath) {
            context.logger.warn('Root AppModule not found for project "' +
                projectName +
                '". Skipping module import "' +
                moduleName +
                '". This is normal for standalone Angular projects.');
            return host;
        }
        const buffer = host.read(rootModulePath);
        if (!buffer) {
            context.logger.warn('Cannot read root module: "' + rootModulePath + '"');
            return host;
        }
        let content = buffer.toString();
        const previousContent = content;
        content = addImportStatement(content, moduleName, libName);
        content = addModuleToNgModuleImports(content, moduleName);
        if (content !== previousContent) {
            host.overwrite(rootModulePath, content);
            context.logger.info('Inserted module "' + moduleName + '" into "' + rootModulePath + '"');
        }
        else {
            context.logger.info('Module "' + moduleName + '" already present or imports array not found.');
        }
        return host;
    };
}
exports.addModuleToImports = addModuleToImports;
