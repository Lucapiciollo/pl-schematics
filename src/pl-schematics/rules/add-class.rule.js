"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addClass = void 0;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const workspace_utils_1 = require("../utils/workspace.utils");
function addClass(options, urlFile, destPath) {
    return (host, context) => {
        const defaultPath = (0, workspace_utils_1.getProjectDefaultPath)(host, options);
        if (!defaultPath) {
            return host;
        }
        const sourceTemplate = (0, schematics_1.url)(urlFile);
        const source = (0, schematics_1.apply)(sourceTemplate, [
            (0, schematics_1.template)(Object.assign(Object.assign(Object.assign({}, options), { name: options.namePackage }), core_1.strings)),
            (0, schematics_1.move)(defaultPath + '/' + destPath),
        ]);
        context.logger.info('Class created from: "' + urlFile + '"');
        return (0, schematics_1.mergeWith)(source);
    };
}
exports.addClass = addClass;
