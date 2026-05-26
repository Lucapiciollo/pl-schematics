"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
function addNgrxModuleImports(options) {
    if (options.state !== 'ngrx') {
        return schematics_1.noop();
    }
    return schematics_1.noop();
}
exports.addNgrxModuleImports = addNgrxModuleImports;
