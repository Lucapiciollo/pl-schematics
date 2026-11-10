"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scaffoldSchematics = scaffoldSchematics;
exports.scaffoldLibrarySchematics = scaffoldLibrarySchematics;
const workspace_utils_1 = require("../utils/workspace.utils");
function scaffoldSchematics(options, destPath) {
    return (host, context) => {
        const defaultPath = (0, workspace_utils_1.getProjectDefaultPath)(host, options);
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
function scaffoldLibrarySchematics(libraryAbsoluteDestPath) {
    return (host, context) => {
        const filePath = libraryAbsoluteDestPath + '/.gitkeep';
        if (host.exists(filePath)) {
            context.logger.info('Empty folder already exists: "' + filePath + '"');
            return host;
        }
        host.create(filePath, '');
        context.logger.info('Created empty folder: "' + filePath + '"');
        return host;
    };
}
