"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const add_module_to_imports_rule_1 = require("./add-module-to-imports.rule");
function addRootModuleImports(options) {
    return schematics_1.chain([
        add_module_to_imports_rule_1.addModuleToImports(options, (options.prefixClass || '') + 'InitializerModule', './' + options.namePackage + '/core/module/initializer.module'),
        add_module_to_imports_rule_1.addModuleToImports(options, 'SharedModule', './' + options.namePackage + '/shared/module/shared.module'),
        add_module_to_imports_rule_1.addModuleToImports(options, 'AppRoutingModule', './app-routing.module'),
    ]);
}
exports.addRootModuleImports = addRootModuleImports;
