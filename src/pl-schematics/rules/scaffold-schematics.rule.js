"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const workspace_utils_1 = require("../utils/workspace.utils");
function scaffoldSchematics(options, destPath) {
    return (host, context) => {
        const defaultPath = workspace_utils_1.getProjectDefaultPath(host, options);
        if (!defaultPath) {
            return host;
        }
        const filePath = defaultPath + '/' + destPath + '/.gitkeep';
        if (host.exists(filePath)) {
            context.logger.info('Empty folder already exists: "' + filePath + '"');
            return host;
        }
        host.create(filePath, '');
        context.logger.info('Created empty folder: "' + filePath + '"');
        return host;
    };
}
exports.scaffoldSchematics = scaffoldSchematics;
