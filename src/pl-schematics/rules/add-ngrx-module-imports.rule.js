"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNgrxModuleImports = void 0;
const schematics_1 = require("@angular-devkit/schematics");
function addNgrxModuleImports(options) {
    if (options.state !== 'ngrx') {
        return (0, schematics_1.noop)();
    }
    return (0, schematics_1.noop)();
}
exports.addNgrxModuleImports = addNgrxModuleImports;
