# Changelog

## 4.0.0

Rilascio di compatibilita' con **Angular 19, 20 e 21** (classic e standalone). Lo schematic genera un progetto che compila con `ng build`
(applicazione + librerie `*-shared` / `*-ngrx`). Verificato con la matrice e2e `npm run test:e2e`.

### BREAKING CHANGE

- **Angular supportato: 19, 20, 21.** Angular < 19 (e > 21) viene rifiutato con un errore esplicito; non c'e' piu' nessun fallback su `latest`.
- **Node.js** `^20.19 || ^22.12 || >=24` (prima `>=10.13`).
- **Opzioni in kebab-case da CLI** (`--name-package`, `--enable-sonar-qube`, ...) e `--no-dry-run --no-debug` per scrivere su disco (comportamento di `schematics-cli` 21). Gli script `test:schematic` / `test:schematic:full` sono stati sostituiti da `test:schematic` e `test:e2e`.
- **`architecture`**: nuovo valore di default `auto` (rilevamento da `main.ts`). `classic`/`standalone` devono coincidere con l'app target, altrimenti errore (prima la modalita' standalone era ignorata e venivano generati `app.module.ts`/`app-routing.module.ts` inutilizzati).
- **App standalone**: non vengono piu' generati NgModule (`app.module`, `app-routing.module`, `InitializerModule`, `HomeModule`); la configurazione e' in `app.config.ts` (`provideCore()`, `providePlShared()`), `app.routes.ts` e `core/provide-core.ts`.
- **`SharedModule`**: `forRoot(config)` richiede la configurazione (`SharedLibConfig`, vedi `appSharedConfig`); non importa piu' `HttpClientModule` (HttpClient e interceptor sono registrati da `providePlShared`), non importa piu' `StateModule` (va importato dall'app) e non legge piu' `src/environments/environment` (una libreria non puo' dipendere dall'app).
- **Dipendenze**: versioni pinnate per major di Angular (niente `latest`, con l'unica eccezione di `pl-core-utils-library`, `pl-decorator` e `pl-loading-trace`, sempre `latest` per scelta esplicita); `@ngx-translate/*` ^17 (API `provideTranslateService`, `fallbackLang`), `ngx-ui-loader`, `bootstrap`, `@ng-bootstrap/ng-bootstrap` + `@angular/localize` (richiesti da `pl-core-utils-library`) ora dichiarati. `@microsoft/microsoft-graph-client` solo con login Azure; MSAL aggiornato a `@azure/msal-angular` ^6 / `@azure/msal-browser` ^5; rimosse `popper.js` e `@microsoft/teams-js`.
- **Loader grafico sostituito**: `ngx-ui-loader` non e' piu' montato nella UI generata (resta installato perche' e' peer di `pl-core-utils-library`); al suo posto la libreria `pl-loading-trace` (`latest`): `<pl-loading-overlay source="router" />` + `<pl-loading-overlay source="http" />` nel template del componente root; `PlLoadingModule` (`core/module/pl-loading.module.ts`, `PlLoadingTraceModule.forRoot(...)`) in `AppModule` prima di `SharedModule.forRoot` (classic) o `providePlLoadingTrace(...)` in `app.config.ts` prima di `providePlShared` (standalone). I file `core/utils/UiLoaderConfig.ts`, `UiLoaderHttpConfig.ts`, `UiLoaderRouterConfig.ts` sono sostituiti da `core/utils/pl-loading.config.ts` (`plLoadingTraceOptions`). L'interceptor HTTP del loader e' registrato una sola volta dalla libreria stessa e, per non perdere il conteggio durante retry/refresh-token, deve restare davanti a quello di `SharedModule.forRoot`/`providePlShared`; con `http=interceptor-functional` `providePlShared` ora usa `provideHttpClient(withInterceptorsFromDi(), withInterceptors([httpInterceptorFn]))` (DI prima dei funzionali: l'interceptor MSAL, se presente, avvolge quindi `httpInterceptorFn`).
- **Pacchetto**: `schematics-utilities` rimosso (usa `@schematics/angular/utility`), `@angular-devkit/*` ora in `dependencies` (>=19 <23), `rxjs` dichiarato, `@angular/core` rimosso dalle dipendenze, TypeScript ^5.9 (compatibile con TS 6), `checkVersion` (chiamata `npm view` di rete) rimosso.
- `namePackage`: ammessi percorsi con `/` (es. `cloud/agic`); i nomi delle librerie derivano da una versione kebab-case (`cloud-agic-shared`).
- Percorso del path mapping in `tsconfig.json`: `./projects/<lib>/src/public-api.ts` (relativo).
- `GlobalService`: usa il decorator `Unsubscribe` di `pl-decorator` (prima importava `PLUnsubscribe`, inesistente in `pl-core-utils-library` 2.1.3).

### Corretto

- `readJsonFile` accetta JSONC (commenti e trailing comma del `tsconfig.json` di `ng new`); la scrittura modifica solo le chiavi cambiate e preserva commenti e formattazione.
- Rilevamento dei nomi reali dei file Angular 19 (`app.component.ts`, `app.module.ts`) vs 20+ (`app.ts`, `app.html`, `app-module.ts`).
- `environment.prod.ts` importava `AppEnvironment` da `./environment` (sostituito da `fileReplacements` in produzione): l'interfaccia vive in `environment.model.ts`.
- Template compatibili con `strict`, `noImplicitOverride` e TS recente: `override`, `null` vs `undefined`, tipi espliciti, firme di `PlHttpService`/`PlHttpRequest` di `pl-core-utils-library` 2.1.3, `HttpResponse` vs `ArrayBuffer`.
- `StateModule`: `StoreDevtoolsModule.instrument({ logOnly: !isDevMode() })` (statico, analizzabile dall'AOT; risolve TS-991010/TS-996002).
- Login Azure: `AuthService` implementa `AuthenticationProvider` di Microsoft Graph (rimosso `AuthCodeMSALBrowserAuthenticationProvider`, inesistente), `acquireTokenSilent` con scope, opzioni MSAL compatibili con `msal-browser` 5.
- Builder delle librerie: `@angular/build:ng-packagr` (Angular 20+) o `@angular-devkit/build-angular:ng-packagr` (Angular 19), peer deps `>=19`, `tsconfig.lib.json` senza path mapping ereditato.
- Budget `initial` della build production alzato a 3MB/5MB (il bundle con `pl-core-utils-library` e `pl-loading-trace` superava il default 1MB e il precedente 2MB); polyfill `@angular/localize/init`; entry `assets` per `src/assets` (i18n/mock).
- `ui=bootstrap`: usa `bootstrap.bundle.min.js` (Popper v2) invece di `popper.js` 1.x.
- `i18n=none`: nessuna dipendenza/pipe/modulo ngx-translate.
- `http=interceptor-functional` su app standalone: `httpInterceptorFn` + `provideHttpClient(withInterceptors(...))` (prima identico al classico).
- Spec generati: `waitForAsync` / `TestBed.inject`, `declarations` vs `imports` secondo l'architettura.
- CI generate con Node 22; nomi artefatto da nome libreria sanitizzato.

### Aggiunto

- Test unitari (`npm test`): `SchematicTestRunner` + utils (JSONC, `namePackage`, path mapping, rilevamento standalone/classic, versioni).
- `RouteFakeGuard`: aggiunti `canMatch` e `canActivateChild` (`true` di default, con login Azure delega a `MsalGuard`); le rotte `home` generate usano `canMatch: [RouteFakeGuard]` accanto a `canActivate`. L'interceptor MSAL resta registrato una sola volta (`InitializerModule` / `provideCore`), con login Azure.
- Loader `pl-loading-trace` (vedi BREAKING CHANGE): config `core/utils/pl-loading.config.ts`; il check runtime e2e cerca `<pl-loading-overlay>`.
- Workaround nel classic: `PlLoadingModule` fornisce `PlLoadingRegistryService`, perche' `PlLoadingTraceModule.forRoot` di pl-loading-trace 1.2.x non lo registra (senza, l'overlay darebbe NullInjectorError).
- Matrice e2e riproducibile `tools/e2e-matrix.js` (`npm run test:e2e[:19|:20|:21]`).
- `CHANGELOG.md`, matrice di compatibilita' nel README.

### Rimosso

- Rule/file inutilizzati: `checkVersion`, `add-advanced-logging`, `add-ngrx-module-imports`, `add-root-module-imports`, `add-material-module-imports`, `add-module-to-imports`, `get-prefix-from-angular-json`, `install-package-json-dependencies`, template `app.module.ts`, `update-dependencies.interactive.js` (vuoto).
- Template `core/utils/UiLoaderConfig.ts`, `UiLoaderHttpConfig.ts`, `UiLoaderRouterConfig.ts` (sostituiti da `pl-loading.config.ts`).
