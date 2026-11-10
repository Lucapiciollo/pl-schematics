"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAngularJsonForBudgets = updateAngularJsonForBudgets;
const json_utils_1 = require("../utils/json.utils");
const workspace_utils_1 = require("../utils/workspace.utils");
function updateAngularJsonForBudgets(options) {
    return (host, context) => {
        const workspaceJson = (0, json_utils_1.readJsonFile)(host, 'angular.json');
        if (!workspaceJson) {
            return host;
        }
        const project = (0, workspace_utils_1.getProjectObject)(workspaceJson, options);
        const production = project.architect &&
            project.architect.build &&
            project.architect.build.configurations &&
            project.architect.build.configurations.production;
        if (!production || !Array.isArray(production.budgets)) {
            return host;
        }
        let changed = false;
        production.budgets.forEach((budget) => {
            if (budget && budget.type === 'initial') {
                if (budget.maximumWarning !== '3MB' || budget.maximumError !== '5MB') {
                    budget.maximumWarning = '3MB';
                    budget.maximumError = '5MB';
                    changed = true;
                }
            }
        });
        if (changed) {
            (0, json_utils_1.overwriteJsonFile)(host, 'angular.json', workspaceJson);
            context.logger.info('Raised the "initial" bundle budget to 3MB/5MB in angular.json.');
        }
        return host;
    };
}
