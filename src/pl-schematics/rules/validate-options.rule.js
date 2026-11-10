"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOptions = validateOptions;
const normalize_options_rule_1 = require("./normalize-options.rule");
function validateOptions(options) {
    return (host, context) => {
        (0, normalize_options_rule_1.validateNamePackage)(options.namePackage);
        if (options.http === 'interceptor-functional' && !options.standalone) {
            context.logger.info('http=interceptor-functional on a classic (NgModule) app: the interceptor is registered through HTTP_INTERCEPTORS (class based); the functional form is used on standalone apps.');
        }
        return host;
    };
}
