"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_utils_1 = require("../utils/json.utils");
const workspace_utils_1 = require("../utils/workspace.utils");
function getPrefixFromAngularJson(options) {
    return (host, context) => {
        const workspaceJson = json_utils_1.readJsonFile(host, 'angular.json');
        if (!workspaceJson) {
            return host;
        }
        const projectObject = workspace_utils_1.getProjectObject(workspaceJson, options);
        options.prefix = projectObject.prefix || '';
        context.logger.info('Finding prefix: "' + options.prefix + '"');
        return host;
    };
}
exports.getPrefixFromAngularJson = getPrefixFromAngularJson;
