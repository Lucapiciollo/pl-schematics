export type PlUiOption = 'none' | 'material' | 'bootstrap';

export type PlStateOption = 'none' | 'ngrx';

export type PlLoggingOption = 'none' | 'console' | 'advanced';

export type PlMockApiOption = 'none' | 'node-express';

export type PlCiOption = 'none' | 'github-actions' | 'azure-devops';

export type PlHttpOption =
  | 'none'
  | 'interceptor-classic'
  | 'interceptor-functional';

export type PlArchitectureOption =
  | 'classic'
  | 'standalone';

export type PlI18nOption =
  | 'none'
  | 'ngx-translate';

export type PlTestsOption =
  | 'none'
  | 'jasmine'
  | 'jest';

export type PlLoginSupportConfiguration =
  | 'NONE'
  | 'AZURE-ACTIVE-DIRECT';

export type PlBrowserSupported =
  | 'BROWSER.ALL'
  | 'BROWSER.CHROME'
  | 'BROWSER.FIREFOX'
  | 'BROWSER.EDGE'
  | 'BROWSER.SAFARI';

export type PlYesNo = 'Y' | 'N';

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
}