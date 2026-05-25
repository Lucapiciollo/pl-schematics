"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAdvancedLogging = void 0;
const add_class_rule_1 = require("./add-class.rule");
function addAdvancedLogging(options) {
    return (host, context) => {
        if (options.logging !== 'advanced') {
            context.logger.info('Advanced logging skipped. Current logging option: "' + options.logging + '"');
            return host;
        }
        return (0, add_class_rule_1.addClass)(options, './files/advanced-logging', options.namePackage + '/core/logging/')(host, context);
    };
}
exports.addAdvancedLogging = addAdvancedLogging;
