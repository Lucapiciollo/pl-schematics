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

function hasHttpInterceptor(options: PlSchematicsOptions): boolean {
  return options.http === 'interceptor-classic' ||
    options.http === 'interceptor-functional';
}

function hasAdvancedLogging(options: PlSchematicsOptions): boolean {
  return options.logging === 'advanced';
}

function hasMaterial(options: PlSchematicsOptions): boolean {
  return options.ui === 'material';
}

function hasNgrx(options: PlSchematicsOptions): boolean {
  return options.state === 'ngrx';
}

function hasMockApi(options: PlSchematicsOptions): boolean {
  return options.mockApi === 'node-express';
}

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
    source: './files/core/bean',
    destination: '<namePackage>/core/bean/',
  },
  {
    source: './files/core/module',
    destination: '<namePackage>/core/module/',
  },
  {
    source: './files/core/module/msal',
    destination: '<namePackage>/core/module/',
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

  /**
   * Interceptor core solo se scelto da prompt/opzione.
   */
  {
    source: './files/core/interceptor',
    destination: '<namePackage>/core/interceptor/',
    enabled: hasHttpInterceptor,
  },

  {
    source: './files/shared/module',
    destination: '<namePackage>/shared/module/',
  },
  {
    source: './files/shared/utils',
    destination: '<namePackage>/shared/utils/',
  },
  {
    source: './files/shared/service',
    destination: '<namePackage>/shared/service/',
  },
  {
    source: './files/shared/component',
    destination: '<namePackage>/shared/component/',
  },
  {
    source: './files/shared/pipe',
    destination: '<namePackage>/shared/pipe/',
  },

  /**
   * Token/provider/adapter HTTP solo se si usa interceptor.
   */
  {
    source: './files/shared/http',
    destination: '<namePackage>/shared/http/',
    enabled: hasHttpInterceptor,
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
    source: './files/advanced-logging',
    destination: '<namePackage>/core/logging/',
    enabled: hasAdvancedLogging,
  },
  {
    source: './files/material',
    destination: '<namePackage>/shared/material/',
    enabled: hasMaterial,
  },
  {
    source: './files/ngrx',
    destination: '<namePackage>/',
    enabled: hasNgrx,
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