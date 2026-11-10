import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';

import {
  PlArchitectureOption,
  PlBrowserSupported,
  PlCiOption,
  PlHttpOption,
  PlI18nOption,
  PlLoggingOption,
  PlLoginSupportConfiguration,
  PlMockApiOption,
  PlSchematicsOptions,
  PlStateOption,
  PlTestsOption,
  PlUiOption,
} from '../types/schema-options';
import { readJsonFile } from '../utils/json.utils';
import { getAngularVersion } from '../utils/versions.utils';
import { detectApp, getDefaultProjectName, resolveArchitecture } from '../utils/workspace.utils';

function normalizeString(
  value: string | undefined,
  defaultValue: string,
): string {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return String(value);
}

function normalizeBoolean(value: unknown): boolean {
  if (value === true) {
    return true;
  }

  if (value === false) {
    return false;
  }

  const normalized = String(value || '').toLowerCase();

  return ['true', 'y', 'yes', 's', 'si', 'sì', '1'].indexOf(normalized) >= 0;
}

function normalizeYesNo(value: unknown): 'Y' | 'N' {
  return normalizeBoolean(value) ? 'Y' : 'N';
}

function normalizeOptionValue<T extends string>(
  value: string | undefined,
  defaultValue: NoInfer<T>,
  allowedValues: T[],
): T {
  const normalized = normalizeString(value, defaultValue);

  return allowedValues.indexOf(normalized as T) >= 0
    ? (normalized as T)
    : defaultValue;
}

/**
 * @author l.piciollo
 * namePackage: uno o piu' segmenti separati da '/' (es. 'cloud/agic'), ogni
 * segmento composto da lettere, numeri, '-' e '_'. Il percorso viene usato cosi'
 * com'e' per la cartella applicativa (src/app/<namePackage>), mentre i nomi
 * delle librerie derivano da una versione sanitizzata (vedi getLibBaseName).
 */
export const NAME_PACKAGE_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

export function validateNamePackage(namePackage: unknown): string {
  if (typeof namePackage !== 'string' || namePackage.trim() === '') {
    throw new SchematicsException('Option "namePackage" is required.');
  }

  const value = namePackage.trim();
  const segments = value.split('/');

  if (!segments.every((segment) => NAME_PACKAGE_SEGMENT.test(segment))) {
    throw new SchematicsException(
      'Option "namePackage" ("' + value + '") is invalid: use one or more segments separated by "/", ' +
        'each made of letters, numbers, dash and underscore (e.g. "my-app" or "cloud/agic").',
    );
  }

  return value;
}

/**
 * Nome base kebab-case per le librerie: segmenti uniti con '-', minuscolo,
 * '_' -> '-' ('cloud/agic' -> 'cloud-agic', 'My_App' -> 'my-app').
 */
export function getLibBaseName(namePackage: string): string {
  return namePackage
    .split('/')
    .map((segment) => segment.toLowerCase().replace(/_/g, '-'))
    .join('-');
}

function getProjectPrefix(host: Tree, projectName: string): string {
  const workspace = readJsonFile(host, 'angular.json');

  if (
    !workspace ||
    !workspace.projects ||
    !workspace.projects[projectName]
  ) {
    return 'app';
  }

  return workspace.projects[projectName].prefix || 'app';
}

/**
 * @author l.piciollo
 * Normalizza tutte le opzioni che NON richiedono accesso al Tree. E' sincrona e
 * viene invocata PRIMA di costruire qualunque Rule: le factory delle rule
 * leggono i valori derivati (nomi delle librerie, ecc.) al momento della
 * creazione. Le opzioni che dipendono dal workspace (progetto, prefix,
 * architettura, major di Angular) sono risolte da resolveWorkspaceOptions().
 */
