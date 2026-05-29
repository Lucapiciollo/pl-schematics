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

export function normalizeOptions(options: PlSchematicsOptions): Rule {
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

    context.logger.info(
      'Options normalized for project: "' + options.project + '"',
    );

    return host;
  };
}