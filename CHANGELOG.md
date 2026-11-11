# Changelog

## 4.0.0

Rilascio di compatibilita' con **Angular 19, 20 e 21** (classic e standalone). Lo schematic genera un progetto che compila con `ng build`
(applicazione + librerie `*-shared` / `*-ngrx`). Verificato con la matrice e2e `npm run test:e2e` (con i limiti descritti in [Limiti noti](#limiti-noti)).

### BREAKING CHANGE

- **Angular supportato: 19, 20, 21.** Angular < 19 (e > 21) viene rifiutato con un errore esplicito; non c'e' piu' nessun fallback su `latest`.
- **Node.js** `^20.19 || ^22.12 || >=24` (prima `>=10.13`).
- **Librerie Angular reali**: il codice condiviso non e' piu' una cartella dentro l'app (`src/app/<namePackage>/shared`) ma la libreria `projects/<nome>-shared` (e, con `state=ngrx`, `projects/<nome>-ngrx`), registrata in `angular.json` (ng-packagr) e in `tsconfig.json` con path mapping `<nome>-shared` / `<nome>-ngrx` verso il sorgente. Le due librerie sono indipendenti; gli import nell'app usano il nome della libreria.
- **Opzioni in kebab-case da CLI** (`--name-package`, `--enable-sonar-qube`, ...) e `--no-dry-run --no-debug` per scrivere su disco con `schematics-cli` 21 (con `ng generate` si scrive su disco di default). Gli script `test:schematic` / `test:schematic:full` sono stati sostituiti da `test:schematic` e `test:e2e`.
- **`architecture`**: nuovo valore di default `auto` (rilevamento da `main.ts`). `classic`/`standalone` devono coincidere con l'app target, altrimenti errore (prima la modalita' standalone era ignorata e venivano generati `app.module.ts`/`app-routing.module.ts` inutilizzati).
- **`tests=jest` rifiutato** con un errore esplicito: non viene generato alcun setup Jest. L'opzione `tests` influisce solo su script e CI generati; gli spec usano il test runner di default di `ng new` (Karma/Jasmine su Angular 19-20, Vitest su 21).
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
- `InitializerModule.forRoot()` (classic): ora tipizzato `ModuleWithProviders<InitializerModule>` e privo della chiave inesistente `import` nel valore restituito.
- Login Azure: `AuthService` implementa `AuthenticationProvider` di Microsoft Graph (rimosso `AuthCodeMSALBrowserAuthenticationProvider`, inesistente), `acquireTokenSilent` con scope, opzioni MSAL compatibili con `msal-browser` 5. `msal-browser` 5 sincronizza gli account tra tab da solo e non espone piu' `enableAccountStorageEvents`: `AuthService` lo invoca in modo opzionale (`enableAccountStorageEvents?.()`), cosi' il bootstrap non si rompe.
- Builder delle librerie: `@angular/build:ng-packagr` (Angular 20+) o `@angular-devkit/build-angular:ng-packagr` (Angular 19), peer deps `>=19`, `tsconfig.lib.json` senza path mapping ereditato.
- Budget `initial` della build production alzato a 3MB/5MB (il bundle con `pl-core-utils-library` e `pl-loading-trace` superava il default 1MB e il precedente 2MB); polyfill `@angular/localize/init`; entry `assets` per `src/assets` (i18n/mock).
- `ui=bootstrap`: usa `bootstrap.bundle.min.js` (Popper v2) invece di `popper.js` 1.x.
- `i18n=none`: nessuna dipendenza/pipe/modulo ngx-translate.
- `http=interceptor-functional` su app standalone: `httpInterceptorFn` + `provideHttpClient(withInterceptors(...))` (prima identico al classico).
- Spec generati: `waitForAsync` / `TestBed.inject`, `declarations` vs `imports` secondo l'architettura. Nelle app classic lo spec di `HomeComponent` importa `HomeModule` (il componente non e' standalone e usa la pipe `translate`: senza il modulo falliva su Angular 21 con Vitest/AOT).
- CI generate con Node 22; nomi artefatto da nome libreria sanitizzato.

### Aggiunto

