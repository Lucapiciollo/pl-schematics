"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const workspace_utils_1 = require("../utils/workspace.utils");
function addClass(options, urlFile, destPath) {
    return (host, context) => {
        const defaultPath = workspace_utils_1.getProjectDefaultPath(host, options);
        if (!defaultPath) {
            return host;
        }
        const sourceTemplate = schematics_1.url(urlFile);
        const source = schematics_1.apply(sourceTemplate, [
            schematics_1.template(Object.assign({}, options, { name: options.namePackage }, core_1.strings)),
            schematics_1.move(defaultPath + '/' + destPath),
        ]);
        context.logger.info('Class created from: "' + urlFile + '"');
        return schematics_1.mergeWith(source);
    };
}
exports.addClass = addClass;
