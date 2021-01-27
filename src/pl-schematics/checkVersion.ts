import { Rule, SchematicContext, Tree } from "@angular-devkit/schematics";

var shell = require('shelljs');



export function check(obj: any): Rule {
    return (host: Tree, context: SchematicContext) => {

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                var cmd = `npm view ${key} versions`;
                let output = shell.exec(cmd, { silent: true });
                if (output.code === 0) {
                    var outStrArray = output.stdout.split("'");
                    for (let i = outStrArray.length - 2; i >= 0; i = i - 2) {
                        const version = outStrArray[i];
                        if (version.indexOf('-') < 0) {
                            console.info('\u001b[1m\u001b[31m *** ' + "ATTENZIONE L'ULTIMA VERSIONE DISPONIBILE PER LA PL-CORE-UTILS-LIBRARY E' LA: " + version + " ***\u001b[39;49m\u001b[22m")
                            console.info('\u001b[1m\u001b[37;101m ' + "ESEGUIRE IL COMANDO 'npm i pl-core-utils-library@^" + version + "' SE LO SI RITIENE OPPORTUNO!\u001b[39;49m\u001b[22m")
                            obj[key] = version;
                            break;
                        }
                    }
                } else {
                    console.error('error updating ' + key + ' version. aborting');
                    process.exit(-1);
                }
            }
        }
        context.logger.log('info', `check executed `);
        return host;
    }



}



/* parseDeps({ "pl-core-utils-library": "^1.5.2" }); */