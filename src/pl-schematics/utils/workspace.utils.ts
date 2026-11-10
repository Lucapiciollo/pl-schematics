// src/pl-schematics/utils/workspace.utils.ts

import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { JsonObject, readJsonFile } from './json.utils';
import { PlSchematicsOptions } from '../types/schema-options';

export function getDefaultProjectName(
  workspaceJson: JsonObject,
  options: PlSchematicsOptions,
): string {
  if (options.project) {
    return options.project;
  }

  if (workspaceJson.defaultProject) {
    return workspaceJson.defaultProject;
  }

  const projects = workspaceJson.projects || {};
  const projectNames = Object.keys(projects);

  if (!projectNames.length) {
    throw new SchematicsException('No project found inside angular.json');
  }

  // Preferisce il primo progetto di tipo application (una libreria non ha un
  // main.ts / app.config.ts su cui innestare il pattern).
  const application = projectNames.filter(
    (name) => projects[name] && projects[name].projectType === 'application',
  )[0];

  return application || projectNames[0];
}

export function getProjectObject(
  workspaceJson: JsonObject,
  options: PlSchematicsOptions,
): JsonObject {
  const projectName = getDefaultProjectName(workspaceJson, options);

  const projects = workspaceJson.projects || {};
  const project = projects[projectName];

  if (!project) {
    throw new SchematicsException('Project "' + projectName + '" not found inside angular.json');
  }

  return project;
}

/**
 * Equivalente locale di `buildDefaultPath` (ex schematics-utilities):
 * <sourceRoot>/app per le applicazioni, <sourceRoot>/lib per le librerie.
 */
export function buildDefaultPath(project: JsonObject): string {
  const root = project.sourceRoot
    ? '/' + project.sourceRoot
    : (project.root ? '/' + project.root : '') + '/src';
  const projectDirName = project.projectType === 'application' ? 'app' : 'lib';

  return (root + '/' + projectDirName).replace(/\/+/g, '/').replace(/^\//, '');
}

export function getProjectDefaultPath(
  host: Tree,
  options: PlSchematicsOptions,
): string | null {
  const workspaceJson = readJsonFile(host, 'angular.json');

  if (!workspaceJson) {
    return null;
  }

  return buildDefaultPath(getProjectObject(workspaceJson, options));
}

export function getBuildOptions(project: JsonObject): JsonObject {
  const target =
    (project.architect && project.architect.build) ||
    (project.targets && project.targets.build);

  return (target && target.options) || {};
}

/**
 * Normalizza un path del Tree: separatori '/', niente './' iniziali.
 */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+/g, '/');
}

function dirname(path: string): string {
  const p = normalizePath(path);
  const idx = p.lastIndexOf('/');

  return idx < 0 ? '' : p.substring(0, idx);
}

function joinPath(dir: string, rel: string): string {
  const parts = (dir ? dir.split('/') : []).concat(rel.split('/'));
  const out: string[] = [];

  parts.forEach((part) => {
    if (part === '' || part === '.') {
      return;
    }

    if (part === '..') {
      out.pop();
    } else {
      out.push(part);
    }
  });

  return out.join('/');
}

function resolveTsFile(host: Tree, fromFile: string, specifier: string): string | null {
  if (specifier.charAt(0) !== '.') {
    return null;
  }

  const base = joinPath(dirname(fromFile), specifier);

  return [base + '.ts', base + '/index.ts'].filter((candidate) => host.exists(candidate))[0] || null;
}

/** Mappa nome simbolo -> specifier, dagli import nominali del file. */
function readNamedImports(content: string): Record<string, string> {
  const map: Record<string, string> = {};
  const regex = /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    match[1].split(',').forEach((entry) => {
      const parts = entry.trim().split(/\s+as\s+/);
      const local = (parts[1] || parts[0]).trim();

      if (local) {
        map[local] = match![2];
      }
    });
  }

  return map;
}

export type PlArchitecture = 'classic' | 'standalone';

export interface RootComponentInfo {
  /** Path del file .ts del componente root (es. src/app/app.ts o src/app/app.component.ts). */
  file: string;
  className: string;
  /** Path del template HTML (templateUrl), null se il template e' inline. */
  templateFile: string | null;
}

export interface AppInfo {
  projectName: string;
  /** Es. src/app */
  appDir: string;
  mainFile: string;
  architecture: PlArchitecture;
  rootComponent: RootComponentInfo;
  /** Solo classic. */
  moduleFile?: string;
  moduleClass?: string;
  routingModuleFile?: string | null;
  /** true se la convenzione dei nomi e' 'app-module.ts' (Angular >= 20), false se 'app.module.ts'. */
  dashNaming?: boolean;
  /** Solo standalone. */
  configFile?: string;
  routesFile?: string;
}

/**
 * @author l.piciollo
 * Rileva se il progetto target e' una app classic (NgModule, bootstrapModule)
 * o standalone (bootstrapApplication) leggendo main.ts, e individua i file
 * reali (Angular >= 20 usa app.ts/app-module.ts, Angular 19 app.component.ts/
 * app.module.ts). Se il progetto non e' riconoscibile lancia un errore chiaro
 * invece di generare file inutilizzati.
 */
