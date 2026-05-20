"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_utils_1 = require("../utils/json.utils");
function updatePackageJsonForSonar() {
    return (host, context) => {
        const packageJson = json_utils_1.readJsonFile(host, "package.json");
        if (!packageJson) {
            return host;
        }
        packageJson.scripts = packageJson.scripts || {};
        packageJson.scripts.sonar = "sonar-scanner";
        json_utils_1.overwriteJsonFile(host, "package.json", packageJson);
        context.logger.info("Added npm script: sonar.");
        return host;
    };
}
exports.updatePackageJsonForSonar = updatePackageJsonForSonar;
function updatePackageJsonForBuild(options) {
    return (host, context) => {
        const packageJson = json_utils_1.readJsonFile(host, "package.json");
        if (!packageJson) {
            return host;
        }
        packageJson.scripts = packageJson.scripts || {};
        delete packageJson.scripts.build;
        if (options.mockApi === "node-express") {
            packageJson.scripts["mock-api"] =
                "cd mock-api && npm install && npm run start";
        }
        packageJson.scripts["build-dev"] = "ng build";
        packageJson.scripts["build-prod"] =
            "ng build --lazyModules --aot --prod --source-map=false";
        packageJson.scripts.typedoc =
            "compodoc -d pl-schematics/document/schematics -p tsconfig.json -s -n Portable-Schematics --theme Postmark --disablePrivate --disableCoverage";
        packageJson.author =
            (options.nameCompany || "mycompany") + " template by @l.piciollo";
        packageJson.description =
            (options.nameCompany || "mycompany") + " project for client";
        packageJson.scripts = packageJson.scripts || {};
        packageJson.scripts["deps:check"] =
            "node tools/check-dependencies-on-install.js";
        packageJson.scripts["deps:update"] =
            "node tools/check-dependencies-on-install.js && npm install";
        appendScript(packageJson.scripts, "postinstall", "node tools/check-dependencies-on-install.js");
        json_utils_1.overwriteJsonFile(host, "package.json", packageJson);
        context.logger.info("Updated package.json build scripts.");
        return host;
    };
    function appendScript(scripts, name, command) {
        if (!scripts[name]) {
            scripts[name] = command;
            return;
        }
        if (scripts[name].indexOf(command) >= 0) {
            return;
        }
        scripts[name] = scripts[name] + " && " + command;
    }
}
exports.updatePackageJsonForBuild = updatePackageJsonForBuild;
