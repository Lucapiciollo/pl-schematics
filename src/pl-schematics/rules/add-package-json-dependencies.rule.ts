import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  addDependency,
  DependencyType,
  ExistingBehavior,
  InstallBehavior,
} from '@schematics/angular/utility';

import { PlSchematicsOptions } from '../types/schema-options';
import { getAngularVersion, getVersions } from '../utils/versions.utils';

interface PlDependency {
  type: DependencyType;
  name: string;
  version: string;
}

/**
 * @author l.piciollo
 * Calcola la lista delle dipendenze da aggiungere al progetto target. Le versioni
 * derivano da una tabella per major di Angular (utils/versions.utils.ts): nessun
 * 'latest' e nessun accesso alla rete.
 */
export function computeDependencies(
  options: PlSchematicsOptions,
  angularMajor: number,
  angularMinor: number = 0,
): PlDependency[] {
  const v = getVersions(angularMajor, angularMinor);
  const dependencies: PlDependency[] = [
    { type: DependencyType.Default, name: 'pl-core-utils-library', version: v.plCoreUtilsLibrary },
    /** Decorator `Unsubscribe` usato da GlobalService; e' anche peer di pl-core-utils-library. */
    { type: DependencyType.Default, name: 'pl-decorator', version: v.plDecorator },
    /** Loader grafico usato da app.component.html e dal modulo/provider di inizializzazione. */
    { type: DependencyType.Default, name: 'ngx-ui-loader', version: v.ngxUiLoader },
    /** Peer di pl-core-utils-library. */
    { type: DependencyType.Default, name: 'bootstrap', version: v.bootstrap },
    /** pl-core-utils-library importa NgbModule: @ng-bootstrap/ng-bootstrap richiede @angular/localize e Popper. */
    { type: DependencyType.Default, name: '@ng-bootstrap/ng-bootstrap', version: v.ngBootstrap },
    { type: DependencyType.Default, name: '@angular/localize', version: v.angularFramework },
    { type: DependencyType.Default, name: '@popperjs/core', version: v.popperCore },
    { type: DependencyType.Default, name: '@compodoc/compodoc', version: '^1.1.19' },
    /** Necessario per compilare le librerie generate in projects/. */
    { type: DependencyType.Dev, name: 'ng-packagr', version: v.angularAligned },
  ];

  if (options.i18n === 'ngx-translate') {
    dependencies.push(
      { type: DependencyType.Default, name: '@ngx-translate/core', version: v.ngxTranslateCore },
      { type: DependencyType.Default, name: '@ngx-translate/http-loader', version: v.ngxTranslateHttpLoader },
    );
  }

  if (options.ui === 'material') {
    dependencies.push(
      { type: DependencyType.Default, name: '@angular/material', version: v.angularAligned },
      { type: DependencyType.Default, name: '@angular/cdk', version: v.angularAligned },
      { type: DependencyType.Default, name: '@angular/animations', version: v.angularFramework },
    );
  }

  if (options.ui === 'bootstrap') {
    dependencies.push(
      { type: DependencyType.Default, name: 'jquery', version: v.jquery },
      { type: DependencyType.Default, name: '@fortawesome/fontawesome-free', version: v.fontawesome },
    );
  }

  if (options.state === 'ngrx') {
    ['@ngrx/store', '@ngrx/effects', '@ngrx/entity', '@ngrx/store-devtools'].forEach((name) =>
      dependencies.push({ type: DependencyType.Default, name, version: v.angularAligned }),
    );
  }

  if (options.loginSupportConfiguration === 'AZURE-ACTIVE-DIRECT') {
    dependencies.push(
      { type: DependencyType.Default, name: '@azure/msal-angular', version: v.msalAngular },
      { type: DependencyType.Default, name: '@azure/msal-browser', version: v.msalBrowser },
      /** Usato solo da AuthService/GlobalService (Microsoft Graph) quando il login Azure e' abilitato. */
      { type: DependencyType.Default, name: '@microsoft/microsoft-graph-client', version: v.graphClient },
    );
  }

  if (options.enableSonarQube === 'Y') {
    dependencies.push({ type: DependencyType.Default, name: 'sonar-scanner', version: v.sonarScanner });
  }

  if (options.mockApi === 'node-express') {
    dependencies.push(
      { type: DependencyType.Dev, name: 'express', version: '^4.18.2' },
      { type: DependencyType.Dev, name: 'cors', version: '^2.8.5' },
      { type: DependencyType.Dev, name: 'ts-node', version: '^10.9.2' },
      { type: DependencyType.Dev, name: 'ts-node-dev', version: '^2.0.0' },
      { type: DependencyType.Dev, name: '@types/express', version: '^4.17.21' },
      { type: DependencyType.Dev, name: '@types/cors', version: '^2.8.17' },
    );
  }

  return dependencies;
}

export function addPackageJsonDependencies(options: PlSchematicsOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    const detected = options.angularMajor
      ? { major: options.angularMajor, minor: options.angularMinor || 0 }
      : getAngularVersion(host);
    const angularMajor = detected.major;
    const dependencies = computeDependencies(options, angularMajor, detected.minor);

    context.logger.info(
      'Angular v' + angularMajor + ': adding ' + dependencies.length + ' dependencies with pinned ranges (no "latest").',
    );

    return chain(
      dependencies.map((dependency) =>
        addDependency(dependency.name, dependency.version, {
          type: dependency.type,
          existing: ExistingBehavior.Replace,
          install: InstallBehavior.Auto,
        }),
      ),
    );
  };
}
