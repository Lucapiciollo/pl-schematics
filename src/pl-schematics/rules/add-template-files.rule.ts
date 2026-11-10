import { chain, noop, Rule } from '@angular-devkit/schematics';

import { PlSchematicsOptions } from '../types/schema-options';
import { addClass } from './add-class.rule';

interface TemplateFolderConfig {
  source: string;
  destination: string;
  enabled?: (options: PlSchematicsOptions) => boolean;
}

const isClassic = (options: PlSchematicsOptions): boolean => !options.standalone;
const isStandalone = (options: PlSchematicsOptions): boolean => !!options.standalone;
const hasAzure = (options: PlSchematicsOptions): boolean =>
  options.loginSupportConfiguration === 'AZURE-ACTIVE-DIRECT';

/**
 * @author l.piciollo
 * Template copiati nel progetto applicativo. Il contenuto realmente condiviso
 * (pipe, bean, interceptor, logging, material, ngrx) e' generato come libreria
 * Angular da addSharedLibrary()/addNgrxLibrary(); i file di "shell" dell'app
 * (app.module/app.config, routing, componente root) sono gestiti da
 * updateAppShell(), che li adatta ai nomi reali del progetto (Angular 19 vs 20+).
 * Le cartelle specifiche di un'architettura sono generate solo per quella.
 */
const TEMPLATE_FOLDERS: TemplateFolderConfig[] = [
  { source: './files/core/service', destination: '<namePackage>/core/service/' },
  { source: './files/core/initializer', destination: '<namePackage>/core/initializer/' },
  { source: './files/core/module', destination: '<namePackage>/core/module/', enabled: isClassic },
  { source: './files/core/standalone', destination: '<namePackage>/core/', enabled: isStandalone },
  { source: './files/core/msal', destination: '<namePackage>/core/msal/', enabled: hasAzure },
  {
    source: './files/core/msal-classic',
    destination: '<namePackage>/core/msal/',
    enabled: (options) => hasAzure(options) && isClassic(options),
  },
  { source: './files/core/utils', destination: '<namePackage>/core/utils/' },
  { source: './files/core/type', destination: '<namePackage>/core/type/' },

  { source: './files/home', destination: '<namePackage>/component/page/home' },
  {
    source: './files/home-classic',
    destination: '<namePackage>/component/page/home',
    enabled: isClassic,
  },
  { source: './files/properties', destination: '../environments/' },
  { source: './files/public', destination: '../assets/public' },

  {
    source: './files/application',
    destination: '../../',
    enabled: (options) => options.enableSonarQube === 'Y',
  },
  {
    source: './documentation',
    destination: '../../pl-schematics/document',
    enabled: (options) => options.includeDocumentation === true,
  },
  {
    source: './files/mock-api-node',
    destination: '../../mock-api',
    enabled: (options) => options.mockApi === 'node-express',
  },
  {
    source: './files/ci-azure-devops',
    destination: '../../',
    enabled: (options) => options.ci === 'azure-devops',
  },
  {
    source: './files/ci-github-actions',
    destination: '../../',
    enabled: (options) => options.ci === 'github-actions',
  },

  /**
   * Tool di controllo dipendenze (postinstall). Si disattiva con PL_DEPS_CHECK=false.
   */
  { source: './files/dependency-updater', destination: '../../' },
];

function resolveDestination(destination: string, options: PlSchematicsOptions): string {
  return destination.replace('<namePackage>', options.namePackage);
}

export function addTemplateFiles(options: PlSchematicsOptions): Rule {
  return chain(
    TEMPLATE_FOLDERS.map((item: TemplateFolderConfig): Rule => {
      if (item.enabled && !item.enabled(options)) {
        return noop();
      }

      return addClass(options, item.source, resolveDestination(item.destination, options));
    }),
  );
}
