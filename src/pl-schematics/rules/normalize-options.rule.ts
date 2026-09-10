import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { PlSchematicsOptions } from '../types/schema-options';
import { readJsonFile } from '../utils/json.utils';

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

  return normalized === 'true' ||
    normalized === 'y' ||
    normalized === 'yes' ||
    normalized === 's' ||
    normalized === 'si' ||
    normalized === 'sì' ||
    normalized === '1';
}

function normalizeYesNo(value: unknown): 'Y' | 'N' {
  if (value === true) {
    return 'Y';
  }

  if (value === false) {
    return 'N';
  }

  const normalized = String(value || '').toUpperCase();

  return normalized === 'Y' ||
    normalized === 'YES' ||
    normalized === 'TRUE' ||
    normalized === '1' ||
    normalized === 'S' ||
    normalized === 'SI' ||
    normalized === 'SÌ'
    ? 'Y'
    : 'N';
}

function normalizeOptionValue(
  value: string | undefined,
  defaultValue: string,
  allowedValues: string[],
): string {
  const normalized = normalizeString(value, defaultValue);

  return allowedValues.indexOf(normalized) >= 0
    ? normalized
    : defaultValue;
}

function getDefaultProjectName(host: Tree): string {
  const workspace = readJsonFile(host, 'angular.json');

  if (!workspace || !workspace.projects) {
    return '';
  }

  if (workspace.defaultProject) {
    return workspace.defaultProject;
  }

  const projectNames = Object.keys(workspace.projects);

  return projectNames.length > 0 ? projectNames[0] : '';
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
 * Normalizza tutte le opzioni che NON richiedono accesso al Tree (angular.json),
 * cioe' tutte tranne 'project'/'prefix'. E' FONDAMENTALE che questa funzione sia
 * sincrona e venga chiamata PRIMA di costruire l'array passato a chain([...]) in
 * index.ts: le rule che leggono options in modo sincrono al momento della loro
 * creazione (es. addSharedLibrary/addNgrxLibrary, che leggono options.sharedLibName/
 * options.ngrxLibName; oppure i ternari su options.addSupportBootstrap/
 * options.enableSonarQube in index.ts) vedrebbero altrimenti valori ancora
 * 'undefined' o non normalizzati, perche' una Rule di @angular-devkit/schematics
 * e' "lazy": il suo corpo viene eseguito solo quando il motore esegue davvero la
 * chain, non quando la funzione factory (es. normalizeOptions(options)) viene
 * invocata per costruire l'array.
 */
export function normalizeOptionsSync(options: PlSchematicsOptions): void {
  options.nameCompany = normalizeString(
    options.nameCompany,
    'mycompany',
  );

  options.ui = normalizeOptionValue(
    options.ui as any,
    'none',
    [
      'none',
      'material',
      'bootstrap',
    ],
  ) as any;

  options.state = normalizeOptionValue(
    options.state as any,
    'none',
    [
      'none',
      'ngrx',
    ],
  ) as any;

  options.logging = normalizeOptionValue(
    options.logging as any,
    'console',
    [
      'none',
      'console',
      'advanced',
    ],
  ) as any;

  options.mockApi = normalizeOptionValue(
    options.mockApi as any,
    'none',
    [
      'none',
      'node-express',
    ],
  ) as any;

  options.ci = normalizeOptionValue(
    options.ci as any,
    'none',
    [
      'none',
      'github-actions',
      'azure-devops',
    ],
  ) as any;

  options.http = normalizeOptionValue(
    options.http as any,
    'none',
    [
      'none',
      'interceptor-classic',
      'interceptor-functional',
    ],
  ) as any;

  options.architecture = normalizeOptionValue(
    options.architecture as any,
    'classic',
    [
      'classic',
      'standalone',
    ],
  ) as any;

  options.i18n = normalizeOptionValue(
    options.i18n as any,
    'ngx-translate',
    [
      'none',
      'ngx-translate',
    ],
  ) as any;

  options.tests = normalizeOptionValue(
    options.tests as any,
    'jasmine',
    [
      'none',
      'jasmine',
      'jest',
    ],
  ) as any;

  options.loginSupportConfiguration = normalizeOptionValue(
    options.loginSupportConfiguration as any,
    'NONE',
    [
      'NONE',
      'AZURE-ACTIVE-DIRECT',
    ],
  ) as any;

  /**
   * @author l.piciollo
   * Il supporto MSAL si appoggia al sistema di interceptor HTTP del template (per l'inserimento
   * automatico del token e per lo switch fake/msal in contesto Teams). Se l'utente ha scelto
   * 'Azure Active Directory' come login ma ha disabilitato l'interceptor HTTP ('none'), forziamo
   * l'interceptor classico per evitare un progetto generato che non compila: la decisione se
   * abilitare o meno MSAL resta comunque libera, qui garantiamo solo la coerenza tra le due opzioni.
   */
  if (
    options.loginSupportConfiguration === 'AZURE-ACTIVE-DIRECT' &&
    options.http === 'none'
  ) {
    options.http = 'interceptor-classic' as any;
  }

  /**
   * Necessario perché alcuni template legacy usano ancora browserSupported.
   */
  options.browserSupported = normalizeOptionValue(
    options.browserSupported as any,
    'BROWSER.ALL',
    [
      'BROWSER.ALL',
      'BROWSER.CHROME',
      'BROWSER.FIREFOX',
      'BROWSER.EDGE',
      'BROWSER.SAFARI',
    ],
  ) as any;

  options.includeDocumentation = normalizeBoolean(
    options.includeDocumentation,
  );

  options.strict = normalizeBoolean(
    options.strict,
  );

  options.enableSonarQube = normalizeYesNo(
    options.enableSonarQube as any,
  ) as any;

  /**
   * Bootstrap deriva solo dalla scelta UI.
   */
  if (options.ui === 'bootstrap') {
    options.addSupportBootstrap = 'Y';
  } else {
    options.addSupportBootstrap = 'N';
  }

  /**
   * @author l.piciollo
   * Nomi dei progetti libreria Angular generati dallo schematic ('shared' e, se
   * abilitato, 'ngrx'). Calcolati una sola volta qui cosi' da essere disponibili
   * in modo coerente in tutte le rule e in tutti i template (namePackage e'
   * gia' validato da validateOptions con la regex /^[a-zA-Z0-9-_]+$/, quindi e'
   * gia' un identificatore sicuro da usare in un nome di progetto/percorso).
   */
  const dasherizedPackageName = options.namePackage.toLowerCase();

  options.sharedLibName = dasherizedPackageName + '-shared';
  options.ngrxLibName = dasherizedPackageName + '-ngrx';
}

/**
 * @author l.piciollo
 * Normalizza SOLO 'project'/'prefix', che richiedono di leggere angular.json dal
 * Tree e quindi vanno necessariamente eseguiti come Rule (lazy) dentro la chain,
 * a differenza di normalizeOptionsSync() che va chiamata eager PRIMA della chain.
 */
export function normalizeProjectAndPrefix(options: PlSchematicsOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    const resolvedProject = normalizeString(
      options.project,
      getDefaultProjectName(host),
    );

    options.project = resolvedProject;

    options.prefix = normalizeString(
      options.prefix,
      getProjectPrefix(host, resolvedProject),
    );

    context.logger.info(
      'Options normalized for project: "' + options.project + '"',
    );

    return host;
  };
}