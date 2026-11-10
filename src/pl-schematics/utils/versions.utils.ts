// src/pl-schematics/utils/versions.utils.ts

import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { readJsonFile } from './json.utils';

/**
 * Major di Angular supportate (e verificate dalla matrice `npm run test:e2e`).
 * Nessuna dipendenza usa 'latest': ogni versione e' un range esplicito.
 */
export const SUPPORTED_ANGULAR_MAJORS = [19, 20, 21];

export interface DependencyVersions {
  /** Pacchetti con versionamento allineato ad Angular (ngrx, ng-packagr): ^<major>.0.0. */
  angularAligned: string;
  /**
   * Pacchetti @angular/* con la stessa numerazione di @angular/core (animations, localize; NON material/cdk,
   * che hanno una numerazione di minor/patch indipendente):
   * ^<major>.<minor>.0 dalla versione di core del progetto (evita che npm risolva una minor piu' vecchia
   * con peer pinnati su @angular/common).
   */
  angularFramework: string;
  ngxTranslateCore: string;
  ngxTranslateHttpLoader: string;
  ngxUiLoader: string;
  plCoreUtilsLibrary: string;
  plDecorator: string;
  bootstrap: string;
  popperCore: string;
  ngBootstrap: string;
  jquery: string;
  fontawesome: string;
  msalAngular: string;
  msalBrowser: string;
  graphClient: string;
  sonarScanner: string;
}

/**
 * Tabella delle versioni per major di Angular. I valori coerenti con i peer di
 * pl-core-utils-library 2.1.3 (bootstrap ^5.1.3, pl-decorator ^1.4.x,
 * @compodoc/compodoc ^1.1.19) sono indicati nel README.
 */
/** @ng-bootstrap/ng-bootstrap: 18 -> Angular 19, 19 -> Angular 20, 20 -> Angular 21. */
const NG_BOOTSTRAP_BY_ANGULAR: Record<number, string> = {
  19: '^18.0.0',
  20: '^19.0.1',
  21: '^20.0.0',
};

function buildVersions(major: number, minor: number): DependencyVersions {
  return {
    angularAligned: '^' + major + '.0.0',
    angularFramework: '^' + major + '.' + minor + '.0',
    ngxTranslateCore: '^17.0.0',
    ngxTranslateHttpLoader: '^17.0.0',
    ngxUiLoader: '^19.0.0',
    plCoreUtilsLibrary: '~2.1.3',
    plDecorator: '^1.4.28',
    bootstrap: '^5.3.0',
    popperCore: '^2.11.8',
    ngBootstrap: NG_BOOTSTRAP_BY_ANGULAR[major],
    jquery: '^3.7.0',
    fontawesome: '^6.1.1',
    msalAngular: '^6.3.0',
    msalBrowser: '^5.29.0',
    graphClient: '^3.0.7',
    sonarScanner: '^3.1.0',
  };
}

export function getVersions(major: number, minor: number = 0): DependencyVersions {
  if (SUPPORTED_ANGULAR_MAJORS.indexOf(major) < 0) {
    throw new SchematicsException(
      'Angular ' + major + ' is not supported by this version of pl-schematics (supported: ' +
        SUPPORTED_ANGULAR_MAJORS.join(', ') + ').',
    );
  }

  return buildVersions(major, minor);
}

/**
 * Legge la major di @angular/core dal package.json del progetto target. Se non
 * e' determinabile o non e' supportata lancia un errore chiaro (mai fallback su 'latest').
 */
export function getAngularVersion(host: Tree): { major: number; minor: number } {
  const packageJson = readJsonFile(host, 'package.json');

  if (!packageJson) {
    throw new SchematicsException('package.json not found: run the schematic inside an Angular CLI workspace.');
  }

  const raw =
    (packageJson.dependencies && packageJson.dependencies['@angular/core']) ||
    (packageJson.devDependencies && packageJson.devDependencies['@angular/core']);

  const match = raw ? String(raw).match(/(\d+)(?:\.(\d+))?/) : null;

  if (!match) {
    throw new SchematicsException(
      'Cannot determine the Angular version: "@angular/core" is missing or has a non-numeric range ("' + raw + '") in package.json.',
    );
  }

  const major = parseInt(match[1], 10);

  getVersions(major);

  return { major, minor: match[2] ? parseInt(match[2], 10) : 0 };
}

export function getAngularMajorVersion(host: Tree): number {
  return getAngularVersion(host).major;
}
