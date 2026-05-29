"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMaterialModuleImports = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const add_module_to_imports_rule_1 = require("./add-module-to-imports.rule");
function addMaterialModuleImports(options) {
    if (options.ui !== 'material') {
        return (0, schematics_1.noop)();
    }
    return (0, schematics_1.chain)([
        (0, add_module_to_imports_rule_1.addModuleToImports)(options, 'BrowserAnimationsModule', '@angular/platform-browser/animations'),
    ]);
}
exports.addMaterialModuleImports = addMaterialModuleImports;
