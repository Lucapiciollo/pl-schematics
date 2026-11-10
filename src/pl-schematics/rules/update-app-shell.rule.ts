// src/pl-schematics/rules/update-app-shell.rule.ts

/**
 * @author l.piciollo
 * Rule della chain di index.ts: e' l'ULTIMA della chain, dopo scaffoldEmptyFolders.
 * Adatta i file "shell" dell'app esistente (modulo o config root, routing, componente
 * root) per integrare shared library, state, UI e loader grafico, in modalita' classic
 * (NgModule) o standalone a seconda dell'architettura rilevata.
 */

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

/**
 * @author l.piciollo
 * Calcola lo specifier di import relativo da un file a un altro (senza estensione).
 * @param fromFile     :percorso del file che contiene l'import
 * @param toFileNoExt  :percorso del file importato, senza estensione .ts
 * @returns specifier relativo che inizia con './' o '../'
 */
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

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Renderizza la (unica) template contenuta in `sourceDir` e la scrive in `targetPath`
 * (sovrascrivendo), cosi' il nome del file di destinazione puo' adattarsi alla
 * convenzione del progetto (app.html vs app.component.html, app-module.ts vs app.module.ts).
 * @param options     :opzioni normalizzate, usate come contesto del template
 * @param sourceDir   :cartella della template da renderizzare
 * @param targetPath  :percorso del file di destinazione nel Tree
 * @returns Rule che genera il file e lo unisce al Tree sovrascrivendo
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

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Legge un file TypeScript dal Tree, applica una trasformazione e lo riscrive solo se
 * il contenuto e' cambiato. Lancia SchematicsException se il file non esiste.
 * @param host     :Tree del workspace
 * @param path     :percorso del file da modificare
 * @param context  :contesto dello schematic, usato per il log
 * @param edit     :funzione che riceve il contenuto originale e restituisce quello aggiornato
 */
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

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Applica in sequenza una lista di richieste di import al contenuto di un file.
 * @param content  :contenuto TypeScript di partenza
 * @param imports  :richieste di import da aggiungere (simboli e modulo di provenienza)
 * @returns contenuto con gli import aggiunti (senza duplicati, vedi addImports)
 */
function applyImports(content: string, imports: ImportRequest[]): string {
  return imports.reduce((acc, request) => addImports(acc, request), content);
}

/********************************************************************************************************************/