export function normalizeOptionsSync(options: PlSchematicsOptions): void {
  options.namePackage = validateNamePackage(options.namePackage);

  options.nameCompany = normalizeString(options.nameCompany, 'mycompany');
  options.ui = normalizeOptionValue<PlUiOption>(options.ui, 'none', ['none', 'material', 'bootstrap']);
  options.state = normalizeOptionValue<PlStateOption>(options.state, 'none', ['none', 'ngrx']);
  options.logging = normalizeOptionValue<PlLoggingOption>(options.logging, 'console', ['none', 'console', 'advanced']);
  options.mockApi = normalizeOptionValue<PlMockApiOption>(options.mockApi, 'none', ['none', 'node-express']);
  options.ci = normalizeOptionValue<PlCiOption>(options.ci, 'none', ['none', 'github-actions', 'azure-devops']);
  options.http = normalizeOptionValue<PlHttpOption>(options.http, 'none', [
    'none',
    'interceptor-classic',
    'interceptor-functional',
  ]);
  options.architecture = normalizeOptionValue<PlArchitectureOption>(options.architecture, 'auto', [
    'auto',
    'classic',
    'standalone',
  ]);
  options.i18n = normalizeOptionValue<PlI18nOption>(options.i18n, 'ngx-translate', ['none', 'ngx-translate']);
  if ((options.tests as string) === 'jest') {
    throw new SchematicsException(
      'Option --tests=jest is not supported: pl-schematics does not generate a Jest setup. Use --tests=jasmine (Angular default test runner: Karma/Jasmine on 19-20, Vitest on 21) or --tests=none.',
    );
  }

  options.tests = normalizeOptionValue<PlTestsOption>(options.tests, 'jasmine', ['none', 'jasmine', 'jest']);
  options.loginSupportConfiguration = normalizeOptionValue<PlLoginSupportConfiguration>(options.loginSupportConfiguration, 'NONE', [
    'NONE',
    'AZURE-ACTIVE-DIRECT',
  ]);

  /**
   * @author l.piciollo
   * Il supporto MSAL si appoggia al sistema di interceptor HTTP del template (per
   * l'inserimento automatico del token e per lo switch fake/msal in contesto
   * Teams). Con login Azure e http 'none' forziamo l'interceptor classico.
   */
  if (options.loginSupportConfiguration === 'AZURE-ACTIVE-DIRECT' && options.http === 'none') {
    options.http = 'interceptor-classic';
  }

  options.browserSupported = normalizeOptionValue<PlBrowserSupported>(options.browserSupported, 'BROWSER.ALL', [
    'BROWSER.ALL',
    'BROWSER.CHROME',
    'BROWSER.FIREFOX',
    'BROWSER.EDGE',
    'BROWSER.SAFARI',
  ]);

  options.includeDocumentation = normalizeBoolean(options.includeDocumentation);
  options.strict = normalizeBoolean(options.strict);
  options.enableSonarQube = normalizeYesNo(options.enableSonarQube);
  options.addSupportBootstrap = options.ui === 'bootstrap' ? 'Y' : 'N';

  /**
   * Nomi delle librerie derivati da una versione sanitizzata di namePackage.
   */
  const libBaseName = getLibBaseName(options.namePackage);
  const segments = options.namePackage.split('/').length;

  options.libBaseName = libBaseName;
  options.sharedLibName = libBaseName + '-shared';
  options.ngrxLibName = libBaseName + '-ngrx';
  options.nsUp = new Array(segments).join('../');
}

/**
 * @author l.piciollo
 * Risolve (leggendo il Tree) progetto, prefix, major di Angular e architettura
 * effettiva (rilevata da main.ts e confrontata con --architecture). Va eseguita
 * come prima Rule della chain; le rule successive vengono costruite DOPO, con le
 * opzioni gia' definitive (vedi index.ts).
 */
export function resolveWorkspaceOptions(host: Tree, options: PlSchematicsOptions, context?: SchematicContext): void {
  const workspace = readJsonFile(host, 'angular.json');

  if (!workspace) {
    throw new SchematicsException('angular.json not found: run the schematic inside an Angular CLI workspace.');
  }

  options.project = normalizeString(options.project, getDefaultProjectName(workspace, options));
  options.prefix = normalizeString(options.prefix, getProjectPrefix(host, options.project));
  const angularVersion = getAngularVersion(host);

  options.angularMajor = angularVersion.major;
  options.angularMinor = angularVersion.minor;

  const app = detectApp(host, options);
  const architecture = resolveArchitecture(options.architecture, app.architecture);

  options.architecture = architecture;
  options.standalone = architecture === 'standalone';
  options.appInfo = app;

  const rootComponentPath = app.rootComponent.file.replace(/\.ts$/, '');
  const relative = rootComponentPath.substring(app.appDir.length + 1);

  options.rootComponentClass = app.rootComponent.className;
  options.rootComponentImport = './' + relative;

  if (context) {
    context.logger.info(
      'Detected Angular ' + options.angularMajor + ' ' + architecture + ' application "' + options.project +
        '" (root component: ' + app.rootComponent.className + ').',
    );
  }
}

/**
 * Rule di compatibilita' storica (rimane per i chiamanti): normalizza solo project/prefix.
 */
export function normalizeProjectAndPrefix(options: PlSchematicsOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    resolveWorkspaceOptions(host, options, context);

    return host;
  };
}
