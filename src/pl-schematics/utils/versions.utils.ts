// src/pl-schematics/utils/versions.utils.ts

/**
 * @author l.piciollo
 * Utility per le versioni delle dipendenze: tabella dei range pinnati per major di
 * Angular e rilevamento della versione di Angular del progetto target. Non e' una rule
 * della chain: e' usata da addPackageJsonDependencies() e da normalize-options.rule.ts.
 */

import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { readJsonFile } from './json.utils';

/**
 * @author l.piciollo
 * Major di Angular supportate (e verificate dalla matrice `npm run test:e2e`).
 * Nessuna dipendenza usa 'latest': ogni versione e' un range esplicito.
 */
export const SUPPORTED_ANGULAR_MAJORS = [19, 20, 21];

/**
 * @author l.piciollo
 * Range di versione (semver) delle dipendenze aggiunte al progetto target, calcolati
 * per una specifica major/minor di Angular.
 */
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
  /** @ngx-translate/core. */
  ngxTranslateCore: string;
  /** @ngx-translate/http-loader. */
  ngxTranslateHttpLoader: string;
  /** ngx-ui-loader. */
  ngxUiLoader: string;
  /** pl-core-utils-library. */
  plCoreUtilsLibrary: string;
  /** pl-decorator. */
  plDecorator: string;
  /** bootstrap. */
  bootstrap: string;
  /** @popperjs/core. */
  popperCore: string;
  /** @ng-bootstrap/ng-bootstrap (dipende dalla major di Angular). */
  ngBootstrap: string;
  /** jquery. */
  jquery: string;
  /** @fortawesome/fontawesome-free. */
  fontawesome: string;
  /** @azure/msal-angular. */
  msalAngular: string;
  /** @azure/msal-browser. */
  msalBrowser: string;
  /** @microsoft/microsoft-graph-client. */
  graphClient: string;
  /** sonar-scanner. */
  sonarScanner: string;
}

/********************************************************************************************************************/

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

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Costruisce l'insieme dei range di versione per la major/minor di Angular indicata.
 * @param major  :major di Angular del progetto target
 * @param minor  :minor di Angular, usata per i pacchetti @angular/* con la stessa numerazione di core
 * @returns i range di versione di tutte le dipendenze
 */
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

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Restituisce i range di versione per una major di Angular supportata.
 * Lancia SchematicsException se la major non e' in SUPPORTED_ANGULAR_MAJORS.
 * @param major  :major di Angular
 * @param minor  :minor di Angular (default 0)
 * @returns i range di versione delle dipendenze
 */
export function getVersions(major: number, minor: number = 0): DependencyVersions {
  if (SUPPORTED_ANGULAR_MAJORS.indexOf(major) < 0) {
    throw new SchematicsException(
      'Angular ' + major + ' is not supported by this version of pl-schematics (supported: ' +
        SUPPORTED_ANGULAR_MAJORS.join(', ') + ').',
    );
  }

  return buildVersions(major, minor);
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Legge la major di @angular/core dal package.json del progetto target. Se non
 * e' determinabile o non e' supportata lancia un errore chiaro (mai fallback su 'latest').
 * @param host  :Tree del workspace (si legge package.json)
 * @returns major e minor di @angular/core (minor 0 se non indicata)
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

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Scorciatoia che restituisce solo la major di Angular del progetto target.
 * @param host  :Tree del workspace (si legge package.json)
 * @returns la major di @angular/core
 */
export function getAngularMajorVersion(host: Tree): number {
  return getAngularVersion(host).major;
}
