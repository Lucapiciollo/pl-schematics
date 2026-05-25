import {
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  addPackageJsonDependency,
  NodeDependency,
  NodeDependencyType,
} from 'schematics-utilities';

import { PlSchematicsOptions } from '../types/schema-options';

function hasHttpInterceptor(options: PlSchematicsOptions): boolean {
  return options.http === 'interceptor-classic' ||
    options.http === 'interceptor-functional';
}

export function addPackageJsonDependencies(
  options: PlSchematicsOptions,
): Rule {
  return (host: Tree, context: SchematicContext) => {
    const dependencies: NodeDependency[] = [
      {
        type: NodeDependencyType.Default,
        version: 'latest',
        name: 'pl-core-utils-library',
      },
    ];

    if (options.i18n === 'ngx-translate') {
      dependencies.push(
        {
          type: NodeDependencyType.Default,
          version: '^4.0.0',
          name: '@ngx-translate/http-loader',
        },
        {
          type: NodeDependencyType.Default,
          version: '11.0.1',
          name: '@ngx-translate/core',
        },
      );
    }

    if (options.ui === 'material') {
      dependencies.push(
        {
          type: NodeDependencyType.Default,
          version: 'latest',
          name: '@angular/material',
        },
        {
          type: NodeDependencyType.Default,
          version: 'latest',
          name: '@angular/cdk',
        },
        {
          type: NodeDependencyType.Default,
          version: 'latest',
          name: '@angular/animations',
        },
      );
    }

    if (options.ui === 'bootstrap') {
      dependencies.push(
        {
          type: NodeDependencyType.Default,
          version: 'latest',
          name: 'popper.js',
        },
        {
          type: NodeDependencyType.Default,
          version: 'latest',
          name: '@popperjs/core',
        },
        {
          type: NodeDependencyType.Default,
          version: '^3.4.0',
          name: 'jquery',
        },
        {
          type: NodeDependencyType.Default,
          version: '^5.0.0',
          name: 'bootstrap',
        },
      );
    }

    if (options.state === 'ngrx') {
      dependencies.push(
        {
          type: NodeDependencyType.Default,
          version: 'latest',
          name: '@ngrx/store',
        },
        {
          type: NodeDependencyType.Default,
          version: 'latest',
          name: '@ngrx/effects',
        },
        {
          type: NodeDependencyType.Default,
          version: 'latest',
          name: '@ngrx/entity',
        },
        {
          type: NodeDependencyType.Default,
          version: 'latest',
          name: '@ngrx/store-devtools',
        },
      );
    }

    if (hasHttpInterceptor(options)) {
      /**
       * Per ora nessuna dipendenza extra necessaria.
       * I token/provider HTTP usano solo Angular/RxJS.
       */
    }

    if (options.loginSupportConfiguration === 'AZURE-ACTIVE-DIRECT') {
      dependencies.push(
        {
          type: NodeDependencyType.Default,
          version: '^3.0.0-beta.0',
          name: '@azure/msal-angular',
        },
        {
          type: NodeDependencyType.Default,
          version: '^3.0.0-beta.0',
          name: '@azure/msal-browser',
        },
        {
          type: NodeDependencyType.Default,
          version: '^3.0.0',
          name: '@microsoft/microsoft-graph-client',
        },
        {
          type: NodeDependencyType.Default,
          version: '^2.0.0',
          name: '@microsoft/teams-js',
        },
      );
    }

    if (options.enableSonarQube === 'Y') {
      dependencies.push({
        type: NodeDependencyType.Default,
        version: '^3.1.0',
        name: 'sonar-scanner',
      });
    }

    if (options.mockApi === 'node-express') {
      dependencies.push(
        {
          type: NodeDependencyType.Dev,
          version: '^4.18.2',
          name: 'express',
        },
        {
          type: NodeDependencyType.Dev,
          version: '^2.8.5',
          name: 'cors',
        },
        {
          type: NodeDependencyType.Dev,
          version: '^10.9.2',
          name: 'ts-node',
        },
        {
          type: NodeDependencyType.Dev,
          version: '^2.0.0',
          name: 'ts-node-dev',
        },
        {
          type: NodeDependencyType.Dev,
          version: '^4.17.21',
          name: '@types/express',
        },
        {
          type: NodeDependencyType.Dev,
          version: '^2.8.17',
          name: '@types/cors',
        },
      );
    }

    /**
     * Dipendenze opzionali vecchio template.
     * Le teniamo solo se servono davvero in futuro.
     * Non vanno più installate sempre.
     */
    if (options.logging === 'advanced') {
      /**
       * Il logging avanzato attuale non richiede librerie esterne.
       */
    }

    dependencies.forEach(function(dependency: NodeDependency): void {
      addPackageJsonDependency(host, dependency);

      context.logger.info(
        'Library inserted: "' +
          dependency.name +
          '" into ' +
          dependency.type,
      );
    });

    return host;
  };
}