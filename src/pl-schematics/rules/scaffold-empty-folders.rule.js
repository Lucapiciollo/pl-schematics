"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scaffoldEmptyFolders = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const scaffold_schematics_rule_1 = require("./scaffold-schematics.rule");
function scaffoldEmptyFolders(options) {
    return (0, schematics_1.chain)([
        (0, scaffold_schematics_rule_1.scaffoldSchematics)(options, options.namePackage + '/shared/component/footer'),
        (0, scaffold_schematics_rule_1.scaffoldSchematics)(options, options.namePackage + '/shared/component/menu'),
        (0, scaffold_schematics_rule_1.scaffoldSchematics)(options, options.namePackage + '/shared/component/header'),
        (0, scaffold_schematics_rule_1.scaffoldSchematics)(options, options.namePackage + '/component/section/filter'),
        (0, scaffold_schematics_rule_1.scaffoldSchematics)(options, options.namePackage + '/component/section/tab'),
        (0, scaffold_schematics_rule_1.scaffoldSchematics)(options, options.namePackage + '/shared/config'),
        (0, scaffold_schematics_rule_1.scaffoldSchematics)(options, options.namePackage + '/shared/bean'),
        (0, scaffold_schematics_rule_1.scaffoldSchematics)(options, options.namePackage + '/shared/directive'),
    ]);
}
exports.scaffoldEmptyFolders = scaffoldEmptyFolders;
