"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePackageJsonForBuild = exports.updatePackageJsonForSonar = void 0;
const json_utils_1 = require("../utils/json.utils");
function ensureScripts(packageJson) {
    packageJson.scripts = packageJson.scripts || {};
    return packageJson.scripts;
}
function appendScript(scripts, name, command) {
    if (!scripts[name]) {
        scripts[name] = command;
        return;
    }
    if (scripts[name].indexOf(command) >= 0) {
        return;
    }
    scripts[name] = scripts[name] + ' && ' + command;
}
function setScriptIfMissing(scripts, name, command) {
    if (!scripts[name]) {
        scripts[name] = command;
    }
}
function upsertScript(scripts, name, command) {
    scripts[name] = command;
}
function updatePackageJsonForSonar() {
    return (host, context) => {
        const packageJson = (0, json_utils_1.readJsonFile)(host, 'package.json');
        if (!packageJson) {
            context.logger.warn('package.json not found. Skipping Sonar script.');
            return host;
        }
        const scripts = ensureScripts(packageJson);
        upsertScript(scripts, 'sonar', 'sonar-scanner');
        (0, json_utils_1.overwriteJsonFile)(host, 'package.json', packageJson);
        context.logger.info('Added npm script: sonar.');
        return host;
    };
}
exports.updatePackageJsonForSonar = updatePackageJsonForSonar;
function updatePackageJsonForBuild(options) {
    return (host, context) => {
        const packageJson = (0, json_utils_1.readJsonFile)(host, 'package.json');
        if (!packageJson) {
            context.logger.warn('package.json not found. Skipping package scripts update.');
            return host;
        }
        const scripts = ensureScripts(packageJson);
        setScriptIfMissing(scripts, 'build-dev', 'ng build');
        setScriptIfMissing(scripts, 'build-prod', 'ng build --configuration production');
        setScriptIfMissing(scripts, 'typedoc', 'compodoc -d pl-schematics/document/schematics -p tsconfig.json -s -n Portable-Schematics --theme Postmark --disablePrivate --disableCoverage');
        if (options.mockApi === 'node-express') {
            upsertScript(scripts, 'mock-api', 'cd mock-api && npm install && npm run start');
        }
        upsertScript(scripts, 'deps:check', 'node tools/check-dependencies-on-install.js');
        upsertScript(scripts, 'deps:update', 'node tools/check-dependencies-on-install.js && npm install');
        appendScript(scripts, 'postinstall', 'node tools/check-dependencies-on-install.js');
        if (options.ci === 'github-actions' || options.ci === 'azure-devops') {
            setScriptIfMissing(scripts, 'ci:install', 'npm ci');
            setScriptIfMissing(scripts, 'ci:build', 'npm run build-prod');
            if (options.tests !== 'none') {
                setScriptIfMissing(scripts, 'ci:test', 'npm test -- --watch=false --browsers=ChromeHeadless');
            }
        }
        (0, json_utils_1.overwriteJsonFile)(host, 'package.json', packageJson);
        context.logger.info('Updated package.json build scripts.');
        return host;
    };
}
exports.updatePackageJsonForBuild = updatePackageJsonForBuild;
