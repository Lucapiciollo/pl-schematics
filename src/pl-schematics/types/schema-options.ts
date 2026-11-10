/**
 * @author l.piciollo
 * Tipi delle opzioni dello schematic "pl-schematics" (specchio di schema.json).
 * Non e' una rule: definisce il contratto PlSchematicsOptions condiviso da index.ts,
 * da tutte le rule e dalle utility. Le opzioni vengono completate in fase di
 * normalizzazione (normalize-options.rule.ts), prima dell'esecuzione della chain.
 */

/**
 * @author l.piciollo
 * Framework UI scelto: nessuno, Angular Material o Bootstrap.
 */
export type PlUiOption = 'none' | 'material' | 'bootstrap';

/**
 * @author l.piciollo
 * Gestione dello stato applicativo: nessuna oppure NgRx (genera la libreria ngrx).
 */
export type PlStateOption = 'none' | 'ngrx';

/**
 * @author l.piciollo
 * Strategia di logging: nessuna, console o avanzata.
 */
export type PlLoggingOption = 'none' | 'console' | 'advanced';

/**
 * @author l.piciollo
 * Mock delle API: nessuno oppure server node-express.
 */
export type PlMockApiOption = 'none' | 'node-express';

/**
 * @author l.piciollo
 * Pipeline CI/CD da generare: nessuna, GitHub Actions o Azure DevOps.
 */
export type PlCiOption = 'none' | 'github-actions' | 'azure-devops';

/**
 * @author l.piciollo
 * Strategia HTTP: nessun interceptor, interceptor di tipo classe (classic)
 * o interceptor funzionale.
 */
export type PlHttpOption =
  | 'none'
  | 'interceptor-classic'
  | 'interceptor-functional';

import { AppInfo } from '../utils/workspace.utils';

/**
 * @author l.piciollo
 * Architettura Angular dell'app target: 'auto' la rileva da main.ts,
 * altrimenti forza classic (NgModule) o standalone.
 */
export type PlArchitectureOption =
  | 'auto'
  | 'classic'
  | 'standalone';

/**
 * @author l.piciollo
 * Internazionalizzazione a runtime: nessuna oppure ngx-translate.
 */
export type PlI18nOption =
  | 'none'
  | 'ngx-translate';

/**
 * @author l.piciollo
 * Framework di test unitari: nessuno, Jasmine o Jest.
 */
export type PlTestsOption =
  | 'none'
  | 'jasmine'
  | 'jest';

/**
 * @author l.piciollo
 * Provider di login supportato: nessuno oppure Azure Active Directory.
 */
export type PlLoginSupportConfiguration =
  | 'NONE'
  | 'AZURE-ACTIVE-DIRECT';

/**
 * @author l.piciollo
 * Browser supportati (chiave usata dai vecchi template).
 */
export type PlBrowserSupported =
  | 'BROWSER.ALL'
  | 'BROWSER.CHROME'
  | 'BROWSER.FIREFOX'
  | 'BROWSER.EDGE'
  | 'BROWSER.SAFARI';

/**
 * @author l.piciollo
 * Flag booleano testuale ('Y' = si', 'N' = no) usato dai template.
 */
export type PlYesNo = 'Y' | 'N';

/**
 * @author l.piciollo
 * Opzioni complessive dello schematic: quelle fornite dall'utente (schema.json)
 * piu' i valori derivati/risolti da normalize-options.rule.ts (workspace, versione
 * Angular, nomi delle librerie, ...). Viene passata a ogni rule e ai template EJS.
 */
export interface PlSchematicsOptions {
  /**
   * Nome cartella/package applicativo generato sotto src/app.
   */
  namePackage: string;


  /**
   * Nome azienda/autore.
   */
  nameCompany?: string;

  /**
   * Nome progetto Angular risolto da angular.json.
   */
  project?: string;

  /**
   * Prefix Angular del progetto, es: app.
   */
  prefix?: string;

  /**
   * UI framework.
   */
  ui?: PlUiOption;

  /**
   * State management.
   */
  state?: PlStateOption;

  /**
   * Logging strategy.
   */
  logging?: PlLoggingOption;

  /**
   * Mock API.
   */
  mockApi?: PlMockApiOption;

  /**
   * CI/CD.
   */
  ci?: PlCiOption;

  /**
   * HTTP strategy.
   */
  http?: PlHttpOption;

  /**
   * Architettura Angular.
   */
  architecture?: PlArchitectureOption;

  /**
   * Internazionalizzazione.
   */
  i18n?: PlI18nOption;

  /**
   * Test framework.
   */
  tests?: PlTestsOption;

  /**
   * Login provider.
   */
  loginSupportConfiguration?: PlLoginSupportConfiguration;

  /**
   * Browser support usato dai vecchi template.
   */
  browserSupported?: PlBrowserSupported;

  /**
   * Derivato da ui === bootstrap.
   */
  addSupportBootstrap?: PlYesNo;

  /**
   * SonarQube.
   */
  enableSonarQube?: PlYesNo | boolean | string;

  /**
   * Include documentazione generata.
   */
  includeDocumentation?: boolean | string;

  /**
   * Strict mode.
   */
  strict?: boolean | string;

  /**
   * true se l'app target e' standalone (derivato dal rilevamento).
   */
  standalone?: boolean;

  /**
   * Major di Angular rilevata dal package.json del progetto target.
   */
  angularMajor?: number;

  /**
   * Minor di Angular rilevata dal package.json del progetto target.
   */
  angularMinor?: number;

  /**
   * Nome base kebab-case per le librerie (da namePackage, '/' -> '-').
   */
  libBaseName?: string;

  /**
   * Prefisso di '../' extra per i path relativi verso src/environments quando
   * namePackage ha piu' segmenti (es. 'cloud/agic' -> '../').
   */
  nsUp?: string;

  /**
   * Nome della classe del componente root dell'app (es. AppComponent).
   */
  rootComponentClass?: string;

  /**
   * Specifier di import (relativo ad appDir) del componente root dell'app.
   */
  rootComponentImport?: string;

  /**
   * Dettagli dell'app rilevata (uso interno delle rule).
   */
  appInfo?: AppInfo;

  /**
   * Nome del progetto libreria Angular 'shared' (calcolato in normalize-options,
   * es. 'my-app-template-shared'). Usato sia per generare projects/<sharedLibName>
   * sia come specifier di import (path mapping in tsconfig.json).
   */
  sharedLibName?: string;

  /**
   * Nome del progetto libreria Angular 'ngrx' (calcolato in normalize-options,
   * es. 'my-app-template-ngrx'), generato solo quando state === 'ngrx'.
   */
  ngrxLibName?: string;
}