export function detectApp(host: Tree, options: PlSchematicsOptions): AppInfo {
  const workspaceJson = readJsonFile(host, 'angular.json');

  if (!workspaceJson) {
    throw new SchematicsException('angular.json not found: run the schematic inside an Angular CLI workspace.');
  }

  const projectName = getDefaultProjectName(workspaceJson, options);
  const project = getProjectObject(workspaceJson, options);

  if (project.projectType && project.projectType !== 'application') {
    throw new SchematicsException(
      'Project "' + projectName + '" is a "' + project.projectType + '": pl-schematics must target an application project (use --project).',
    );
  }

  const appDir = buildDefaultPath(project);
  const buildOptions = getBuildOptions(project);
  const mainFile = normalizePath(
    buildOptions.browser || buildOptions.main || ((project.sourceRoot || 'src') + '/main.ts'),
  );

  const mainBuffer = host.read(mainFile);

  if (!mainBuffer) {
    throw new SchematicsException('Application entry point "' + mainFile + '" not found for project "' + projectName + '".');
  }

  const mainContent = mainBuffer.toString();
  const mainImports = readNamedImports(mainContent);

  const standaloneMatch = mainContent.match(/bootstrapApplication\(\s*(\w+)\s*(?:,\s*(\w+))?/);
  const classicMatch = mainContent.match(/bootstrapModule\(\s*(\w+)/);

  if (standaloneMatch) {
    const componentFile = resolveTsFile(host, mainFile, mainImports[standaloneMatch[1]] || '');

    if (!componentFile) {
      throw new SchematicsException('Cannot resolve root component "' + standaloneMatch[1] + '" imported by "' + mainFile + '".');
    }

    const configIdentifier = standaloneMatch[2];
    const configFile = configIdentifier
      ? resolveTsFile(host, mainFile, mainImports[configIdentifier] || '')
      : null;

    return {
      projectName,
      appDir,
      mainFile,
      architecture: 'standalone',
      rootComponent: readRootComponent(host, componentFile, standaloneMatch[1]),
      configFile: configFile || appDir + '/app.config.ts',
      routesFile: appDir + '/app.routes.ts',
    };
  }

  if (classicMatch) {
    const moduleFile = resolveTsFile(host, mainFile, mainImports[classicMatch[1]] || '');

    if (!moduleFile) {
      throw new SchematicsException('Cannot resolve root module "' + classicMatch[1] + '" imported by "' + mainFile + '".');
    }

    const moduleContent = host.read(moduleFile)!.toString();
    const moduleImports = readNamedImports(moduleContent);
    const bootstrapMatch = moduleContent.match(/bootstrap\s*:\s*\[\s*(\w+)/);

    if (!bootstrapMatch) {
      throw new SchematicsException('Cannot find the "bootstrap" component in "' + moduleFile + '".');
    }

    const componentFile = resolveTsFile(host, moduleFile, moduleImports[bootstrapMatch[1]] || '');

    if (!componentFile) {
      throw new SchematicsException('Cannot resolve root component "' + bootstrapMatch[1] + '" imported by "' + moduleFile + '".');
    }

    const routingSpecifier = Object.keys(moduleImports)
      .map((symbol) => ({ symbol, specifier: moduleImports[symbol] }))
      .filter((entry) => /routing/i.test(entry.specifier))[0];

    return {
      projectName,
      appDir,
      mainFile,
      architecture: 'classic',
      rootComponent: readRootComponent(host, componentFile, bootstrapMatch[1]),
      moduleFile,
      moduleClass: classicMatch[1],
      routingModuleFile: routingSpecifier
        ? resolveTsFile(host, moduleFile, routingSpecifier.specifier)
        : null,
      dashNaming: /-module\.ts$/.test(moduleFile),
    };
  }

  throw new SchematicsException(
    'Cannot detect the application architecture from "' + mainFile +
      '": neither bootstrapApplication(...) nor bootstrapModule(...) found.',
  );
}

function readRootComponent(host: Tree, file: string, className: string): RootComponentInfo {
  const content = host.read(file)!.toString();
  const templateMatch = content.match(/templateUrl\s*:\s*['"]([^'"]+)['"]/);

  return {
    file,
    className,
    templateFile: templateMatch ? joinPath(dirname(file), templateMatch[1]) : null,
  };
}

/**
 * Risolve l'architettura effettiva: 'classic' | 'standalone' richiesta
 * dall'utente (opzione --architecture) confrontata con quella rilevata nel
 * progetto. In caso di mismatch lancia un errore chiaro (nessun file inutilizzato).
 */
export function resolveArchitecture(
  requested: string | undefined,
  detected: PlArchitecture,
): PlArchitecture {
  if (!requested || requested === 'auto') {
    return detected;
  }

  if (requested !== detected) {
    throw new SchematicsException(
      'Requested --architecture=' + requested + ' but the target application is ' + detected +
        ' (' + (detected === 'standalone' ? 'bootstrapApplication' : 'bootstrapModule') +
        '). Create the app with "ng new --standalone=' + (requested === 'standalone') +
        '" or omit --architecture to auto-detect it.',
    );
  }

  return detected;
}
