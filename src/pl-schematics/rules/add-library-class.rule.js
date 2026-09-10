"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLibraryClass = void 0;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
function addLibraryClass(options, urlFile, libraryRootDestPath) {
    return (_host, context) => {
        const sourceTemplate = (0, schematics_1.url)(urlFile);
        const source = (0, schematics_1.apply)(sourceTemplate, [
            (0, schematics_1.template)(Object.assign(Object.assign(Object.assign({}, options), { name: options.namePackage }), core_1.strings)),
            (0, schematics_1.move)(libraryRootDestPath),
        ]);
        context.logger.info('Library class created from: "' + urlFile + '" into "' + libraryRootDestPath + '"');
        return (0, schematics_1.mergeWith)(source, schematics_1.MergeStrategy.Overwrite);
    };
}
exports.addLibraryClass = addLibraryClass;
