"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNgrxLibrary = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const add_library_class_rule_1 = require("./add-library-class.rule");
const library_utils_1 = require("../utils/library.utils");
function addNgrxLibrary(options) {
    const libName = options.ngrxLibName;
    const libRoot = (0, library_utils_1.getLibraryRoot)(libName);
    const libSrcDir = (0, library_utils_1.getLibrarySourceDir)(libName);
    const libSourceRoot = (0, library_utils_1.getLibrarySourceRoot)(libName);
    return (0, schematics_1.chain)([
        (0, library_utils_1.registerLibrary)(options, libName),
        (0, add_library_class_rule_1.addLibraryClass)(options, './files/ngrx-lib-scaffold', libRoot),
        (0, add_library_class_rule_1.addLibraryClass)(options, './files/ngrx-lib-entrypoint', libSrcDir),
        (0, add_library_class_rule_1.addLibraryClass)(options, './files/ngrx-lib', libSourceRoot),
    ]);
}
exports.addNgrxLibrary = addNgrxLibrary;
