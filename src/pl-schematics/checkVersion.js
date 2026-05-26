"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shell = require('shelljs');
function check(obj) {
    return (host, context) => {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                var cmd = `npm view ${key} versions`;
                let output = shell.exec(cmd, { silent: true });
                if (output.code === 0) {
                    var outStrArray = output.stdout.split("'");
                    for (let i = outStrArray.length - 2; i >= 0; i = i - 2) {
                        const version = outStrArray[i];
                        if (version.indexOf('-') < 0) {
                            context.logger.log('info', '\u001b[1m\u001b[31m *** ' + "Attenzione versione disponibile per " + key + " è la: " + version + " eseguire 'npm i " + key + "@" + version + "' se opportuno***\u001b[39;49m\u001b[22m");
                            obj[key] = version;
                            break;
                        }
                    }
                }
                else {
                    console.error('error updating ' + key + ' version. aborting');
                    process.exit(-1);
                }
            }
        }
        context.logger.log('info', `check executed `);
        return host;
    };
}
exports.check = check;
