"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSharedLibrary = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const add_library_class_rule_1 = require("./add-library-class.rule");
const library_utils_1 = require("../utils/library.utils");
function hasHttpInterceptor(options) {
    return (options.http === 'interceptor-classic' ||
        options.http === 'interceptor-functional');
}
function hasMaterial(options) {
    return options.ui === 'material';
}
function hasAdvancedLogging(options) {
    return options.logging === 'advanced';
}
function addSharedLibrary(options) {
    const libName = options.sharedLibName;
    const libRoot = (0, library_utils_1.getLibraryRoot)(libName);
    const libSrcDir = (0, library_utils_1.getLibrarySourceDir)(libName);
    const libSourceRoot = (0, library_utils_1.getLibrarySourceRoot)(libName);
    return (0, schematics_1.chain)([
        (0, library_utils_1.registerLibrary)(options, libName),
        (0, add_library_class_rule_1.addLibraryClass)(options, './files/shared-lib-scaffold', libRoot),
        (0, add_library_class_rule_1.addLibraryClass)(options, './files/shared-lib-entrypoint', libSrcDir),
        (0, add_library_class_rule_1.addLibraryClass)(options, './files/shared-lib/module', libSourceRoot + '/module'),
        (0, add_library_class_rule_1.addLibraryClass)(options, './files/shared-lib/pipe', libSourceRoot + '/pipe'),
        (0, add_library_class_rule_1.addLibraryClass)(options, './files/shared-lib/utils', libSourceRoot + '/utils'),
        (0, add_library_class_rule_1.addLibraryClass)(options, './files/shared-lib/bean', libSourceRoot + '/bean'),
        (0, add_library_class_rule_1.addLibraryClass)(options, './files/shared-lib/tokens', libSourceRoot + '/tokens'),
        hasAdvancedLogging(options)
            ? (0, add_library_class_rule_1.addLibraryClass)(options, './files/shared-lib/logging', libSourceRoot + '/logging')
            : (0, schematics_1.noop)(),
        hasHttpInterceptor(options)
            ? (0, schematics_1.chain)([
                (0, add_library_class_rule_1.addLibraryClass)(options, './files/shared-lib/http', libSourceRoot + '/http'),
                (0, add_library_class_rule_1.addLibraryClass)(options, './files/shared-lib/interceptor', libSourceRoot + '/interceptor'),
            ])
            : (0, schematics_1.noop)(),
        hasMaterial(options)
            ? (0, add_library_class_rule_1.addLibraryClass)(options, './files/shared-lib/material', libSourceRoot + '/material')
            : (0, schematics_1.noop)(),
    ]);
}
exports.addSharedLibrary = addSharedLibrary;
