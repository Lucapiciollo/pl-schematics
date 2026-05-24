import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { PlSchematicsOptions } from '../types/schema-options';
import { overwriteJsonFile, readJsonFile } from '../utils/json.utils';

function ensureScripts(packageJson: any): Record<string, string> {
  packageJson.scripts = packageJson.scripts || {};
  return packageJson.scripts;
}

function appendScript(
  scripts: Record<string, string>,
  name: string,
  command: string,
): void {
  if (!scripts[name]) {
    scripts[name] = command;
    return;
  }

  if (scripts[name].indexOf(command) >= 0) {
    return;
  }

  scripts[name] = scripts[name] + ' && ' + command;
}

function setScriptIfMissing(
  scripts: Record<string, string>,
  name: string,
  command: string,
): void {
  if (!scripts[name]) {
    scripts[name] = command;
  }
}

function upsertScript(
  scripts: Record<string, string>,
  name: string,
  command: string,
): void {
  scripts[name] = command;
}

export function updatePackageJsonForSonar(): Rule {
  return (host: Tree, context: SchematicContext) => {
    const packageJson = readJsonFile(host, 'package.json');

    if (!packageJson) {
      context.logger.warn('package.json not found. Skipping Sonar script.');
      return host;
    }

    const scripts = ensureScripts(packageJson);

    upsertScript(
      scripts,
      'sonar',
      'sonar-scanner',
    );

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
      context.logger.warn('package.json not found. Skipping package scripts update.');
      return host;
    }

    const scripts = ensureScripts(packageJson);

    /**
     * Build scripts legacy/comuni.
     */
    setScriptIfMissing(
      scripts,
      'build-dev',
      'ng build',
    );

    setScriptIfMissing(
      scripts,
      'build-prod',
      'ng build --configuration production',
    );

    /**
     * Documentazione opzionale.
     * Lo script resta disponibile, ma i file documentazione vengono copiati
     * solo se includeDocumentation === true.
     */
    setScriptIfMissing(
      scripts,
      'typedoc',
      'compodoc -d pl-schematics/document/schematics -p tsconfig.json -s -n Portable-Schematics --theme Postmark --disablePrivate --disableCoverage',
    );

    /**
     * Mock API Node/Express.
     */
    if (options.mockApi === 'node-express') {
      upsertScript(
        scripts,
        'mock-api',
        'cd mock-api && npm install && npm run start',
      );
    }

    /**
     * Dependency updater interattivo.
     */
    upsertScript(
      scripts,
      'deps:check',
      'node tools/check-dependencies-on-install.js',
    );

    upsertScript(
      scripts,
      'deps:update',
      'node tools/check-dependencies-on-install.js && npm install',
    );

    appendScript(
      scripts,
      'postinstall',
      'node tools/check-dependencies-on-install.js',
    );

    /**
     * Script utili se si usa GitHub Actions o Azure DevOps.
     */
    if (options.ci === 'github-actions' || options.ci === 'azure-devops') {
      setScriptIfMissing(
        scripts,
        'ci:install',
        'npm ci',
      );

      setScriptIfMissing(
        scripts,
        'ci:build',
        'npm run build-prod',
      );

      if (options.tests !== 'none') {
        setScriptIfMissing(
          scripts,
          'ci:test',
          'npm test -- --watch=false --browsers=ChromeHeadless',
        );
      }
    }

    overwriteJsonFile(host, 'package.json', packageJson);

    context.logger.info('Updated package.json build scripts.');

    return host;
  };
}