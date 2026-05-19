// src/pl-schematics/types/schema-options.ts

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
}