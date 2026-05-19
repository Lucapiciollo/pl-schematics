// src/pl-schematics/rules/update-package-json.rule.ts

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { overwriteJsonFile, readJsonFile } from '../utils/json.utils';

export function updatePackageJsonForSonar(): Rule {
    return (host: Tree, context: SchematicContext) => {
        const packageJson = readJsonFile(host, 'package.json');

        if (!packageJson) {
            return host;
        }

        packageJson.scripts = packageJson.scripts || {};
        packageJson.scripts.sonar = 'sonar-scanner';

        overwriteJsonFile(host, 'package.json', packageJson);

        context.logger.info('Added npm script: sonar.');

        return host;
    };
}

export function updatePackageJsonForBuild(
    options: PlSchematicsOptions,
): Rule {
    return (host: Tree, context: SchematicContext) => {
        const packageJson = readJsonFile(host, 'package.json');

        if (!packageJson) {
            return host;
        }

        packageJson.scripts = packageJson.scripts || {};

        delete packageJson.scripts.build;

        if (options.mockApi === 'node-express') {
            packageJson.scripts['mock-api'] = 'cd mock-api && npm install && npm run start';
        }
        packageJson.scripts['build-dev'] = 'ng build';
        packageJson.scripts['build-prod'] =
            'ng build --lazyModules --aot --prod --source-map=false';
        packageJson.scripts.typedoc =
            'compodoc -d pl-schematics/document/schematics -p tsconfig.json -s -n Portable-Schematics --theme Postmark --disablePrivate --disableCoverage';

        packageJson.author =
            (options.nameCompany || 'mycompany') + ' template by @l.piciollo';
        packageJson.description =
            (options.nameCompany || 'mycompany') + ' project for client';

        overwriteJsonFile(host, 'package.json', packageJson);

        context.logger.info('Updated package.json build scripts.');

        return host;
    };
}