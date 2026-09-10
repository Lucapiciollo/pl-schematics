function hasAzureActiveDirectory(options: PlSchematicsOptions): boolean {
  return options.loginSupportConfiguration === 'AZURE-ACTIVE-DIRECT';
}
import { chain, noop, Rule } from '@angular-devkit/schematics';

import { PlSchematicsOptions } from '../types/schema-options';
import { addClass } from './add-class.rule';

interface TemplateFolderConfig {
  source: string;
  destination: string;
  enabled?: (options: PlSchematicsOptions) => boolean;
}

function hasMockApi(options: PlSchematicsOptions): boolean {
  return options.mockApi === 'node-express';
}

/**
 * @author l.piciollo
 * NOTA: il contenuto un tempo generato qui come semplice cartella applicativa
 * (core/bean, core/interceptor, shared/*, advanced-logging, material, ngrx) e'
 * ora generato come libreria Angular vera e propria da addSharedLibrary()/
 * addNgrxLibrary() (vedi index.ts), che vengono eseguite PRIMA di questa rule.
 * Qui restano solo i file destinati al progetto applicativo.
 */
const TEMPLATE_FOLDERS: TemplateFolderConfig[] = [
  {
    source: './files/core/service',
    destination: '<namePackage>/core/service/',
  },
  {
    source: './files/core/initializer',
    destination: '<namePackage>/core/initializer/',
  },
  {
    source: './files/core/module',
    destination: '<namePackage>/core/module/',
  },
  {
    source: './files/core/msal',
    destination: '<namePackage>/core/module/msal/',
    enabled: hasAzureActiveDirectory,
  },
  {
    source: './files/core/utils',
    destination: '<namePackage>/core/utils/',
  },
  {
    source: './files/core/type',
    destination: '<namePackage>/core/type/',
  },

  {
    source: './files/home',
    destination: '<namePackage>/component/page/home',
  },
  {
    source: './files/component',
    destination: '/',
  },
  {
    source: './files/extension',
    destination: '/',
  },
  {
    source: './files/customInterface',
    destination: '../',
  },
  {
    source: './files/properties',
    destination: '../environments/',
  },
  {
    source: './files/public',
    destination: '../assets/public',
  },

  {
    source: './files/application',
    destination: '../../',
    enabled: function(options: PlSchematicsOptions): boolean {
      return options.enableSonarQube === 'Y';
    },
  },
  {
    source: './documentation',
    destination: '../../pl-schematics/document',
    enabled: function(options: PlSchematicsOptions): boolean {
      return options.includeDocumentation === true;
    },
  },
  {
    source: './files/mock-api-node',
    destination: '../../mock-api',
    enabled: hasMockApi,
  },
  {
    source: './files/ci-azure-devops',
    destination: '../../',
    enabled: function(options: PlSchematicsOptions): boolean {
      return options.ci === 'azure-devops';
    },
  },
  {
    source: './files/ci-github-actions',
    destination: '../../',
    enabled: function(options: PlSchematicsOptions): boolean {
      return options.ci === 'github-actions';
    },
  },

  /**
   * Tool aggiornamento dipendenze sempre generato.
   * Se lo vuoi condizionale, aggiungiamo una opzione dedicata.
   */
  {
    source: './files/dependency-updater',
    destination: '../../',
  },
];

function resolveDestination(
  destination: string,
  options: PlSchematicsOptions,
): string {
  return destination.replace('<namePackage>', options.namePackage);
}

export function addTemplateFiles(options: PlSchematicsOptions): Rule {
  return chain(
    TEMPLATE_FOLDERS.map(function(item: TemplateFolderConfig): Rule {
      if (item.enabled && !item.enabled(options)) {
        return noop();
      }

      return addClass(
        options,
        item.source,
        resolveDestination(item.destination, options),
      );
    }),
  );
}