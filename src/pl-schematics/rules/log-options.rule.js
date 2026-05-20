"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function logOptions(options) {
    return (host, context) => {
        context.logger.info('PL schematics options:');
        context.logger.info(JSON.stringify(options, null, 2));
        context.logger.info('Include documentation: ' + options.includeDocumentation);
        return host;
    };
}
exports.logOptions = logOptions;
