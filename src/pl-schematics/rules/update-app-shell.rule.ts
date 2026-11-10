// src/pl-schematics/rules/update-app-shell.rule.ts

import {
  apply,
  chain,
  forEach,
  mergeWith,
  MergeStrategy,
  Rule,
  SchematicContext,
  SchematicsException,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';

import { PlSchematicsOptions } from '../types/schema-options';
import { addImports, addToArrayProperty, ImportRequest } from '../utils/ts-edit.utils';
import { AppInfo } from '../utils/workspace.utils';

function relativeSpecifier(fromFile: string, toFileNoExt: string): string {
  const fromParts = fromFile.split('/').slice(0, -1);
  const toParts = toFileNoExt.split('/');
  let i = 0;

  while (i < fromParts.length && i < toParts.length - 1 && fromParts[i] === toParts[i]) {
    i++;
  }

  const ups = fromParts.slice(i).map(() => '..');
  const rest = toParts.slice(i);
  const spec = ups.concat(rest).join('/');

  return spec.charAt(0) === '.' ? spec : './' + spec;
}

/**
 * Renderizza la (unica) template contenuta in `sourceDir` e la scrive in `targetPath`
 * (sovrascrivendo), cosi' il nome del file di destinazione puo' adattarsi alla
 * convenzione del progetto (app.html vs app.component.html, app-module.ts vs app.module.ts).
 */
function renderTo(options: PlSchematicsOptions, sourceDir: string, targetPath: string): Rule {
  return (_host: Tree, context: SchematicContext) => {
    const source = apply(url(sourceDir), [
      template({ ...options, name: options.namePackage, ...strings }),
      forEach((entry) => ({ path: ('/' + targetPath) as any, content: entry.content })),
    ]);

    context.logger.info('Generated "' + targetPath + '"');

    return mergeWith(source, MergeStrategy.Overwrite);
  };
}

function editTsFile(
  host: Tree,
  path: string,
  context: SchematicContext,
  edit: (content: string) => string,
): void {
  const buffer = host.read(path);

  if (!buffer) {
    throw new SchematicsException('File "' + path + '" not found.');
  }

  const original = buffer.toString();
  const updated = edit(original);

  if (updated !== original) {
    host.overwrite(path, updated);
    context.logger.info('Updated "' + path + '"');
  }
}

function applyImports(content: string, imports: ImportRequest[]): string {
  return imports.reduce((acc, request) => addImports(acc, request), content);
}

/**
 * ---------------------------------------------------------------------------
 * CLASSIC: app.module.ts + routing module
 * ---------------------------------------------------------------------------
 */
function updateClassicShell(options: PlSchematicsOptions, app: AppInfo): Rule {
  const ns = options.namePackage;
  const moduleFile = app.moduleFile as string;
  const routingFile =
    app.routingModuleFile ||
    app.appDir + (app.dashNaming ? '/app-routing-module.ts' : '/app-routing.module.ts');

  return chain([
    renderTo(options, './files/shell-classic', routingFile),

    (host: Tree, context: SchematicContext) => {
      editTsFile(host, moduleFile, context, (content) => {
        const imports: ImportRequest[] = [
          { symbols: ['ErrorHandler'], from: '@angular/core' },
          { symbols: ['ErrorService'], from: './' + ns + '/core/service/error.service' },
          { symbols: ['InitializerModule'], from: './' + ns + '/core/module/initializer.module' },
          { symbols: ['SharedModule'], from: options.sharedLibName as string },
          { symbols: ['appSharedConfig'], from: './' + ns + '/core/utils/shared.config' },
          {
            symbols: ['AppRoutingModule'],
            from: relativeSpecifier(moduleFile, routingFile.replace(/\.ts$/, '')),
          },
        ];

        const items = [
          { key: 'SharedModule', code: 'SharedModule.forRoot(appSharedConfig)' },
          { key: 'AppRoutingModule', code: 'AppRoutingModule' },
          { key: 'InitializerModule', code: 'InitializerModule' },
        ];

        if (options.state === 'ngrx') {
          imports.push({ symbols: ['StateModule'], from: options.ngrxLibName as string });
          items.push({ key: 'StateModule', code: 'StateModule' });
        }

        if (options.ui === 'material') {
          imports.push({
            symbols: ['BrowserAnimationsModule'],
            from: '@angular/platform-browser/animations',
          });
          items.push({ key: 'BrowserAnimationsModule', code: 'BrowserAnimationsModule' });
        }

        let updated = applyImports(content, imports);

        updated = addToArrayProperty(updated, {
          property: 'imports',
          anchor: /@NgModule\(\{/,
          items,
        });

        /**
         * Intercetta tutti gli errori applicativi e li ridirige al servizio dedicato.
         */
        updated = addToArrayProperty(updated, {
          property: 'providers',
          anchor: /@NgModule\(\{/,
          items: [{ key: 'ErrorHandler', code: '{ provide: ErrorHandler, useClass: ErrorService }' }],
        });

        return updated;
      });

      return host;
    },
  ]);
}

/**
 * ---------------------------------------------------------------------------
 * STANDALONE: app.config.ts + app.routes.ts + componente root
 * ---------------------------------------------------------------------------
 */
function updateStandaloneShell(options: PlSchematicsOptions, app: AppInfo): Rule {
  const ns = options.namePackage;
  const configFile = app.configFile as string;
  const routesFile = app.routesFile as string;

  return chain([
    renderTo(options, './files/shell-standalone', routesFile),

    (host: Tree, context: SchematicContext) => {
      if (!host.exists(configFile)) {
        throw new SchematicsException(
          'Standalone application config "' + configFile + '" not found: bootstrapApplication must receive an ApplicationConfig defined in app.config.ts.',
        );
      }

      editTsFile(host, configFile, context, (content) => {
        const imports: ImportRequest[] = [
          { symbols: ['provideRouter', 'withHashLocation'], from: '@angular/router' },
          { symbols: ['routes'], from: relativeSpecifier(configFile, routesFile.replace(/\.ts$/, '')) },
          { symbols: ['provideCore'], from: './' + ns + '/core/provide-core' },
          { symbols: ['providePlShared'], from: options.sharedLibName as string },
          { symbols: ['appSharedConfig'], from: './' + ns + '/core/utils/shared.config' },
        ];

        const items = [
          { key: 'providePlShared', code: 'providePlShared(appSharedConfig)' },
          { key: 'provideCore', code: 'provideCore()' },
        ];

        if (options.state === 'ngrx') {
          imports.push({ symbols: ['importProvidersFrom'], from: '@angular/core' });
          imports.push({ symbols: ['StateModule'], from: options.ngrxLibName as string });
          items.push({ key: 'StateModule', code: 'importProvidersFrom(StateModule)' });
        }

        if (options.ui === 'material') {
          imports.push({
            symbols: ['provideAnimationsAsync'],
            from: '@angular/platform-browser/animations/async',
          });
          items.push({ key: 'provideAnimationsAsync', code: 'provideAnimationsAsync()' });
        }

        let updated = applyImports(content, imports);

        // Il routing resta quello di `ng new`, con location a hash come nell'architettura classic.
        if (/provideRouter\(\s*routes\s*\)/.test(updated)) {
          updated = updated.replace(/provideRouter\(\s*routes\s*\)/, 'provideRouter(routes, withHashLocation())');
        } else if (!/provideRouter\(/.test(updated)) {
          items.unshift({ key: 'provideRouter', code: 'provideRouter(routes, withHashLocation())' });
        }

        return addToArrayProperty(updated, {
          property: 'providers',
          anchor: /ApplicationConfig\s*=\s*\{/,
          items,
        });
      });

      return host;
    },
  ]);
}

/**
 * ---------------------------------------------------------------------------
 * Componente root: template con i loader e, per standalone, i relativi import
 * ---------------------------------------------------------------------------
 */
function updateRootComponent(options: PlSchematicsOptions, app: AppInfo): Rule {
  const root = app.rootComponent;

  if (!root.templateFile) {
    throw new SchematicsException(
      'The root component "' + root.className + '" uses an inline template: use a templateUrl (default of ng new) so the loaders can be added.',
    );
  }

  const specFile = root.file.replace(/\.ts$/, '.spec.ts');

  return chain([
    renderTo(options, './files/shell', root.templateFile),
    // Lo spec di ng new verifica il contenuto del template sostituito: lo si riscrive (solo se esiste).
    (host: Tree, context: SchematicContext) =>
      host.exists(specFile) ? renderTo(options, './files/shell-spec', specFile)(host, context) : host,

    (host: Tree, context: SchematicContext) => {
      if (!options.standalone) {
        // Classic: NgxUiLoaderModule arriva da InitializerModule (exports), il componente e' dichiarato in AppModule.
        return host;
      }

      editTsFile(host, root.file, context, (content) => {
        const updated = applyImports(content, [
          { symbols: ['NgxUiLoaderModule'], from: 'ngx-ui-loader' },
          { symbols: ['RouterOutlet'], from: '@angular/router' },
        ]);

        return addToArrayProperty(updated, {
          property: 'imports',
          anchor: /@Component\(\{/,
          items: [
            { key: 'RouterOutlet', code: 'RouterOutlet' },
            { key: 'NgxUiLoaderModule', code: 'NgxUiLoaderModule' },
          ],
        });
      });

      return host;
    },
  ]);
}

/**
 * Adatta i file di "shell" dell'applicazione (modulo/config, routing, componente root)
 * all'architettura rilevata (classic o standalone) e ai nomi reali del progetto.
 */
export function updateAppShell(options: PlSchematicsOptions): Rule {
  const app = options.appInfo as AppInfo;

  return chain([
    options.standalone ? updateStandaloneShell(options, app) : updateClassicShell(options, app),
    updateRootComponent(options, app),
  ]);
}
