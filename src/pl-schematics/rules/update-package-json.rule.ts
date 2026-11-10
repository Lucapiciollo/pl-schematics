/**
 * @author l.piciollo
 * Rule della chain di index.ts, in due varianti: updatePackageJsonForSonar (solo se
 * enableSonarQube === 'Y') e updatePackageJsonForBuild, eseguite in sequenza dopo il
 * blocco UI e prima di scaffoldEmptyFolders. Aggiungono/aggiornano gli script npm di
 * package.json.
 */

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { PlSchematicsOptions } from '../types/schema-options';
import { overwriteJsonFile, readJsonFile } from '../utils/json.utils';

/**
 * @author l.piciollo
 * Garantisce l'esistenza dell'oggetto scripts in package.json.
 * @param packageJson  :contenuto di package.json, modificato in place
 * @returns l'oggetto scripts (creato se assente)
 */
function ensureScripts(packageJson: any): Record<string, string> {
  packageJson.scripts = packageJson.scripts || {};
  return packageJson.scripts;
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Aggiunge un comando a uno script: se lo script non esiste lo crea, se contiene gia'
 * il comando non fa nulla, altrimenti lo concatena con ' && '.
 * @param scripts  :oggetto scripts di package.json, modificato in place
 * @param name     :nome dello script npm
 * @param command  :comando da aggiungere
 */
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

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Imposta uno script solo se non e' gia' definito (non sovrascrive quello dell'utente).
 * @param scripts  :oggetto scripts di package.json, modificato in place
 * @param name     :nome dello script npm
 * @param command  :comando da impostare se lo script manca
 */
function setScriptIfMissing(
  scripts: Record<string, string>,
  name: string,
  command: string,
): void {
  if (!scripts[name]) {
    scripts[name] = command;
  }
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Imposta uno script sovrascrivendo l'eventuale valore esistente.
 * @param scripts  :oggetto scripts di package.json, modificato in place
 * @param name     :nome dello script npm
 * @param command  :comando da impostare
 */
function upsertScript(
  scripts: Record<string, string>,
  name: string,
  command: string,
): void {
  scripts[name] = command;
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Aggiunge a package.json lo script npm 'sonar' (sonar-scanner).
 * Se package.json non esiste registra un warning e non modifica nulla.
 * @returns Rule che aggiorna package.json e restituisce il Tree
 */
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

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Aggiorna gli script di package.json: build-dev/build-prod, typedoc, mock-api (se
 * mockApi === 'node-express'), deps:check/deps:update/postinstall per il controllo
 * dipendenze e ci:* (se ci e' GitHub Actions o Azure DevOps).
 * Se package.json non esiste registra un warning e non modifica nulla.
 * @param options  :opzioni normalizzate (mockApi, ci, tests)
 * @returns Rule che aggiorna package.json e restituisce il Tree
 */
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