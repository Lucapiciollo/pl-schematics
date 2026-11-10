"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLibraryClass = addLibraryClass;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
function addLibraryClass(options, urlFile, libraryRootDestPath, skipFiles = []) {
    return (_host, context) => {
        const sourceTemplate = (0, schematics_1.url)(urlFile);
        const source = (0, schematics_1.apply)(sourceTemplate, [
            (0, schematics_1.filter)((path) => !skipFiles.some((skip) => path.endsWith(skip))),
            (0, schematics_1.template)({
                ...options,
                name: options.namePackage,
                ...core_1.strings,
            }),
            (0, schematics_1.move)(libraryRootDestPath),
        ]);
        context.logger.info('Library class created from: "' + urlFile + '" into "' + libraryRootDestPath + '"');
        return (0, schematics_1.mergeWith)(source, schematics_1.MergeStrategy.Overwrite);
    };
}
