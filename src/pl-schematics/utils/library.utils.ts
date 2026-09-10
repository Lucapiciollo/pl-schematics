// src/pl-schematics/utils/library.utils.ts

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { PlSchematicsOptions } from '../types/schema-options';
import { overwriteJsonFile, readJsonFile } from './json.utils';

/**
 * @author l.piciollo
 * Percorso radice (root) di un progetto libreria generato dallo schematic,
 * relativo alla radice del workspace Angular. Segue la convenzione standard
 * di Angular CLI: projects/<libName>.
 */
export function getLibraryRoot(libName: string): string {
  return 'projects/' + libName;
}

/**
 * @author l.piciollo
 * Percorso della cartella sorgente (src/lib) di una libreria, dove viene
 * copiato tutto il contenuto condiviso (moduli, pipe, servizi, ecc.).
 */
export function getLibrarySourceRoot(libName: string): string {
  return getLibraryRoot(libName) + '/src/lib';
}

/**
 * @author l.piciollo
 * Percorso della cartella 'src' di una libreria (un livello sopra 'src/lib'),
 * dove risiede il file di entry point pubblico (public-api.ts).
 */
export function getLibrarySourceDir(libName: string): string {
  return getLibraryRoot(libName) + '/src';
}

/**
 * @author l.piciollo
 * Registra un nuovo progetto di tipo 'library' in angular.json, con builder
 * ng-packagr. Non sovrascrive un progetto gia' presente con lo stesso nome
 * (idempotente, utile se lo schematic viene rieseguito).
 */
export function addLibraryProjectToWorkspace(
  host: Tree,
  context: SchematicContext,
  libName: string,
  prefix: string,
): void {
  const workspaceJson = readJsonFile(host, 'angular.json');

  if (!workspaceJson) {
    context.logger.warn(
      'angular.json not found. Skipping library project registration for "' +
        libName +
        '".',
    );

    return;
  }

  workspaceJson.projects = workspaceJson.projects || {};

  if (workspaceJson.projects[libName]) {
    context.logger.info(
      'Library project "' + libName + '" already present in angular.json.',
    );

    return;
  }

  const projectRoot = getLibraryRoot(libName);

  workspaceJson.projects[libName] = {
    projectType: 'library',
    root: projectRoot,
    sourceRoot: projectRoot + '/src',
    prefix: prefix || 'lib',
    architect: {
      build: {
        builder: '@angular-devkit/build-angular:ng-packagr',
        options: {
          tsConfig: projectRoot + '/tsconfig.lib.json',
          project: projectRoot + '/ng-package.json',
        },
        configurations: {
          production: {
            tsConfig: projectRoot + '/tsconfig.lib.prod.json',
          },
          development: {
            tsConfig: projectRoot + '/tsconfig.lib.json',
          },
        },
        defaultConfiguration: 'production',
      },
    },
  };

  overwriteJsonFile(host, 'angular.json', workspaceJson);

  context.logger.info(
    'Library project "' + libName + '" registered in angular.json.',
  );
}

/**
 * @author l.piciollo
 * Aggiunge il path mapping in tsconfig.json (root del workspace) in modo che
 * la libreria sia importabile con uno specifier semplice (es. 'my-app-shared')
 * invece di un percorso relativo. Punta direttamente al sorgente (public-api.ts)
 * e non a dist/, cosi' non e' necessario compilare la libreria separatamente
 * prima di poter avviare 'ng serve' in sviluppo.
 */
export function addLibraryTsConfigPath(
  host: Tree,
  context: SchematicContext,
  libName: string,
): void {
  const tsConfigPath = 'tsconfig.json';
  const tsConfig = readJsonFile(host, tsConfigPath);

  if (!tsConfig) {
    context.logger.warn(
      'tsconfig.json not found. Skipping path mapping for library "' +
        libName +
        '".',
    );

    return;
  }

  tsConfig.compilerOptions = tsConfig.compilerOptions || {};
  tsConfig.compilerOptions.paths = tsConfig.compilerOptions.paths || {};

  const entryPoint = getLibraryRoot(libName) + '/src/public-api.ts';

  if (!tsConfig.compilerOptions.paths[libName]) {
    tsConfig.compilerOptions.paths[libName] = [entryPoint];
  }

  overwriteJsonFile(host, tsConfigPath, tsConfig);

  context.logger.info(
    'Path mapping "' + libName + '" -> "' + entryPoint + '" added to tsconfig.json.',
  );
}

/**
 * @author l.piciollo
 * Rule di comodo che combina registrazione angular.json + path mapping tsconfig
 * per una libreria. Va richiamata PRIMA di copiare i file sorgente della libreria,
 * cosi' che le rule successive (build package.json, ecc.) trovino il progetto gia'
 * presente.
 */
export function registerLibrary(
  options: PlSchematicsOptions,
  libName: string,
): Rule {
  return (host: Tree, context: SchematicContext) => {
    addLibraryProjectToWorkspace(host, context, libName, options.prefix || 'lib');
    addLibraryTsConfigPath(host, context, libName);

    return host;
  };
}
