# AI_README.md — Guida di contesto per assistenti AI / LLM

> **Prompt di contesto — incolla questo blocco a un LLM/agente AI prima di chiedergli di lavorare su questo repository o su un progetto generato con questo tool:**
>
> "Stai lavorando con (o su) **pl-schematics**, uno schematic per Angular CLI (`@angular-devkit/schematics`) che **standardizza l'architettura iniziale di un progetto Angular enterprise**. Non è una libreria di componenti UI e non genera business logic applicativa: applica un pattern di progetto (cartelle, moduli, servizi core, autenticazione, gestione errori, HTTP, state management) su un progetto Angular già creato con `ng new`, tramite `ng generate pl-schematics:pl-schematics --name-package=<nome>` (alternativa con schematics-cli: `schematics pl-schematics:pl-schematics ... --no-dry-run --no-debug`; opzioni sempre in kebab-case). Versione 4.x: Angular 19/20/21, app classic (NgModule) e standalone, rilevate automaticamente da `main.ts`. Il risultato è: un layer applicativo `core` (autenticazione MSAL opzionale, interceptor HTTP con timeout, retry e refresh-token, servizio `GlobalService` come punto centrale di dispatch per le chiamate al BE, loader grafico `pl-loading-trace`) e una o due **librerie Angular reali** generate nel workspace (`projects/<nome>-shared` e, se richiesto, `projects/<nome>-ngrx`), non semplici cartelle. Se ti viene chiesto di modificare il **sorgente dello schematic** (questo repo, cartella `src/pl-schematics/files/**`), ricorda che quei file sono **template EJS** (`<% if (...) { %> ... <% } %>`, `<%= variabile %>`), processati con le opzioni dello schema al momento della generazione: non sono codice TypeScript eseguito direttamente da questo repo, ma testo che diventerà codice TypeScript nel progetto target. Se ti viene chiesto di lavorare su un **progetto generato** da questo schematic, segui le convenzioni descritte più sotto (GlobalService come punto di dispatch HTTP, ErrorBean per gli errori, pattern NgRx in `projects/<nome>-ngrx/src/lib`, injection token per configurazione) invece di inventarne di nuove."

> Questo file riassume architettura e convenzioni. Per uso, tabella completa delle opzioni, struttura generata, matrice di compatibilità e rilascio vedi [README.md](./README.md); per le modifiche della 4.0.0 e i limiti noti vedi [CHANGELOG.md](./CHANGELOG.md).

---

## 1. Cos'è pl-schematics

Pacchetto npm (campo `schematics` di `package.json` => `src/collection.json`, schematic `pl-schematics`) che, installato in un progetto Angular CLI, applica un pattern architetturale enterprise:

```sh
ng new my-app                    # progetto Angular standard (19/20/21, classic o standalone)
cd my-app
npm i -D pl-schematics@4
ng generate pl-schematics:pl-schematics --name-package=my-app
```

Non crea un'app da zero: **arricchisce/standardizza** un workspace esistente. L'architettura è rilevata da `main.ts` (`bootstrapApplication` => standalone, `bootstrapModule` => classic); `--architecture` (`auto` di default) se forzato deve coincidere, altrimenti errore.

## 2. Cosa genera (in sintesi)

