"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRootModuleImports = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const add_module_to_imports_rule_1 = require("./add-module-to-imports.rule");
function addRootModuleImports(options) {
    return (0, schematics_1.chain)([
        (0, add_module_to_imports_rule_1.addModuleToImports)(options, 'InitializerModule', './' + options.namePackage + '/core/module/initializer.module'),
        (0, add_module_to_imports_rule_1.addModuleToImports)(options, 'SharedModule', './' + options.namePackage + '/shared/module/shared.module'),
        (0, add_module_to_imports_rule_1.addModuleToImports)(options, 'AppRoutingModule', './app-routing.module'),
    ]);
}
exports.addRootModuleImports = addRootModuleImports;
