"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const scaffold_schematics_rule_1 = require("./scaffold-schematics.rule");
function scaffoldEmptyFolders(options) {
    return schematics_1.chain([
        scaffold_schematics_rule_1.scaffoldSchematics(options, options.namePackage + '/shared/component/footer'),
        scaffold_schematics_rule_1.scaffoldSchematics(options, options.namePackage + '/shared/component/menu'),
        scaffold_schematics_rule_1.scaffoldSchematics(options, options.namePackage + '/shared/component/header'),
        scaffold_schematics_rule_1.scaffoldSchematics(options, options.namePackage + '/component/section/filter'),
        scaffold_schematics_rule_1.scaffoldSchematics(options, options.namePackage + '/component/section/tab'),
        scaffold_schematics_rule_1.scaffoldSchematics(options, options.namePackage + '/shared/config'),
        scaffold_schematics_rule_1.scaffoldSchematics(options, options.namePackage + '/shared/bean'),
        scaffold_schematics_rule_1.scaffoldSchematics(options, options.namePackage + '/shared/directive'),
    ]);
}
exports.scaffoldEmptyFolders = scaffoldEmptyFolders;
