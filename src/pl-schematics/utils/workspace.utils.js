"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultProjectName = getDefaultProjectName;
exports.getProjectObject = getProjectObject;
exports.buildDefaultPath = buildDefaultPath;
exports.getProjectDefaultPath = getProjectDefaultPath;
exports.getBuildOptions = getBuildOptions;
exports.normalizePath = normalizePath;
exports.detectApp = detectApp;
exports.resolveArchitecture = resolveArchitecture;
const schematics_1 = require("@angular-devkit/schematics");
const json_utils_1 = require("./json.utils");
function getDefaultProjectName(workspaceJson, options) {
    if (options.project) {
        return options.project;
    }
    if (workspaceJson.defaultProject) {
        return workspaceJson.defaultProject;
    }
    const projects = workspaceJson.projects || {};
    const projectNames = Object.keys(projects);
    if (!projectNames.length) {
        throw new schematics_1.SchematicsException('No project found inside angular.json');
    }
    const application = projectNames.filter((name) => projects[name] && projects[name].projectType === 'application')[0];
    return application || projectNames[0];
}
function getProjectObject(workspaceJson, options) {
    const projectName = getDefaultProjectName(workspaceJson, options);
    const projects = workspaceJson.projects || {};
    const project = projects[projectName];
    if (!project) {
        throw new schematics_1.SchematicsException('Project "' + projectName + '" not found inside angular.json');
    }
    return project;
}
function buildDefaultPath(project) {
    const root = project.sourceRoot
        ? '/' + project.sourceRoot
        : (project.root ? '/' + project.root : '') + '/src';
    const projectDirName = project.projectType === 'application' ? 'app' : 'lib';
    return (root + '/' + projectDirName).replace(/\/+/g, '/').replace(/^\//, '');
}
function getProjectDefaultPath(host, options) {
    const workspaceJson = (0, json_utils_1.readJsonFile)(host, 'angular.json');
    if (!workspaceJson) {
        return null;
    }
    return buildDefaultPath(getProjectObject(workspaceJson, options));
}
function getBuildOptions(project) {
    const target = (project.architect && project.architect.build) ||
        (project.targets && project.targets.build);
    return (target && target.options) || {};
}
function normalizePath(path) {
    return path.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+/g, '/');
}
function dirname(path) {
    const p = normalizePath(path);
    const idx = p.lastIndexOf('/');
    return idx < 0 ? '' : p.substring(0, idx);
}
function joinPath(dir, rel) {
    const parts = (dir ? dir.split('/') : []).concat(rel.split('/'));
    const out = [];
    parts.forEach((part) => {
        if (part === '' || part === '.') {
            return;
        }
        if (part === '..') {
            out.pop();
        }
        else {
            out.push(part);
        }
    });
    return out.join('/');
}
function resolveTsFile(host, fromFile, specifier) {
    if (specifier.charAt(0) !== '.') {
        return null;
    }
    const base = joinPath(dirname(fromFile), specifier);
    return [base + '.ts', base + '/index.ts'].filter((candidate) => host.exists(candidate))[0] || null;
}
function readNamedImports(content) {
    const map = {};
    const regex = /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        match[1].split(',').forEach((entry) => {
            const parts = entry.trim().split(/\s+as\s+/);
            const local = (parts[1] || parts[0]).trim();
            if (local) {
                map[local] = match[2];
            }
        });
    }
    return map;
}
function detectApp(host, options) {
    const workspaceJson = (0, json_utils_1.readJsonFile)(host, 'angular.json');
    if (!workspaceJson) {
        throw new schematics_1.SchematicsException('angular.json not found: run the schematic inside an Angular CLI workspace.');
    }
    const projectName = getDefaultProjectName(workspaceJson, options);
    const project = getProjectObject(workspaceJson, options);
    if (project.projectType && project.projectType !== 'application') {
        throw new schematics_1.SchematicsException('Project "' + projectName + '" is a "' + project.projectType + '": pl-schematics must target an application project (use --project).');
    }
    const appDir = buildDefaultPath(project);
    const buildOptions = getBuildOptions(project);
    const mainFile = normalizePath(buildOptions.browser || buildOptions.main || ((project.sourceRoot || 'src') + '/main.ts'));
    const mainBuffer = host.read(mainFile);
    if (!mainBuffer) {
        throw new schematics_1.SchematicsException('Application entry point "' + mainFile + '" not found for project "' + projectName + '".');
    }
    const mainContent = mainBuffer.toString();
    const mainImports = readNamedImports(mainContent);
    const standaloneMatch = mainContent.match(/bootstrapApplication\(\s*(\w+)\s*(?:,\s*(\w+))?/);
    const classicMatch = mainContent.match(/bootstrapModule\(\s*(\w+)/);
    if (standaloneMatch) {
        const componentFile = resolveTsFile(host, mainFile, mainImports[standaloneMatch[1]] || '');
        if (!componentFile) {
            throw new schematics_1.SchematicsException('Cannot resolve root component "' + standaloneMatch[1] + '" imported by "' + mainFile + '".');
        }
        const configIdentifier = standaloneMatch[2];
        const configFile = configIdentifier
            ? resolveTsFile(host, mainFile, mainImports[configIdentifier] || '')
            : null;
        return {
            projectName,
            appDir,
            mainFile,
            architecture: 'standalone',
            rootComponent: readRootComponent(host, componentFile, standaloneMatch[1]),
            configFile: configFile || appDir + '/app.config.ts',
            routesFile: appDir + '/app.routes.ts',
        };
    }
    if (classicMatch) {
        const moduleFile = resolveTsFile(host, mainFile, mainImports[classicMatch[1]] || '');
        if (!moduleFile) {
            throw new schematics_1.SchematicsException('Cannot resolve root module "' + classicMatch[1] + '" imported by "' + mainFile + '".');
        }
        const moduleContent = host.read(moduleFile).toString();
        const moduleImports = readNamedImports(moduleContent);
        const bootstrapMatch = moduleContent.match(/bootstrap\s*:\s*\[\s*(\w+)/);
        if (!bootstrapMatch) {
            throw new schematics_1.SchematicsException('Cannot find the "bootstrap" component in "' + moduleFile + '".');
        }
        const componentFile = resolveTsFile(host, moduleFile, moduleImports[bootstrapMatch[1]] || '');
        if (!componentFile) {
            throw new schematics_1.SchematicsException('Cannot resolve root component "' + bootstrapMatch[1] + '" imported by "' + moduleFile + '".');
        }
        const routingSpecifier = Object.keys(moduleImports)
            .map((symbol) => ({ symbol, specifier: moduleImports[symbol] }))
            .filter((entry) => /routing/i.test(entry.specifier))[0];
        return {
            projectName,
            appDir,
            mainFile,
            architecture: 'classic',
            rootComponent: readRootComponent(host, componentFile, bootstrapMatch[1]),
            moduleFile,
            moduleClass: classicMatch[1],
            routingModuleFile: routingSpecifier
                ? resolveTsFile(host, moduleFile, routingSpecifier.specifier)
                : null,
            dashNaming: /-module\.ts$/.test(moduleFile),
        };
    }
    throw new schematics_1.SchematicsException('Cannot detect the application architecture from "' + mainFile +
        '": neither bootstrapApplication(...) nor bootstrapModule(...) found.');
}
function readRootComponent(host, file, className) {
    const content = host.read(file).toString();
    const templateMatch = content.match(/templateUrl\s*:\s*['"]([^'"]+)['"]/);
    return {
        file,
        className,
        templateFile: templateMatch ? joinPath(dirname(file), templateMatch[1]) : null,
    };
}
function resolveArchitecture(requested, detected) {
    if (!requested || requested === 'auto') {
        return detected;
    }
    if (requested !== detected) {
        throw new schematics_1.SchematicsException('Requested --architecture=' + requested + ' but the target application is ' + detected +
            ' (' + (detected === 'standalone' ? 'bootstrapApplication' : 'bootstrapModule') +
            '). Create the app with "ng new --standalone=' + (requested === 'standalone') +
            '" or omit --architecture to auto-detect it.');
    }
    return detected;
}
