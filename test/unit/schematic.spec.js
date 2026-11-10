const { createRunner, createWorkspace } = require('./helpers');
const { readJsonFile } = require('../../src/pl-schematics/utils/json.utils');

function run(options, workspace) {
  return createRunner().runSchematic('pl-schematics', options, workspace);
}

function files(tree) {
  return tree.files.map((f) => f.replace(/^\//, ''));
}

describe('pl-schematics (SchematicTestRunner)', () => {
  it('standalone Angular 19: generates the standalone shell and no NgModule leftovers', async () => {
    const tree = await run({ namePackage: 'my-app', ui: 'material', state: 'ngrx', http: 'interceptor-functional' }, createWorkspace({ major: 19, standalone: true }));
    const all = files(tree);

    expect(all).toContain('src/app/my-app/core/provide-core.ts');
    expect(all).toContain('src/app/app.routes.ts');
    expect(all).not.toContain('src/app/app.module.ts');
    expect(all).not.toContain('src/app/app-routing.module.ts');
    expect(all).not.toContain('src/app/my-app/core/module/initializer.module.ts');
    expect(all).not.toContain('src/app/my-app/component/page/home/home.module.ts');
    expect(all).not.toContain('src/app/my-app/component/page/home/home-routing.module.ts');

    const config = tree.readContent('src/app/app.config.ts');
    expect(config).toContain('provideRouter(routes, withHashLocation())');
    expect(config).toContain('provideCore()');
    expect(config).toContain("providePlShared(appSharedConfig)");
    expect(config).toContain('importProvidersFrom(StateModule)');
    expect(config).toContain('provideAnimationsAsync()');
    expect(config).toContain('provideZoneChangeDetection');

    const root = tree.readContent('src/app/app.component.ts');
    expect(root).toContain('NgxUiLoaderModule');
    expect(root).toContain('RouterOutlet');
    expect(tree.readContent('src/app/app.component.html')).toContain('<ngx-ui-loader');

    expect(tree.readContent('projects/my-app-shared/src/lib/config/shared-lib.config.ts')).toContain('withInterceptors([httpInterceptorFn])');
  });

  it('classic Angular 19: updates app.module.ts (no standalone files)', async () => {
    const tree = await run({ namePackage: 'my-app', state: 'ngrx' }, createWorkspace({ major: 19, standalone: false }));
    const all = files(tree);

    expect(all).toContain('src/app/my-app/core/module/initializer.module.ts');
    expect(all).toContain('src/app/my-app/component/page/home/home.module.ts');
    expect(all).not.toContain('src/app/my-app/core/provide-core.ts');
    expect(all).not.toContain('src/app/app.routes.ts');

    const module = tree.readContent('src/app/app.module.ts');
    expect(module).toContain('SharedModule.forRoot(appSharedConfig)');
    expect(module).toContain('InitializerModule');
    expect(module).toContain('StateModule');
    expect(module).toContain('{ provide: ErrorHandler, useClass: ErrorService }');
    expect(module).toContain('BrowserModule');
    expect(tree.readContent('src/app/app-routing.module.ts')).toContain('HomeModule');
  });

  it('classic Angular 21: uses app-module.ts / app.html naming', async () => {
    const tree = await run({ namePackage: 'my-app' }, createWorkspace({ major: 21, standalone: false }));
    const all = files(tree);

    expect(all).not.toContain('src/app/app.module.ts');
    expect(tree.readContent('src/app/app-module.ts')).toContain('SharedModule.forRoot(appSharedConfig)');
    expect(tree.readContent('src/app/app-routing-module.ts')).toContain('RouterModule.forRoot');
    expect(tree.readContent('src/app/app.html')).toContain('<router-outlet>');
  });

  it('works on the tsconfig.json of ng new (JSONC) and writes the relative path mapping', async () => {
    const tree = await run({ namePackage: 'my-app', state: 'ngrx' }, createWorkspace({ major: 19, standalone: true }));
    const raw = tree.readContent('tsconfig.json');
    expect(raw).toContain('/* To learn more about Typescript configuration file');
    const paths = readJsonFile(tree, 'tsconfig.json').compilerOptions.paths;
    expect(paths['my-app-shared']).toEqual(['./projects/my-app-shared/src/public-api.ts']);
    expect(paths['my-app-ngrx']).toEqual(['./projects/my-app-ngrx/src/public-api.ts']);
  });

  it('namePackage with path: app folder keeps "/", libraries use the kebab-case join', async () => {
    const tree = await run({ namePackage: 'cloud/agic' }, createWorkspace({ major: 19, standalone: true }));
    const all = files(tree);

    expect(all).toContain('src/app/cloud/agic/core/provide-core.ts');
    expect(all).toContain('projects/cloud-agic-shared/src/public-api.ts');
    expect(readJsonFile(tree, 'angular.json').projects['cloud-agic-shared']).toBeDefined();
    // environment: un livello in piu' rispetto a un namePackage a segmento singolo
    expect(tree.readContent('src/app/cloud/agic/core/utils/shared.config.ts')).toContain("from '../../../../../environments/environment'");
    expect(tree.readContent('src/app/app.config.ts')).toContain("from './cloud/agic/core/provide-core'");
  });

  it('adds only pinned dependencies (no "latest") with the Angular-aligned ranges', async () => {
    const tree = await run({ namePackage: 'my-app', ui: 'material', state: 'ngrx', loginSupportConfiguration: 'AZURE-ACTIVE-DIRECT', i18n: 'ngx-translate' }, createWorkspace({ major: 20, standalone: true }));
    const pkg = readJsonFile(tree, 'package.json');
    const all = Object.assign({}, pkg.dependencies, pkg.devDependencies);

    Object.keys(all).forEach((name) => expect(all[name]).not.toBe('latest'));
    expect(all['@angular/material']).toBe('^20.0.0');
    expect(all['@angular/animations']).toBe('^20.1.0'); // stessa numerazione di @angular/core (major.minor del progetto)
    expect(all['@ngrx/store']).toBe('^20.0.0');
    expect(all['ng-packagr']).toBe('^20.0.0');
    expect(all['@ngx-translate/core']).toBe('^17.0.0');
    expect(all['pl-decorator']).toBeDefined();
    expect(all['ngx-ui-loader']).toBeDefined();
    expect(all['@ng-bootstrap/ng-bootstrap']).toBe('^19.0.1');
    expect(all['@microsoft/microsoft-graph-client']).toBeDefined();
    expect(all['@azure/msal-angular']).toBeDefined();
  });

  it('does not add the Graph client nor MSAL without Azure login', async () => {
    const tree = await run({ namePackage: 'my-app' }, createWorkspace({ major: 19, standalone: true }));
    const deps = readJsonFile(tree, 'package.json').dependencies;
    expect(deps['@microsoft/microsoft-graph-client']).toBeUndefined();
    expect(deps['@azure/msal-angular']).toBeUndefined();
    expect(files(tree).some((f) => f.indexOf('/core/msal/') >= 0)).toBe(false);
  });

  it('i18n=none: no ngx-translate dependency and no translate pipe in the shared library', async () => {
    const tree = await run({ namePackage: 'my-app', i18n: 'none' }, createWorkspace({ major: 19, standalone: true }));
    expect(readJsonFile(tree, 'package.json').dependencies['@ngx-translate/core']).toBeUndefined();
    expect(files(tree)).not.toContain('projects/my-app-shared/src/lib/pipe/translate-async.pipe.ts');
    expect(tree.readContent('projects/my-app-shared/src/lib/module/shared.module.ts')).not.toContain('ngx-translate');
  });

  it('fails clearly when --architecture does not match the detected one', async () => {
    let error = null;
    try {
      await run({ namePackage: 'my-app', architecture: 'classic' }, createWorkspace({ major: 19, standalone: true }));
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
    expect(String(error.message)).toContain('Requested --architecture=classic');
  });

  it('fails clearly on an unsupported Angular major', async () => {
    const tree = createWorkspace({ major: 19, standalone: true });
    tree.overwrite('package.json', JSON.stringify({ dependencies: { '@angular/core': '^17.3.0' } }));
    let error = null;
    try {
      await run({ namePackage: 'my-app' }, tree);
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
    expect(String(error.message)).toContain('Angular 17 is not supported');
  });

  it('rejects --tests=jest with a clear error (no Jest setup is generated)', async () => {
    let error = null;
    try {
      await run({ namePackage: 'my-app', tests: 'jest' }, createWorkspace({ major: 19, standalone: true }));
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
    expect(String(error.message)).toContain('--tests=jest is not supported');
  });

  it('rejects an invalid namePackage', async () => {
    let error = null;
    try {
      await run({ namePackage: 'bad name' }, createWorkspace({ major: 19, standalone: true }));
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
  });

  it('is idempotent on a second run (no duplicate imports/providers)', async () => {
    const first = await run({ namePackage: 'my-app', state: 'ngrx' }, createWorkspace({ major: 19, standalone: true }));
    const second = await run({ namePackage: 'my-app', state: 'ngrx' }, first);
    const config = second.readContent('src/app/app.config.ts');
    expect((config.match(/provideCore\(\)/g) || []).length).toBe(1);
    expect((config.match(/importProvidersFrom\(StateModule\)/g) || []).length).toBe(1);
  });
});
