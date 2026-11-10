// test/unit/helpers.js
const path = require('path');
const { Tree } = require('@angular-devkit/schematics');
const { SchematicTestRunner } = require('@angular-devkit/schematics/testing');

const COLLECTION = path.join(__dirname, '..', '..', 'src', 'collection.json');

function createRunner() {
  return new SchematicTestRunner('pl-schematics', COLLECTION);
}

/** tsconfig.json come generato da `ng new` (con commenti /* *\/ e trailing comma). */
const TSCONFIG = `/* To learn more about Typescript configuration file: https://www.typescriptlang.org/docs/handbook/tsconfig-json.html. */
/* To learn more about Angular compiler options: https://angular.dev/reference/configs/angular-compiler-options. */
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "strict": true, // commento di riga
    "target": "ES2022",
  },
  "angularCompilerOptions": {
    "strictTemplates": true
  }
}
`;

/**
 * Workspace minimo "simil ng new".
 * @param {{major:number, standalone:boolean}} opts
 */
function createWorkspace(opts) {
  const major = opts.major || 19;
  const standalone = opts.standalone !== false;
  // Angular >= 20: app.ts/app.html/app-module.ts; Angular 19: app.component.ts/app.module.ts
  const modern = major >= 20;
  const component = modern ? 'app' : 'app.component';
  const className = modern ? 'App' : 'AppComponent';
  const moduleFile = modern ? 'app-module' : 'app.module';
  const routingFile = modern ? 'app-routing-module' : 'app-routing.module';

  const tree = Tree.empty();
  tree.create('package.json', JSON.stringify({
    name: 'app',
    scripts: { build: 'ng build' },
    dependencies: { '@angular/core': '^' + major + '.1.0', rxjs: '~7.8.0' },
    devDependencies: modern ? { '@angular/build': '^' + major + '.0.0' } : { '@angular-devkit/build-angular': '^' + major + '.0.0' },
  }, null, 2));
  tree.create('tsconfig.json', TSCONFIG);
  tree.create('angular.json', JSON.stringify({
    version: 1,
    projects: {
      app: {
        projectType: 'application',
        root: '',
        sourceRoot: 'src',
        prefix: 'app',
        architect: {
          build: {
            builder: modern ? '@angular/build:application' : '@angular-devkit/build-angular:application',
            options: { browser: 'src/main.ts', assets: [{ glob: '**/*', input: 'public' }], styles: ['src/styles.css'] },
            configurations: {
              production: { budgets: [{ type: 'initial', maximumWarning: '500kB', maximumError: '1MB' }] },
            },
          },
        },
      },
    },
  }, null, 2));
  tree.create('src/index.html', '<html><head></head><body><app-root></app-root></body></html>');

  if (standalone) {
    tree.create('src/main.ts', `import { bootstrapApplication } from '@angular/platform-browser';\nimport { appConfig } from './app/app.config';\nimport { ${className} } from './app/${component}';\n\nbootstrapApplication(${className}, appConfig).catch((err) => console.error(err));\n`);
    tree.create('src/app/app.config.ts', `import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';\nimport { provideRouter } from '@angular/router';\n\nimport { routes } from './app.routes';\n\nexport const appConfig: ApplicationConfig = {\n  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]\n};\n`);
    tree.create('src/app/app.routes.ts', `import { Routes } from '@angular/router';\n\nexport const routes: Routes = [];\n`);
    tree.create('src/app/' + component + '.ts', `import { Component } from '@angular/core';\nimport { RouterOutlet } from '@angular/router';\n\n@Component({\n  selector: 'app-root',\n  imports: [RouterOutlet],\n  templateUrl: './${modern ? 'app.html' : 'app.component.html'}',\n  styleUrl: './${modern ? 'app.css' : 'app.component.css'}'\n})\nexport class ${className} {\n  title = 'app';\n}\n`);
  } else {
    tree.create('src/main.ts', `import { platformBrowser } from '@angular/platform-browser';\nimport { AppModule } from './app/${moduleFile}';\n\nplatformBrowser().bootstrapModule(AppModule, {\n  ngZoneEventCoalescing: true,\n}).catch(err => console.error(err));\n`);
    tree.create('src/app/' + moduleFile + '.ts', `import { NgModule } from '@angular/core';\nimport { BrowserModule } from '@angular/platform-browser';\n\nimport { AppRoutingModule } from './${routingFile}';\nimport { ${className} } from './${component}';\n\n@NgModule({\n  declarations: [\n    ${className}\n  ],\n  imports: [\n    BrowserModule,\n    AppRoutingModule\n  ],\n  providers: [],\n  bootstrap: [${className}]\n})\nexport class AppModule { }\n`);
    tree.create('src/app/' + routingFile + '.ts', `import { NgModule } from '@angular/core';\nimport { RouterModule, Routes } from '@angular/router';\n\nconst routes: Routes = [];\n\n@NgModule({\n  imports: [RouterModule.forRoot(routes)],\n  exports: [RouterModule]\n})\nexport class AppRoutingModule { }\n`);
    tree.create('src/app/' + component + '.ts', `import { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-root',\n  standalone: false,\n  templateUrl: './${modern ? 'app.html' : 'app.component.html'}',\n  styleUrl: './${modern ? 'app.css' : 'app.component.css'}'\n})\nexport class ${className} {\n  title = 'app';\n}\n`);
  }

  tree.create('src/app/' + (modern ? 'app.html' : 'app.component.html'), '<h1>Hello</h1>');
  tree.create('src/app/' + (modern ? 'app.css' : 'app.component.css'), '');

  return tree;
}

module.exports = { createRunner, createWorkspace, TSCONFIG, COLLECTION };
