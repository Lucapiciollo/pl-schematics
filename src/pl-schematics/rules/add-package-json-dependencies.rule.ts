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
import { readJsonFile } from '../utils/json.utils';

function hasHttpInterceptor(options: PlSchematicsOptions): boolean {
  return options.http === 'interceptor-classic' ||
    options.http === 'interceptor-functional';
}

/**
 * @author l.piciollo
 * Legge la versione di @angular/core gia' installata nel progetto target per
 * derivare un range compatibile per i pacchetti che seguono lo stesso
 * versionamento major di Angular (Material, CDK, Animations, NgRx, ng-packagr).
 * Usare 'latest' per questi pacchetti e' pericoloso: se il progetto target e'
 * pinnato su una versione di Angular non piu' recentissima, 'latest' rischia
 * di risolvere una versione che richiede un @angular/core piu' nuovo di quello
 * installato, causando un conflitto ERESOLVE al primo 'npm install' (bug
 * riscontrato durante i test di validazione di questo schematic).
 */
function getAngularMajorVersion(host: Tree): number | null {
  const packageJson = readJsonFile(host, 'package.json');

  if (!packageJson) {
    return null;
  }

  const raw =
    (packageJson.dependencies && packageJson.dependencies['@angular/core']) ||
    (packageJson.devDependencies && packageJson.devDependencies['@angular/core']);

  if (!raw) {
    return null;
  }

  const match = String(raw).match(/(\d+)/);

  if (!match) {
    return null;
  }

  const major = parseInt(match[1], 10);

  return isNaN(major) ? null : major;
}

/**
 * @author l.piciollo
 * Ritorna un range npm coerente con la major version di Angular rilevata
 * (es. '^17.0.0'), oppure 'latest' come fallback quando non e' stato
 * possibile determinarla (es. angular.json/package.json non standard).
 */
function angularCompatibleRange(angularMajor: number | null): string {
  return angularMajor ? '^' + angularMajor + '.0.0' : 'latest';
}

export function addPackageJsonDependencies(
  options: PlSchematicsOptions,
): Rule {
  return (host: Tree, context: SchematicContext) => {
    const angularMajor = getAngularMajorVersion(host);
    const angularRange = angularCompatibleRange(angularMajor);

    if (angularMajor) {
      context.logger.info(
        'Angular v' + angularMajor + ' rilevato: Material/CDK/NgRx/ng-packagr saranno installati con range "' + angularRange + '".',
      );
    } else {
      context.logger.warn(
        'Impossibile rilevare la versione di @angular/core dal package.json del progetto target: Material/CDK/NgRx/ng-packagr useranno "latest" (rischio di conflitti di peer-dependency).',
      );
    }

    const dependencies: NodeDependency[] = [
      {
        type: NodeDependencyType.Default,
        version: 'latest',
        name: 'pl-core-utils-library',
      },
      /**
       * @author l.piciollo
       * ng-packagr e' richiesto per compilare le librerie Angular generate
       * dallo schematic (projects/<namePackage>-shared, projects/<namePackage>-ngrx),
       * tramite il builder '@angular-devkit/build-angular:ng-packagr'. Segue lo
       * stesso versionamento major di Angular.
       */
      {
        type: NodeDependencyType.Dev,
        version: angularRange,
        name: 'ng-packagr',
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
          version: angularRange,
          name: '@angular/material',
        },
        {
          type: NodeDependencyType.Default,
          version: angularRange,
          name: '@angular/cdk',
        },
        {
          type: NodeDependencyType.Default,
          version: angularRange,
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
          version: angularRange,
          name: '@ngrx/store',
        },
        {
          type: NodeDependencyType.Default,
          version: angularRange,
          name: '@ngrx/effects',
        },
        {
          type: NodeDependencyType.Default,
          version: angularRange,
          name: '@ngrx/entity',
        },
        {
          type: NodeDependencyType.Default,
          version: angularRange,
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