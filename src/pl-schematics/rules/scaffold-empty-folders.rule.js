"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scaffoldEmptyFolders = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const library_utils_1 = require("../utils/library.utils");
const scaffold_schematics_rule_1 = require("./scaffold-schematics.rule");
function scaffoldEmptyFolders(options) {
    const sharedLibSourceRoot = (0, library_utils_1.getLibrarySourceRoot)(options.sharedLibName);
    return (0, schematics_1.chain)([
        (0, scaffold_schematics_rule_1.scaffoldLibrarySchematics)(sharedLibSourceRoot + '/component/footer'),
        (0, scaffold_schematics_rule_1.scaffoldLibrarySchematics)(sharedLibSourceRoot + '/component/menu'),
        (0, scaffold_schematics_rule_1.scaffoldLibrarySchematics)(sharedLibSourceRoot + '/component/header'),
        (0, scaffold_schematics_rule_1.scaffoldLibrarySchematics)(sharedLibSourceRoot + '/config'),
        (0, scaffold_schematics_rule_1.scaffoldLibrarySchematics)(sharedLibSourceRoot + '/directive'),
        (0, scaffold_schematics_rule_1.scaffoldSchematics)(options, options.namePackage + '/component/section/filter'),
        (0, scaffold_schematics_rule_1.scaffoldSchematics)(options, options.namePackage + '/component/section/tab'),
    ]);
}
exports.scaffoldEmptyFolders = scaffoldEmptyFolders;
