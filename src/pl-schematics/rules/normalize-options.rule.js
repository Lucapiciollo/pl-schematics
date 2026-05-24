"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_utils_1 = require("../utils/json.utils");
const workspace_utils_1 = require("../utils/workspace.utils");
function normalizeOptions(options) {
    return (host, context) => {
        const workspaceJson = json_utils_1.readJsonFile(host, "angular.json");
        if (workspaceJson) {
            options.project = workspace_utils_1.getDefaultProjectName(workspaceJson, options);
        }
        if (!options.namePackage) {
            throw new Error('Option "namePackage" is required.');
        }
        options.includeDocumentation = options.includeDocumentation === true;
        options.architecture = options.architecture || "classic";
        options.state = options.state || "none";
        options.http = options.http || "interceptor-classic";
        if (options.ui === 'bootstrap') {
            options.addSupportBootstrap = 'Y';
        }
        if (options.ui !== 'bootstrap') {
            options.addSupportBootstrap = 'N';
        }
        options.i18n = options.i18n || "ngx-translate";
        options.logging = options.logging || "console";
        options.mockApi = options.mockApi || "none";
        options.ci = options.ci || "none";
        options.tests = options.tests || "jasmine";
        options.strict = options.strict === true;
        context.logger.info('Options normalized for project: "' +
            (options.project || "default") +
            '"');
        return host;
    };
}
exports.normalizeOptions = normalizeOptions;