- **`src/app/<namePackage>/core/`** — layer applicativo, nel progetto (non libreria). `<namePackage>` può contenere `/` (es. `cloud/agic`); le librerie usano il nome kebab `cloud-agic-shared`:
  - `service/auth.service.ts` — login/logout. Con Azure: MSAL (`@azure/msal-angular` ^6, `@azure/msal-browser` ^5) e `AuthenticationProvider` di Microsoft Graph; senza Azure `login()` risponde subito `true` (punto di innesto per un SSO custom).
  - `service/http.service.ts` — wrapper tipizzato di `PlHttpService` (`pl-core-utils-library`): GET/POST/PUT/DELETE/PATCH, varianti `*BG` non interrotte dal routing, STREAM, FORKJOIN, DOWNLOAD.
  - `service/global.service.ts` — **punto centrale di dispatch per le chiamate al BE**: `get/getBg/post/postBg/put/putBg/patch/patchBg/delete` delegano a `HttpService`. I componenti feature iniettano `GlobalService`, non `HttpService`. Centralizza anche gli eventi broadcast del core, gli errori globali e (con Azure) il re-login su 401. Usa `@Unsubscribe()` di `pl-decorator`.
  - `service/error.service.ts` — `ErrorHandler` globale: converte gli errori in `ErrorBean` ed eventi broadcast.
  - `service/router.fake.guard.ts` — `CanMatch`, `CanActivate`, `CanActivateChild`: `true` di default. Con Azure **solo** `canActivate` delega a `MsalGuard` (e solo se `AuthService.applicationType.type === 'web'`, valore non impostato dal template); `canMatch` e `canActivateChild` restano `true`. Le rotte `home` usano `canMatch: [RouteFakeGuard]` e `canActivate: [RouteFakeGuard]`.
  - `initializer/` — `AutenticationLoader` (login + `APP_BOOTSTRAP_TASKS`, vedi §5) e `AmbientModeLoader` (rilevamento ambiente/browser).
  - `provide-core.ts` — **solo standalone**: `provideCore()`.
  - `module/initializer.module.ts` — **solo classic**: equivalente di `provideCore()` (`BASE_URL_API`, config della pl-library, due `APP_INITIALIZER`, MSAL se abilitato). `module/pl-loading.module.ts` — **solo classic**: loader grafico.
  - `msal/` — solo con login Azure: factory, `providePlMsal()` (classic e standalone), token `PL_MSAL_*_FACTORY` per sovrascriverle; `msal-auth.module.ts` solo classic.
  - `utils/shared.config.ts` (`appSharedConfig`, config della libreria shared ricavata dall'environment) e `utils/pl-loading.config.ts` (`plLoadingTraceOptions`).
  - `type/type.event.ts` — eventi broadcast `CORE_TYPE_EVENT`.
- **`src/app/<namePackage>/component/`** — `page/home` (HomeComponent, più `HomeModule` e routing in classic) e cartelle vuote `section/filter`, `section/tab`.
- **`projects/<nome>-shared/`** — libreria Angular (ng-packagr): `SharedModule` + `SharedModule.forRoot(config)` (classic) / `providePlShared(config)` (standalone, in `lib/config/shared-lib.config.ts`) che registrano HttpClient, interceptor e ngx-translate; pipe riusabili; `Utils`/device detector; `ErrorBean`/`ErrorCode`; token `BASE_URL_API` e `APP_BOOTSTRAP_TASKS`; a seconda delle opzioni logging avanzato (`LoggerService`, `LoggerFeature`), sistema di interceptor HTTP e `MaterialModule`. **Non importa mai l'environment dell'app né `StateModule`.**
- **`projects/<nome>-ngrx/`** — solo con `state=ngrx`: `StateModule` + feature `app` (init/loading/error) e `storage` (token/lingua/tema in `localStorage`); `StateModule` emette `storageHydrate()` e `appInit()` al bootstrap.
- Path mapping in `tsconfig.json` verso il sorgente (`./projects/<nome>-shared/src/public-api.ts`): in sviluppo non serve una build separata; `ng build` compila solo l'app, le librerie si compilano con `ng build <nome>-shared` / `<nome>-ngrx`.
- Con le opzioni corrispondenti: `mock-api/` (Express, porta 3001), CI (`azure-pipelines.yml` o `.github/workflows/build.yml`), `sonar-project.properties`, `tools/check-dependencies-on-install.js` (controllo interattivo delle dipendenze, saltato in CI/non-TTY o con `PL_DEPS_CHECK=false`).

## 3. Opzioni (`src/pl-schematics/schema.json`)

Tabella completa con default ed effetti nel README. Punti che contano per chi genera o modifica codice:

- `namePackage` è l'unica opzione obbligatoria. Le altre: `nameCompany` (solo metadato), `project`, `prefix`, `ui` (`none|material|bootstrap`), `logging` (`none|console|advanced`), `state` (`none|ngrx`), `http` (`none|interceptor-classic|interceptor-functional`), `mockApi` (`none|node-express`), `ci` (`none|github-actions|azure-devops`), `architecture` (`auto|classic|standalone`), `i18n` (`none|ngx-translate`, default `ngx-translate`), `tests` (`none|jasmine`; `jest` è rifiutato), `loginSupportConfiguration` (`NONE|AZURE-ACTIVE-DIRECT`), `browserSupported` (`BROWSER.ALL|CHROME|FIREFOX|EDGE|SAFARI`), `enableSonarQube` (`Y|N`), `includeDocumentation`, `strict` (oggi senza effetti). `addSupportBootstrap` è interna (derivata da `ui`).
- **Con `loginSupportConfiguration=AZURE-ACTIVE-DIRECT` e `http=none`, `http` viene forzato a `interceptor-classic`** (l'interceptor MSAL si innesta nel sistema HTTP).
- `tests` influisce solo su script/CI (`ci:test`, step test): gli spec (home, componente root) sono generati comunque, con il test runner di default di `ng new`.
- `logging=none` e `logging=console` sono equivalenti (nessun `LoggerService`, si usa `console.*`).

## 4. Interceptor HTTP, retry e refresh token (`http != 'none'`)

`HttpInterceptorService` (`projects/<nome>-shared/src/lib/interceptor/`, configurazione in `lib/http/`) gestisce **meccanismi indipendenti**:

1. **Timeout** (`defaultTimeout` da `environment.http.timeout`, override con header `timeout`) e **autorizzazione** `Authorization: Bearer` dal `HttpAuthAdapter` (`HTTP_AUTH_ADAPTER`); `x-skip-auth` salta autorizzazione e refresh.
2. **Refresh-token su 401**: richieste concorrenti in attesa del nuovo token, richiesta di refresh riconosciuta da `refreshUrlIncludes` e mai ritentata. L'adapter di default (`LocalStorageAuthAdapterService`) **non implementa il refresh** (`refreshToken()` lancia errore e `logout()` svuota i token e ricarica la pagina): serve un proprio adapter. `http-store-auth-adapter.service.ts` è uno scaffold interamente commentato e non esportato.
3. **Retry generico con backoff esponenziale** (default: 2 tentativi, 500 ms, moltiplicatore 2, status 408/429/500/502/503/504, errori di rete e timeout, solo metodi idempotenti; `x-skip-retry` per escluderlo), configurabile con `HTTP_INTERCEPTOR_CONFIG`.

Registrazione: classic => `provideHttpInterceptor` (in `HTTP_INTERCEPTORS`) da `SharedModule.forRoot`; standalone con `interceptor-functional` => `httpInterceptorFn` in `provideHttpClient(withInterceptorsFromDi(), withInterceptors([httpInterceptorFn]))`.

⚠️ **Non registrare mai `HttpInterceptorService` una seconda volta** (es. in `InitializerModule`/`provideCore`): una doppia registrazione esegue ogni richiesta due volte. L'interceptor MSAL (solo con Azure e `http != none`) è registrato una sola volta in `InitializerModule` / `provideCore()`.

## 5. Bootstrap dell'applicazione (`APP_INITIALIZER`)

`AutenticationLoader` (in `core/initializer/`) blocca il bootstrap finché:
1. `AuthService.login()` non risolve (reale con MSAL, `true` immediato senza);
2. **poi**, tutte le funzioni registrate con il token multi-provider `APP_BOOTSTRAP_TASKS` (opzionale, esportato dalla shared; `Observable<boolean>` o `Promise<boolean>`) non risolvono con successo.

```typescript
providers: [
  {
    provide: APP_BOOTSTRAP_TASKS,
    useFactory: (svc: FeatureFlagsService) => () => svc.load(),
    deps: [FeatureFlagsService],
    multi: true,
  },
]
```

Senza task il comportamento è quello della sola login.

## 6. Convenzioni da rispettare in un progetto derivato

- **Chiamate al BE**: sempre da `GlobalService`, non `HttpService` (salvo funzioni non wrappate: `STREAM`, `FORKJOIN`, `DOWNLOAD`, `BASICHTTP`).
- **Errori**: `ErrorBean`/`ErrorCode` da `<nome>-shared`, mai un bean di errore locale.
- **NgRx**: pattern a 5 file per feature (`state`/`actions`/`reducer`/`selectors`/`effects`) come in `projects/<nome>-ngrx/src/lib/{app,storage}`; registra la feature in `root.state.ts`, `root.reducers.ts`, `root.effects.ts` ed esporta da `public-api.ts`; side effect (localStorage, HTTP) negli effects, mai nel reducer. Per feature lazy si può registrare lo stato nella rotta (`provideState`/`provideEffects`, `StoreModule.forFeature`): lo schematic non lo genera.
- **Login/MSAL**: la scelta è dell'utente in fase di generazione; il codice generato mantiene i due rami (con/senza Azure) tramite `<% if %>`: non rimuoverli quando modifichi i template.
- **Logging**: `LoggerService`/`LoggerFeature` (da `<nome>-shared`) solo se `logging === 'advanced'`; altrimenti `console.debug/warn/error`.
- **Librerie vs app**: ciò che è riusabile (pipe, utility, bean generici, infrastruttura HTTP/NgRx) va nella libreria `shared`/`ngrx`; ciò che è specifico dell'applicazione (AuthService, GlobalService, ErrorService, config) resta in `core/`.
- **Loader grafico**: `pl-loading-trace` (`<pl-loading-overlay source="router" />` e `<pl-loading-overlay source="http" />` nel template root, config in `core/utils/pl-loading.config.ts`). `ngx-ui-loader` NON va montato nella UI: resta solo come peer di `pl-core-utils-library`.

## 7. Note per chi modifica il sorgente dello schematic (questo repo)

- **Flusso** (`index.ts`): `normalizeOptionsSync()` (sincrona, nessun Tree) => una Rule che esegue `resolveWorkspaceOptions()` (progetto, prefix, major Angular, architettura rilevata da `utils/workspace.utils.ts::detectApp`) e solo DOPO costruisce la `chain([...])` con le opzioni definitive: `validateOptions`, `addPackageJsonDependencies`, `logOptions`, `addNgrxLibrary` (se ngrx), `addSharedLibrary`, `addTemplateFiles`, aggiornamenti di `angular.json` (environments, assets, localize, budgets, Material, Bootstrap), `index.html`, script di `package.json`, `scaffoldEmptyFolders`, `updateAppShell`. `normalizeOptionsSync()` va chiamata **prima** di costruire qualunque Rule (le factory leggono `options.sharedLibName`/`ngrxLibName`).
- **Shell dell'app** (`rules/update-app-shell.rule.ts`): non sovrascrive `app.module.ts`/`app.config.ts`, li *modifica* (`utils/ts-edit.utils.ts`: `addImports`, `addToArrayProperty`, idempotenti), preservando le scelte di `ng new` (es. zoneless in Angular 21). Nomi di destinazione reali (Angular 19: `app.component.ts`/`app.module.ts`; 20+: `app.ts`/`app.html`/`app-module.ts`). Template di shell: `files/shell` (html root), `files/shell-classic`, `files/shell-standalone`, `files/shell-spec`.
- **Template per architettura** (manifest `TEMPLATE_FOLDERS` in `add-template-files.rule.ts`): `files/core/module`, `files/core/msal-classic`, `files/home-classic` solo classic; `files/core/standalone` solo standalone; `files/core/msal` con Azure. Nessun file generato deve restare inutilizzato.
- **Versioni**: tabella per major in `utils/versions.utils.ts` (range pinnati; **unica eccezione**: `pl-core-utils-library`, `pl-decorator`, `pl-loading-trace` sempre `latest`; nessun accesso alla rete). Per una nuova major di Angular: aggiungerla a `SUPPORTED_ANGULAR_MAJORS`, verificare i peer (`npm view <pkg>@<v> peerDependencies`) ed eseguire la matrice e2e. `@angular/material|cdk`, `@ngrx/*`, `ng-packagr` usano `^<major>.0.0`; `@angular/localize|animations` `^<major>.<minor>.0` dal `@angular/core` del progetto.
- **JSON**: usare sempre `readJsonFile`/`overwriteJsonFile` (`utils/json.utils.ts`): JSONC-aware, la scrittura tocca solo le chiavi cambiate.
- **Sovrascrittura**: `add-class.rule.ts`/`add-library-class.rule.ts` usano `MergeStrategy.Overwrite` (il flag `--force` non basta a sovrascrivere file esistenti nel Tree): rieseguire lo schematic rigenera `core/` e le librerie.
- **Template EJS e compilazione**: i `.ts` sotto `files/**` sono esclusi dal `tsc` del pacchetto (`tsconfig.json` → `exclude: ["src/*/files/**/*", "src/**/documentation/**/*"]`): `npm run build` non li valida. Gli errori emergono solo generando un progetto e compilandolo (`npm run test:e2e[:19|:20|:21]`, `npm run test:schematic` per una riga singola, `npm run test:e2e:pack` per l'installazione da tarball).
- **Test**: `npm test` = build + `test/unit/*.spec.js` (`SchematicTestRunner`). `tools/e2e-matrix.js` (matrice completa: `ng new` => schematic => `npm install` => `ng build` app + librerie => spec => `ng test` => runtime con `tools/e2e-runtime.js`; porte 3001/4300, Chrome richiesto).
- **Encoding**: alcuni template contengono byte cp1252: modificare preservando i byte (niente riscritture complete con encoding diverso).
- **Loader grafico**: template root `files/shell/app.component.html`; `PlLoadingModule` (`core/module/pl-loading.module.ts`, classic) in `AppModule` prima di `SharedModule.forRoot`, oppure `providePlLoadingTrace(...)` in `app.config.ts` prima di `providePlShared` (standalone); `PlLoadingOverlayComponent` negli `imports` del root standalone (aggiunto da `update-app-shell.rule.ts`). L'interceptor del loader è già registrato in `HTTP_INTERCEPTORS` da `forRoot`/`providePlLoadingTrace`: **non registrarlo di nuovo** (né come classe né come `plLoadingHttpInterceptor` in `withInterceptors`). **Deve avvolgere** l'interceptor di retry/refresh della shared (il suo contatore decrementa a ogni `finalize`): per questo va prima nell'ordine di imports/providers. `PlLoadingRegistryService` è aggiunto a mano nel modulo classic perché `forRoot` 1.2.x non lo fornisce.
- **Cartella `documentation/`**: artefatti compodoc/PDF di una versione precedente, copiati nei progetti generati solo con `includeDocumentation=true`; non descrivono la 4.x e non vanno presi come riferimento.
