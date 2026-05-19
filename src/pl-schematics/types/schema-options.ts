export type YesNo = 'Y' | 'N';

export type BrowserSupported =
  | 'BROWSER.EDG'
  | 'BROWSER.OPERA'
  | 'BROWSER.CHROME'
  | 'BROWSER.IE'
  | 'BROWSER.FIREFOX'
  | 'BROWSER.SAFARI'
  | 'BROWSER.OTHER'
  | 'BROWSER.ALL';

export type LoginSupportConfiguration =
  | 'NONE'
  | 'AZURE-ACTIVE-DIRECT';

export type AngularArchitecture =
  | 'classic'
  | 'standalone'
  | 'hybrid';

export type StateManagement =
  | 'none'
  | 'ngrx'
  | 'signals';

export type HttpStrategy =
  | 'none'
  | 'interceptor-classic'
  | 'interceptor-functional';

export type UiFramework =
  | 'none'
  | 'bootstrap'
  | 'material'
  | 'ux-directives';

export type I18nStrategy =
  | 'none'
  | 'ngx-translate'
  | 'angular-localize';

export type LoggingStrategy =
  | 'none'
  | 'console'
  | 'advanced';

export type MockApiStrategy =
  | 'none'
  | 'json-server'
  | 'node-express';

export type CiStrategy =
  | 'none'
  | 'github-actions'
  | 'azure-devops';

export type TestStrategy =
  | 'none'
  | 'jasmine'
  | 'jest'
  | 'vitest';

export interface PlSchematicsOptions {
  project?: string;

  nameCompany?: string;
  namePackage: string;
  prefixClass?: string;
  prefix?: string;

  browserSupported?: BrowserSupported;
  loginSupportConfiguration?: LoginSupportConfiguration;

  addSupportBootstrap?: YesNo;
  enableSonarQube?: YesNo;

  architecture?: AngularArchitecture;
  state?: StateManagement;
  http?: HttpStrategy;
  ui?: UiFramework;
  i18n?: I18nStrategy;
  logging?: LoggingStrategy;
  mockApi?: MockApiStrategy;
  ci?: CiStrategy;
  tests?: TestStrategy;

  docker?: boolean;
  strict?: boolean;
}

export interface NormalizedPlSchematicsOptions {
  project: string;

  nameCompany: string;
  namePackage: string;
  prefixClass: string;
  prefix: string;

  browserSupported: BrowserSupported;
  loginSupportConfiguration: LoginSupportConfiguration;

  addSupportBootstrap: YesNo;
  enableSonarQube: YesNo;

  architecture: AngularArchitecture;
  state: StateManagement;
  http: HttpStrategy;
  ui: UiFramework;
  i18n: I18nStrategy;
  logging: LoggingStrategy;
  mockApi: MockApiStrategy;
  ci: CiStrategy;
  tests: TestStrategy;

  docker: boolean;
  strict: boolean;
}