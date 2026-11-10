"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppShell = updateAppShell;
const schematics_1 = require("@angular-devkit/schematics");
const core_1 = require("@angular-devkit/core");
const ts_edit_utils_1 = require("../utils/ts-edit.utils");
function relativeSpecifier(fromFile, toFileNoExt) {
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
function renderTo(options, sourceDir, targetPath) {
    return (_host, context) => {
        const source = (0, schematics_1.apply)((0, schematics_1.url)(sourceDir), [
            (0, schematics_1.template)({ ...options, name: options.namePackage, ...core_1.strings }),
            (0, schematics_1.forEach)((entry) => ({ path: ('/' + targetPath), content: entry.content })),
        ]);
        context.logger.info('Generated "' + targetPath + '"');
        return (0, schematics_1.mergeWith)(source, schematics_1.MergeStrategy.Overwrite);
    };
}
function editTsFile(host, path, context, edit) {
    const buffer = host.read(path);
    if (!buffer) {
        throw new schematics_1.SchematicsException('File "' + path + '" not found.');
    }
    const original = buffer.toString();
    const updated = edit(original);
    if (updated !== original) {
        host.overwrite(path, updated);
        context.logger.info('Updated "' + path + '"');
    }
}
function applyImports(content, imports) {
    return imports.reduce((acc, request) => (0, ts_edit_utils_1.addImports)(acc, request), content);
}
function updateClassicShell(options, app) {
    const ns = options.namePackage;
    const moduleFile = app.moduleFile;
    const routingFile = app.routingModuleFile ||
        app.appDir + (app.dashNaming ? '/app-routing-module.ts' : '/app-routing.module.ts');
    return (0, schematics_1.chain)([
        renderTo(options, './files/shell-classic', routingFile),
        (host, context) => {
            editTsFile(host, moduleFile, context, (content) => {
                const imports = [
                    { symbols: ['ErrorHandler'], from: '@angular/core' },
                    { symbols: ['ErrorService'], from: './' + ns + '/core/service/error.service' },
                    { symbols: ['InitializerModule'], from: './' + ns + '/core/module/initializer.module' },
                    { symbols: ['PlLoadingModule'], from: './' + ns + '/core/module/pl-loading.module' },
                    { symbols: ['SharedModule'], from: options.sharedLibName },
                    { symbols: ['appSharedConfig'], from: './' + ns + '/core/utils/shared.config' },
                    {
                        symbols: ['AppRoutingModule'],
                        from: relativeSpecifier(moduleFile, routingFile.replace(/\.ts$/, '')),
                    },
                ];
                const items = [
                    { key: 'PlLoadingModule', code: 'PlLoadingModule' },
                    { key: 'SharedModule', code: 'SharedModule.forRoot(appSharedConfig)' },
                    { key: 'AppRoutingModule', code: 'AppRoutingModule' },
                    { key: 'InitializerModule', code: 'InitializerModule' },
                ];
                if (options.state === 'ngrx') {
                    imports.push({ symbols: ['StateModule'], from: options.ngrxLibName });
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
                updated = (0, ts_edit_utils_1.addToArrayProperty)(updated, {
                    property: 'imports',
                    anchor: /@NgModule\(\{/,
                    items,
                });
                updated = (0, ts_edit_utils_1.addToArrayProperty)(updated, {
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
function updateStandaloneShell(options, app) {
    const ns = options.namePackage;
    const configFile = app.configFile;
    const routesFile = app.routesFile;
    return (0, schematics_1.chain)([
        renderTo(options, './files/shell-standalone', routesFile),
        (host, context) => {
            if (!host.exists(configFile)) {
                throw new schematics_1.SchematicsException('Standalone application config "' + configFile + '" not found: bootstrapApplication must receive an ApplicationConfig defined in app.config.ts.');
            }
            editTsFile(host, configFile, context, (content) => {
                const imports = [
                    { symbols: ['provideRouter', 'withHashLocation'], from: '@angular/router' },
                    { symbols: ['routes'], from: relativeSpecifier(configFile, routesFile.replace(/\.ts$/, '')) },
                    { symbols: ['provideCore'], from: './' + ns + '/core/provide-core' },
                    { symbols: ['providePlLoadingTrace'], from: 'pl-loading-trace' },
                    { symbols: ['plLoadingTraceOptions'], from: './' + ns + '/core/utils/pl-loading.config' },
                    { symbols: ['providePlShared'], from: options.sharedLibName },
                    { symbols: ['appSharedConfig'], from: './' + ns + '/core/utils/shared.config' },
                ];
                const items = [
                    { key: 'providePlLoadingTrace', code: 'providePlLoadingTrace(plLoadingTraceOptions)' },
                    { key: 'providePlShared', code: 'providePlShared(appSharedConfig)' },
                    { key: 'provideCore', code: 'provideCore()' },
                ];
                if (options.state === 'ngrx') {
                    imports.push({ symbols: ['importProvidersFrom'], from: '@angular/core' });
                    imports.push({ symbols: ['StateModule'], from: options.ngrxLibName });
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
                if (/provideRouter\(\s*routes\s*\)/.test(updated)) {
                    updated = updated.replace(/provideRouter\(\s*routes\s*\)/, 'provideRouter(routes, withHashLocation())');
                }
                else if (!/provideRouter\(/.test(updated)) {
                    items.unshift({ key: 'provideRouter', code: 'provideRouter(routes, withHashLocation())' });
                }
                return (0, ts_edit_utils_1.addToArrayProperty)(updated, {
                    property: 'providers',
                    anchor: /ApplicationConfig\s*=\s*\{/,
                    items,
                });
            });
            return host;
        },
    ]);
}
function updateRootComponent(options, app) {
    const root = app.rootComponent;
    if (!root.templateFile) {
        throw new schematics_1.SchematicsException('The root component "' + root.className + '" uses an inline template: use a templateUrl (default of ng new) so the loading overlays can be added.');
    }
    const specFile = root.file.replace(/\.ts$/, '.spec.ts');
    return (0, schematics_1.chain)([
        renderTo(options, './files/shell', root.templateFile),
        (host, context) => host.exists(specFile) ? renderTo(options, './files/shell-spec', specFile)(host, context) : host,
        (host, context) => {
            if (!options.standalone) {
                return host;
            }
            editTsFile(host, root.file, context, (content) => {
                const updated = applyImports(content, [
                    { symbols: ['PlLoadingOverlayComponent'], from: 'pl-loading-trace' },
                    { symbols: ['RouterOutlet'], from: '@angular/router' },
                ]);
                return (0, ts_edit_utils_1.addToArrayProperty)(updated, {
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
function updateAppShell(options) {
    const app = options.appInfo;
    return (0, schematics_1.chain)([
        options.standalone ? updateStandaloneShell(options, app) : updateClassicShell(options, app),
        updateRootComponent(options, app),
    ]);
}
