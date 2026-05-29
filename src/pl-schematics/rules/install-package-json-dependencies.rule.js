"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installPackageJsonDependencies = void 0;
const tasks_1 = require("@angular-devkit/schematics/tasks");
function installPackageJsonDependencies() {
    return (host, context) => {
        context.addTask(new tasks_1.NodePackageInstallTask());
        context.logger.info('Package install scheduled.');
        return host;
    };
}
exports.installPackageJsonDependencies = installPackageJsonDependencies;