/**
 * ---------------------------------------------------------------------------
 * CLASSIC: app.module.ts + routing module
 * ---------------------------------------------------------------------------
 *
 * @author l.piciollo
 * Per le app classic genera il modulo di routing da template e aggiorna app.module.ts:
 * import e imports di SharedModule, AppRoutingModule, InitializerModule (piu' StateModule
 * con ngrx e BrowserAnimationsModule con Material) e provider ErrorHandler.
 * @param options  :opzioni normalizzate (namePackage, sharedLibName, ngrxLibName, state, ui)
 * @param app      :informazioni sull'app rilevata (file del modulo, del routing, cartella app)
 * @returns Rule che genera il routing e modifica il modulo root
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
          { symbols: ['PlLoadingModule'], from: './' + ns + '/core/module/pl-loading.module' },
          { symbols: ['SharedModule'], from: options.sharedLibName as string },
          { symbols: ['appSharedConfig'], from: './' + ns + '/core/utils/shared.config' },
          {
            symbols: ['AppRoutingModule'],
            from: relativeSpecifier(moduleFile, routingFile.replace(/\.ts$/, '')),
          },
        ];

        /**
         * PlLoadingModule va PRIMA di SharedModule.forRoot: l'interceptor HTTP del loader deve avvolgere quello di
         * retry/refresh-token della libreria shared (l'ordine di HTTP_INTERCEPTORS segue l'ordine degli imports).
         */
        const items = [
          { key: 'PlLoadingModule', code: 'PlLoadingModule' },
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

/********************************************************************************************************************/

/**
 * ---------------------------------------------------------------------------
 * STANDALONE: app.config.ts + app.routes.ts + componente root
 * ---------------------------------------------------------------------------
 *
 * @author l.piciollo
 * Per le app standalone genera app.routes.ts da template e aggiorna app.config.ts:
 * provider di routing con location a hash, providePlShared, provideCore (piu' StateModule
 * con ngrx e provideAnimationsAsync con Material). Lancia un'eccezione se app.config.ts manca.
 * @param options  :opzioni normalizzate (namePackage, sharedLibName, ngrxLibName, state, ui)
 * @param app      :informazioni sull'app rilevata (file di config e di routes)
 * @returns Rule che genera le routes e modifica la config applicativa
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
          { symbols: ['providePlLoadingTrace'], from: 'pl-loading-trace' },
          { symbols: ['plLoadingTraceOptions'], from: './' + ns + '/core/utils/pl-loading.config' },
          { symbols: ['providePlShared'], from: options.sharedLibName as string },
          { symbols: ['appSharedConfig'], from: './' + ns + '/core/utils/shared.config' },
        ];

        /**
         * providePlLoadingTrace va PRIMA di providePlShared/provideCore: l'interceptor HTTP del loader (registrato in
         * HTTP_INTERCEPTORS dalla libreria stessa) deve avvolgere quello di retry/refresh-token della libreria shared.
         */
        const items = [
          { key: 'providePlLoadingTrace', code: 'providePlLoadingTrace(plLoadingTraceOptions)' },
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

/********************************************************************************************************************/

/**
 * ---------------------------------------------------------------------------
 * Componente root: template con gli overlay del loader e, per standalone, i relativi import
 * ---------------------------------------------------------------------------
 *
 * @author l.piciollo
 * Sostituisce il template HTML del componente root con quello dello schematic (<pl-loading-overlay>
 * di pl-loading-trace per rotta e HTTP), riscrive lo spec se esiste e, per le app standalone, importa
 * RouterOutlet e PlLoadingOverlayComponent nel componente. Lancia un'eccezione se il template e' inline.
 * @param options  :opzioni normalizzate (standalone)
 * @param app      :informazioni sull'app rilevata (componente root, file di template)
 * @returns Rule che aggiorna template, spec e decoratore del componente root
 */
function updateRootComponent(options: PlSchematicsOptions, app: AppInfo): Rule {
  const root = app.rootComponent;

  if (!root.templateFile) {
    throw new SchematicsException(
      'The root component "' + root.className + '" uses an inline template: use a templateUrl (default of ng new) so the loading overlays can be added.',
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
        // Classic: <pl-loading-overlay> arriva da PlLoadingModule (che riesporta PlLoadingTraceModule), importato in AppModule dove e' dichiarato il componente root.
        return host;
      }

      editTsFile(host, root.file, context, (content) => {
        const updated = applyImports(content, [
          { symbols: ['PlLoadingOverlayComponent'], from: 'pl-loading-trace' },
          { symbols: ['RouterOutlet'], from: '@angular/router' },
        ]);

        return addToArrayProperty(updated, {
          property: 'imports',
          anchor: /@Component\(\{/,
          items: [
            { key: 'RouterOutlet', code: 'RouterOutlet' },
            { key: 'PlLoadingOverlayComponent', code: 'PlLoadingOverlayComponent' },
          ],
        });
      });

      return host;
    },
  ]);
}

/********************************************************************************************************************/

/**
 * @author l.piciollo
 * Adatta i file di "shell" dell'applicazione (modulo/config, routing, componente root)
 * all'architettura rilevata (classic o standalone) e ai nomi reali del progetto.
 * @param options  :opzioni normalizzate; richiede appInfo risolto da resolveWorkspaceOptions
 * @returns Rule composta (chain) della shell classic/standalone e del componente root
 */
export function updateAppShell(options: PlSchematicsOptions): Rule {
  const app = options.appInfo as AppInfo;

  return chain([
    options.standalone ? updateStandaloneShell(options, app) : updateClassicShell(options, app),
    updateRootComponent(options, app),
  ]);
}
