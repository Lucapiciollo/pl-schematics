"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOptions = void 0;
function validateOptions(options) {
    return (host, context) => {
        if (!options.namePackage) {
            throw new Error('Option "namePackage" is required.');
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(options.namePackage)) {
            throw new Error('Option "namePackage" can contain only letters, numbers, dash and underscore.');
        }
        if (options.prefixClass && !/^[a-zA-Z0-9_]+$/.test(options.prefixClass)) {
            throw new Error('Option "prefixClass" can contain only letters, numbers and underscore.');
        }
        if (options.architecture === 'standalone' && options.loginSupportConfiguration === 'AZURE-ACTIVE-DIRECT') {
            context.logger.warn('Standalone architecture with legacy Azure MSAL is not fully supported yet. It will be handled in a future rule.');
        }
        if (options.http === 'interceptor-functional' && options.architecture === 'classic') {
            context.logger.warn('Functional interceptor is designed for modern standalone/hybrid Angular. Classic mode will keep compatibility for now.');
        }
        return host;
    };
}
exports.validateOptions = validateOptions;