- **Commenti JSDoc su tutto il codice** dello schematic e dei template (funzioni, metodi, costruttori con `@author`, `@param`, `@returns`, separatori, descrizione di classi, interface, enum, token e moduli). Nessuna modifica funzionale (verificato token per token sui file `.ts`).
- Test unitari (`npm test`): `SchematicTestRunner` + utils (JSONC, `namePackage`, path mapping, rilevamento standalone/classic, versioni, guard/interceptor MSAL, idempotenza).
- `RouteFakeGuard`: aggiunti `canMatch` e `canActivateChild` (sempre `true`); con login Azure solo `canActivate` delega a `MsalGuard` (un unico punto di protezione della rotta). Le rotte `home` generate usano `canMatch: [RouteFakeGuard]` accanto a `canActivate`. L'interceptor MSAL resta registrato una sola volta (`InitializerModule` / `provideCore`), con login Azure.
- Loader `pl-loading-trace` (vedi BREAKING CHANGE): config `core/utils/pl-loading.config.ts`; il check runtime e2e cerca `<pl-loading-overlay>`.
- Workaround nel classic: `PlLoadingModule` fornisce `PlLoadingRegistryService`, perche' `PlLoadingTraceModule.forRoot` di pl-loading-trace 1.2.x non lo registra (senza, l'overlay darebbe NullInjectorError).
- Matrice e2e riproducibile `tools/e2e-matrix.js` (`npm run test:e2e[:19|:20|:21]`): `ng new` => schematic => `npm install` => `ng build` (app + librerie) => spec => `ng test` => verifica runtime (`tools/e2e-runtime.js`, Chrome headless, porte 3001/4300). Script `npm run test:e2e:pack` (`tools/e2e-pack.js`): installazione "da utente" (`npm pack`, `ng new`, installazione del tarball, `ng generate pl-schematics:pl-schematics`, `ng build`).
- `README.md` riscritto per la 4.0 (requisiti, uso, opzioni, struttura generata, MSAL, interceptor, loader, NgRx, sviluppo e rilascio) con indice, guida rapida di primo avvio, albero commentato, test e build e FAQ; nuova guida con esempi passo passo `docs/GUIDA.md` (GlobalService, NgRx, rotte lazy, bootstrap tasks, interceptor, loader, MSAL, libreria shared); `AI_README.md` allineato; `CHANGELOG.md`.

### Rimosso

- Rule/file inutilizzati: `checkVersion`, `add-advanced-logging`, `add-ngrx-module-imports`, `add-root-module-imports`, `add-material-module-imports`, `add-module-to-imports`, `get-prefix-from-angular-json`, `install-package-json-dependencies`, template `app.module.ts`, template vuoto `files/dependency-updater/tools/update-dependencies.interactive.js`.
- Template `core/utils/UiLoaderConfig.ts`, `UiLoaderHttpConfig.ts`, `UiLoaderRouterConfig.ts` (sostituiti da `pl-loading.config.ts`).

### Limiti noti

Stato della verifica al momento del rilascio, descritto senza arrotondamenti.

- **Matrice e2e su Angular 21**: eseguita sul codice finale, 12 righe PASS su 14 al primo giro. I 2 FAIL:
  - `standalone-bootstrap`: timeout intermittente dei worker di Vitest sotto carico; la riga passa se rilanciata da sola.
  - `classic-azure`: errore intermittente `BrowserAuthError: interaction_in_progress` nel controllo runtime; causa non ancora chiarita, possibile artefatto del test, che blocca il redirect verso `login.microsoftonline.com`.
- **Angular 19 e 20**: verificati sul codice finale solo in parte (al momento della stesura, 8 righe `ng19` PASS in build + test; le restanti righe di Angular 19 e quelle di Angular 20 non sono state completate sul codice finale).
- `http-store-auth-adapter.service.ts` (adapter di autenticazione basato su NgRx) e' ancora uno **scaffold interamente commentato** e non e' esportato dalla libreria shared.
- L'**interceptor MSAL con `http=interceptor-functional`** non e' stato provato a runtime.
- Il login Azure e' verificato solo senza credenziali reali (il runtime e2e controlla che il bootstrap tenti il redirect verso `login.microsoftonline.com` senza errori applicativi non gestiti): il flusso di autenticazione completo non e' coperto da test automatici.
- `LocalStorageAuthAdapterService` (adapter di default) non implementa il refresh del token: `refreshToken()` risponde sempre con errore e, su un 401, `logout()` svuota i token e ricarica la pagina. Un refresh reale richiede un adapter fornito dall'applicazione.
- `AuthService.applicationType.type` non e' valorizzato dal codice generato (default `''`): con login Azure `RouteFakeGuard.canActivate` delega a `MsalGuard` solo se l'applicazione lo imposta a `'web'`; la login all'avvio e' comunque imposta dall'`APP_INITIALIZER`.
- Le opzioni `nameCompany` e `strict` sono accettate ma non hanno effetti sul codice generato. `logging=none` e `logging=console` sono equivalenti.
- `pl-core-utils-library`, `pl-decorator` e `pl-loading-trace` sono `latest`: le versioni verificate sono `pl-core-utils-library` 2.1.3 e `pl-loading-trace` 1.2.x; versioni successive non sono coperte dalla matrice.
- `includeDocumentation=true` copia nel progetto la cartella `documentation/` del pacchetto (documentazione compodoc dell'applicazione generata, in `pl-schematics/document/`).
