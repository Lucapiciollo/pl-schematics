# pl-schematics

Schematic per Angular CLI che **standardizza l'architettura iniziale di un progetto Angular enterprise**. Non e' una libreria di componenti UI e non genera logica di business: su un workspace creato con `ng new` applica un pattern di progetto gia' collaudato, composto da:

- un layer applicativo `core` (inizializzazione, autenticazione, gestione errori, accesso al BE);
- due **librerie Angular reali** nel workspace (`projects/<nome>-shared` e, opzionalmente, `projects/<nome>-ngrx`);
- configurazione di `angular.json`, `tsconfig.json`, `package.json`, environment, i18n, loader grafico, CI, mock API e Sonar, a scelta.

Si rivolge ai team che avviano (o allineano) piu' applicazioni Angular con la stessa struttura. Il codice generato si appoggia a `pl-core-utils-library`, `pl-decorator` e `pl-loading-trace` (vedi [Matrice di compatibilita'](#matrice-di-compatibilita)).

> Versione **4.0.0**. Il pacchetto e' stato riscritto per Angular 19-21: le versioni 3.x e precedenti non sono supportate. L'elenco delle modifiche e delle BREAKING CHANGE e' in [CHANGELOG.md](./CHANGELOG.md); le convenzioni per assistenti AI/LLM sono in [AI_README.md](./AI_README.md).

## Requisiti

| Elemento | Versione |
|---|---|
| Angular (progetto di destinazione) | **19, 20 o 21**, applicazione *classic* (NgModule) o *standalone* |
| Node.js | `^20.19.0 \|\| ^22.12.0 \|\| >=24.0.0` (campo `engines`) |
| Angular CLI | quella del progetto (`ng new` con Angular 19, 20 o 21) |

Angular minore di 19 o maggiore di 21 viene rifiutato con un errore esplicito. L'architettura (classic o standalone) viene **rilevata** da `main.ts` (`bootstrapModule` => classic, `bootstrapApplication` => standalone).

## Installazione e uso

Lo schematic non crea l'applicazione: serve prima un workspace Angular CLI.

```sh
ng new my-app                      # Angular 19/20/21; classic con --standalone=false
cd my-app
npm install -D pl-schematics@4
ng generate pl-schematics:pl-schematics --name-package=my-app
npm install                        # se l'installazione non e' stata eseguita dalla CLI
ng build
```

Note sull'esecuzione:

- Le opzioni da riga di comando vanno in **kebab-case** (`--name-package`, `--login-support-configuration`, `--enable-sonar-qube`, ...). I valori sono quelli della [tabella opzioni](#opzioni).
- `--name-package` e' l'unica opzione obbligatoria. Se le altre opzioni con prompt non sono indicate, la CLI le chiede in modo interattivo; con `--no-interactive` si usano i valori di default.
- Esempio con piu' opzioni:

  ```sh
  ng generate pl-schematics:pl-schematics --name-package=my-app \
    --ui=material --state=ngrx --http=interceptor-classic --logging=advanced \
    --login-support-configuration=AZURE-ACTIVE-DIRECT --no-interactive
  ```

- Alternativa con `schematics-cli` (pacchetto `@angular-devkit/schematics-cli`, non incluso nel progetto: `npm install -D @angular-devkit/schematics-cli`): per scrivere su disco servono **`--no-dry-run --no-debug`** (con `schematics-cli` il default e' la simulazione).

  ```sh
  npx schematics pl-schematics:pl-schematics --name-package=my-app --no-dry-run --no-debug
  ```

  Con `ng generate` la simulazione (`--dry-run`) e' invece disattiva di default: i file vengono scritti.
- Lo schematic **sovrascrive** i file che genera se esistono gia' (template di `core/`, librerie, environment); le modifiche a `angular.json`, `tsconfig.json`, `package.json`, `app.module.ts` / `app.config.ts` sono invece puntuali e idempotenti (nessun import o provider duplicato alla seconda esecuzione).
- `--project` seleziona l'applicazione di destinazione; in sua assenza si usa il `defaultProject` di `angular.json` o, altrimenti, la prima applicazione. Un progetto di tipo libreria viene rifiutato.
- Il componente root deve usare `templateUrl` (default di `ng new`): con un template inline lo schematic si ferma con un errore, perche' deve aggiungere i due overlay del loader.

### `namePackage` con percorso

`--name-package=cloud/agic` e' ammesso: uno o piu' segmenti separati da `/` (lettere, numeri, `-`, `_`, primo carattere alfanumerico). La cartella applicativa e' `src/app/cloud/agic/`; i nomi delle librerie derivano da una versione kebab-case (minuscolo, `_` => `-`, segmenti uniti con `-`): `cloud-agic-shared` e `cloud-agic-ngrx`. Valori non validi (`a//b`, `../x`, spazi, ...) sono rifiutati.

## Opzioni

Tutte le opzioni sono definite in [`src/pl-schematics/schema.json`](./src/pl-schematics/schema.json).

| Opzione (CLI) | Valori | Default | Effetto |
|---|---|---|---|
| `namePackage` (`--name-package`) | stringa, uno o piu' segmenti separati da `/` | **obbligatoria** | Cartella `src/app/<namePackage>` e base dei nomi delle librerie |
| `nameCompany` (`--name-company`) | stringa | `mycompany` | Solo metadato: oggi non e' usato dai template |
| `project` (`--project`) | nome del progetto in `angular.json` | `defaultProject` o prima applicazione | Applicazione di destinazione |
| `prefix` (`--prefix`) | stringa | prefix del progetto (altrimenti `app`) | Selettore dei componenti generati (es. `app-home`) |
| `ui` (`--ui`) | `none`, `material`, `bootstrap` | `none` | `material`: `MaterialModule` nella libreria shared, tema `indigo-pink`, font in `index.html`, animazioni. `bootstrap`: script e stili Bootstrap 5 + Font Awesome in `angular.json` |
| `logging` (`--logging`) | `none`, `console`, `advanced` | `console` | `advanced` genera `LoggerService` e relative classi nella libreria shared; `none` e `console` sono equivalenti (i servizi usano `console.debug/warn/error`) |
| `state` (`--state`) | `none`, `ngrx` | `none` | `ngrx` genera la libreria `<nome>-ngrx` e aggiunge `@ngrx/*` |
| `http` (`--http`) | `none`, `interceptor-classic`, `interceptor-functional` | `none` | Genera il sistema di interceptor HTTP (retry, refresh token, timeout) nella libreria shared. Con login Azure e `none` viene forzato `interceptor-classic` |
| `mockApi` (`--mock-api`) | `none`, `node-express` | `none` | Genera `mock-api/` (Express) in radice e lo script `mock-api` |
| `ci` (`--ci`) | `none`, `github-actions`, `azure-devops` | `none` | `.github/workflows/build.yml` oppure `azure-pipelines.yml` (Node 22) e script `ci:*` |
| `architecture` (`--architecture`) | `auto`, `classic`, `standalone` | `auto` | `auto` la rileva da `main.ts`; un valore diverso da quello rilevato ferma lo schematic con un errore |
| `i18n` (`--i18n`) | `none`, `ngx-translate` | `ngx-translate` | `ngx-translate` ^17, `it.json` in `src/assets/public/i18n/`, lingua di default `it`. `none`: nessuna dipendenza, pipe o modulo di traduzione |
| `tests` (`--tests`) | `none`, `jasmine` (`jest` e' **rifiutato**) | `jasmine` | Influisce solo sugli script/CI generati (`ci:test`, step "Run tests"); gli spec (home e componente root) sono generati comunque e usano il test runner di default di `ng new` (Karma/Jasmine su Angular 19-20, Vitest su 21). `jest` produce un errore: non viene generato alcun setup Jest |
| `loginSupportConfiguration` (`--login-support-configuration`) | `NONE`, `AZURE-ACTIVE-DIRECT` | `NONE` | Abilita MSAL (vedi [Autenticazione](#autenticazione-msal-opzionale)) |
| `browserSupported` (`--browser-supported`) | `BROWSER.ALL`, `BROWSER.CHROME`, `BROWSER.FIREFOX`, `BROWSER.EDGE`, `BROWSER.SAFARI` | `BROWSER.ALL` | Valore di `BROWSER_VALID` passato a `pl-core-utils-library` (browser su cui il portale parte) |
| `enableSonarQube` (`--enable-sonar-qube`) | `Y`, `N` | `N` | `sonar-project.properties`, dipendenza `sonar-scanner` e script `sonar` |
| `includeDocumentation` (`--include-documentation`) | booleano | `false` | Copia nel progetto la cartella `documentation/` del pacchetto in `pl-schematics/document/` (documentazione storica, non aggiornata alla 4.x) |
| `strict` (`--strict`) | booleano | `false` | Oggi non produce effetti: il codice generato compila sia con `ng new --strict` sia con `--strict false` |

`addSupportBootstrap` e' un'opzione interna (derivata da `ui`, non visibile): non va passata.

## Cosa viene generato

Esempio per `--name-package=my-app --state=ngrx` (le parti opzionali sono indicate):

```
<workspace>/
├── angular.json                         # + progetti my-app-shared / my-app-ngrx, budget, assets, polyfill @angular/localize, fileReplacements
├── tsconfig.json                        # + path mapping my-app-shared / my-app-ngrx
├── package.json                         # + dipendenze e script (build-dev, build-prod, deps:check, ...)
├── azure-pipelines.yml | .github/workflows/build.yml   # ci
├── sonar-project.properties             # enable-sonar-qube=Y
├── mock-api/                            # mock-api=node-express
├── tools/check-dependencies-on-install.js
├── pl-schematics/document/              # include-documentation=true
├── projects/
│   ├── my-app-shared/                   # libreria Angular (ng-packagr)
│   │   └── src/{public-api.ts, lib/{module,config,pipe,utils,bean,tokens, logging*, http*, interceptor*, material*}}
│   └── my-app-ngrx/                     # solo state=ngrx
│       └── src/{public-api.ts, lib/{state.module.ts, root.*.ts, app/, storage/}}
└── src/
    ├── assets/public/{i18n/it.json, mock/example/api/files/get.json}
    ├── environments/{environment.ts, environment.prod.ts, environment.model.ts}
    └── app/
        ├── app.module.ts + app-routing.module.ts   (classic)   |   app.config.ts + app.routes.ts   (standalone)
        └── my-app/
            ├── core/
            │   ├── service/{auth, error, global, http}.service.ts, router.fake.guard.ts
            │   ├── initializer/{AmbientModeLoader.ts, AutenticationLoader.ts}
            │   ├── module/{initializer.module.ts, pl-loading.module.ts}   # solo classic
            │   ├── provide-core.ts                                        # solo standalone
            │   ├── msal/                                                  # solo login Azure
            │   ├── type/type.event.ts
            │   └── utils/{shared.config.ts, pl-loading.config.ts}
            └── component/
                ├── page/home/                # HomeComponent (+ HomeModule e routing se classic), spec inclusi
                └── section/{filter,tab}/     # cartelle vuote (.gitkeep)
```

`*` = solo se l'opzione corrispondente e' attiva (`logging=advanced`, `http != none`, `ui=material`). Con `i18n=none` la pipe `translate-async` non viene generata. I nomi reali dei file dell'app sono letti dal progetto (Angular 19: `app.component.ts`, `app.module.ts`; Angular 20+: `app.ts`, `app.html`, `app-module.ts`).

### Librerie `shared` e `ngrx`

Sono librerie Angular vere (`ng-packagr`), non semplici cartelle. Lo schematic le registra in `angular.json` (builder `@angular/build:ng-packagr` su Angular 20+, `@angular-devkit/build-angular:ng-packagr` su Angular 19) e in `tsconfig.json` con un path mapping **verso il sorgente**, quindi non serve una build separata in sviluppo:

```json
"paths": {
  "my-app-shared": ["./projects/my-app-shared/src/public-api.ts"],
  "my-app-ngrx":   ["./projects/my-app-ngrx/src/public-api.ts"]
}
```

`ng build` compila solo l'applicazione; le librerie si compilano a parte (`ng build my-app-shared`, `ng build my-app-ngrx`). Le due librerie sono indipendenti: la shared **non** importa `StateModule` ne' l'environment dell'app. La configurazione le arriva da `appSharedConfig` (`core/utils/shared.config.ts`, legge l'environment):

- classic: `SharedModule.forRoot(appSharedConfig)` in `AppModule`;
- standalone: `providePlShared(appSharedConfig)` in `app.config.ts`.

La shared contiene `SharedModule`, le pipe (`comma-decimal`, `currency-format`, `localized-date`, `safe`, `truncate`, ...), `Utils` e costanti di device detection, `ErrorBean`/`ErrorCode`, i token `BASE_URL_API` e `APP_BOOTSTRAP_TASKS` e, a seconda delle opzioni, logging avanzato, interceptor HTTP e `MaterialModule`.

### Modifiche ai file esistenti

- **Classic**: `app.module.ts` riceve `PlLoadingModule`, `SharedModule.forRoot(appSharedConfig)`, `AppRoutingModule`, `InitializerModule` (piu' `StateModule` con NgRx, `BrowserAnimationsModule` con Material) e il provider `ErrorHandler` => `ErrorService`. Il routing usa l'hash (`useHash: true`).
- **Standalone**: `app.config.ts` riceve `provideRouter(routes, withHashLocation())`, `providePlLoadingTrace(...)`, `providePlShared(...)`, `provideCore()` (piu' `importProvidersFrom(StateModule)` con NgRx, `provideAnimationsAsync()` con Material); il componente root importa `RouterOutlet` e `PlLoadingOverlayComponent`.
- Il template del componente root e' sostituito da quello dello schematic (i due `<pl-loading-overlay>` e il `<router-outlet>`); lo spec del componente root viene riscritto di conseguenza.
- `angular.json`: `fileReplacements` di `environment.ts` => `environment.prod.ts` in production, budget `initial` a 3MB/5MB, polyfill `@angular/localize/init`, entry `assets` per `src/assets`, tema/stili per Material o Bootstrap.
- `package.json`: dipendenze (vedi [Matrice](#matrice-di-compatibilita)) e script `build-dev`, `build-prod`, `typedoc`, `deps:check`, `deps:update`, `postinstall` (controllo dipendenze), `sonar`, `mock-api`, `ci:install`, `ci:build`, `ci:test` (questi ultimi in base alle opzioni).

Il controllo dipendenze (`tools/check-dependencies-on-install.js`, eseguito da `postinstall`) e' **interattivo**: chiede se cercare aggiornamenti npm; e' saltato in CI, in terminali non interattivi e con `PL_DEPS_CHECK=false`.

## Il codice generato

### Inizializzazione e bootstrap bloccante

L'app non parte finche' non terminano gli `APP_INITIALIZER` di `core`:

1. `AutenticationLoader`: esegue `AuthService.login()`; solo dopo, tutte le funzioni registrate con il token multi-provider `APP_BOOTSTRAP_TASKS` (esportato dalla shared; `Observable<boolean>` o `Promise<boolean>`, eseguite in parallelo). Se la login o anche un solo task fallisce, il portale non parte. Senza task il comportamento e' quello della sola login.
2. `AmbientModeProviderFactory`: rilevamento di ambiente e browser tramite `PlAmbientModeLoaderService`.

In classic sono provider di `InitializerModule`; in standalone di `provideCore()` (`provideAppInitializer`). Entrambi registrano inoltre `BASE_URL_API` (da `environment.http.api.baseUrl`), `BROWSER_VALID`, `DISABLE_LOG`, `MAX_CACHE_AGE`, `CACHE_TAG`, `DEFAULT_PATH_MOCK` di `pl-core-utils-library` e istanziano subito `GlobalService`.

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

### `GlobalService`: punto di dispatch verso il BE

I componenti iniettano `GlobalService` e non `HttpService`: espone `get`, `getBg`, `post`, `postBg`, `put`, `putBg`, `patch`, `patchBg`, `delete` (le varianti `*Bg` non vengono interrotte dal cambio di rotta), piu' `getProgression` e `callMock`. Delega a `HttpService`, wrapper tipizzato di `PlHttpService` (`pl-core-utils-library`), che mantiene anche `STREAM`, `FORKJOIN`, `DOWNLOAD`. `GlobalService` ascolta inoltre gli eventi broadcast del core (errori, redirect, cache HTTP, eventi MSAL) e li registra nel log; con login Azure, su un 401 rilancia `AuthService.login()` e mette a disposizione `getUserName()` (Microsoft Graph). Gli errori sono `ErrorBean`/`ErrorCode` (dalla libreria shared), prodotti dal gestore globale `ErrorService` (`ErrorHandler` di Angular).

### HTTP interceptor: timeout, retry e refresh token

Con `http != none` la shared contiene `HttpInterceptorService` (in `lib/interceptor/`) con la sua configurazione (`lib/http/`):

- **classic** (`interceptor-classic`, e `interceptor-functional` su app classic): registrato in `HTTP_INTERCEPTORS` da `provideHttpInterceptor(...)`, richiamato da `SharedModule.forRoot`;
- **standalone con `interceptor-functional`**: `httpInterceptorFn` con `provideHttpClient(withInterceptorsFromDi(), withInterceptors([httpInterceptorFn]))`.

Va registrato **una sola volta** (e' gia' fatto da `SharedModule.forRoot` / `providePlShared`): una doppia registrazione esegue ogni richiesta due volte.

| Meccanismo | Comportamento |
|---|---|
| Autorizzazione | Aggiunge `Authorization: Bearer <token>` letto dall'`HttpAuthAdapter` (`HTTP_AUTH_ADAPTER`); un header `Authorization` impostato dal chiamante non viene sovrascritto; con l'header `x-skip-auth` la richiesta passa senza token e senza gestione del 401 (resta timeout/retry) |
| Timeout | `defaultTimeout` (da `environment.http.timeout`, default 30000 ms), sovrascrivibile per richiesta con l'header `timeout` |
| Retry | Backoff esponenziale: `enableRetry: true`, `maxRetryAttempts: 2`, `retryDelayMs: 500`, `retryBackoffMultiplier: 2`, `maxRetryDelayMs: 8000`; su timeout, errori di rete (status 0) e status `408, 429, 500, 502, 503, 504`; solo metodi idempotenti (`retryOnlyIdempotentMethods: true`); disattivabile per richiesta con `x-skip-retry` |
| Refresh token su 401 | Una sola richiesta di refresh alla volta, le altre restano in attesa del nuovo token; la richiesta di refresh e' riconosciuta da `refreshUrlIncludes` (`environment.http.api.refreshToken`) e non viene mai ritentata |

I parametri si cambiano passando una configurazione parziale (`HttpInterceptorConfig`) a `provideHttpInterceptor` / `provideHttpInterceptorConfig`, che accettano anche un provider alternativo per l'adapter.

> **Attenzione al refresh token.** L'adapter di default, `LocalStorageAuthAdapterService`, legge e scrive `token` / `refreshToken` nel `localStorage`, ma il suo `refreshToken()` restituisce sempre errore ("Refresh token endpoint is not configured"): su un 401 viene quindi eseguito `logout()` (cancella i token e ricarica la pagina). Per un refresh reale va fornito un proprio `HttpAuthAdapter` con `refreshToken()` implementato. `http-store-auth-adapter.service.ts` e' solo uno **scaffold interamente commentato** (adapter basato su NgRx), non esportato: non e' utilizzabile cosi' com'e'.

### Autenticazione MSAL (opzionale)

Con `--login-support-configuration=AZURE-ACTIVE-DIRECT` (installa `@azure/msal-angular` ^6, `@azure/msal-browser` ^5 e `@microsoft/microsoft-graph-client`):

- `environment.ts` contiene il blocco `azure` con valori segnaposto (`CHANGE_ME_CLIENT_ID`, `CHANGE_ME_TENANT_ID`, `redirectUri`, `consentScopes`): vanno compilati prima dell'avvio.
- `core/msal/` contiene le factory di istanza, guard e interceptor config (`MSALInstanceFactory`, `MSALGuardConfigFactory`, `MSALInterceptorConfigFactory`, con `cacheLocation: 'localStorage'` e interazione `Redirect`) e `providePlMsal()`. Le factory sono sovrascrivibili tramite i token `PL_MSAL_INSTANCE_FACTORY`, `PL_MSAL_GUARD_CONFIG_FACTORY`, `PL_MSAL_INTERCEPTOR_CONFIG_FACTORY`. In classic c'e' in piu' `MsalAuthModule.forRoot()`, importato da `InitializerModule`.
- `AuthService` implementa la login (gestione del redirect, `acquireTokenSilent` con gli scope di `environment.azure.scope.consentScopes`, fallback a redirect/popup), il logout e l'`AuthenticationProvider` di Microsoft Graph. Il `APP_INITIALIZER` bloccante di cui sopra e' cio' che impone la login all'avvio; senza Azure `login()` risponde subito `true` (login "bypassata", punto di innesto per un SSO custom).
- L'**interceptor MSAL e' registrato una sola volta** (`InitializerModule` / `provideCore()`), solo se `http != none` (con Azure e `http=none` viene forzato `interceptor-classic`). Sceglie tra `MsalInterceptor` (default) e `HttpInterceptorFakeService` quando `AuthService.applicationType.type === 'teams'`. Ordine degli interceptor: con `interceptor-classic` loader => retry/refresh della shared => MSAL; con `interceptor-functional` su standalone (interceptor DI prima dei funzionali) loader => MSAL => `httpInterceptorFn`. L'interceptor MSAL con `interceptor-functional` non e' stato provato a runtime.
- La `RouteFakeGuard` delega a `MsalGuard` solo in `canActivate` e solo se `AuthService.applicationType.type === 'web'`. Il template non valorizza `applicationType` (default `''`): per attivare la delega l'applicazione deve impostare `AuthService.applicationType.type = 'web'` all'avvio.

### Loader grafico (`pl-loading-trace`)

Il loader visibile e' la libreria [`pl-loading-trace`](https://www.npmjs.com/package/pl-loading-trace) (`ngx-ui-loader` non e' piu' montato nella UI: resta installato solo perche' e' peer di `pl-core-utils-library`).

- Il template del componente root contiene `<pl-loading-overlay source="router" />` (barra al cambio di rotta) e `<pl-loading-overlay source="http" />` (spinner durante le chiamate di rete), una sola volta.
- La configurazione e' in `core/utils/pl-loading.config.ts` (`plLoadingTraceOptions`, sezioni `shared`, `http`, `router`; default: `debounceMs: 200`, spinner modale per HTTP, barra per le rotte).
- Classic: `PlLoadingModule` (`core/module/pl-loading.module.ts`) importato in `AppModule` **prima** di `SharedModule.forRoot`. Standalone: `providePlLoadingTrace(plLoadingTraceOptions)` in `app.config.ts` **prima** di `providePlShared`.
- L'interceptor HTTP del loader e' registrato dalla libreria stessa: non aggiungerlo di nuovo. Deve restare **davanti** a quello di retry/refresh della shared, altrimenti ogni tentativo fallito decrementerebbe il contatore e nasconderebbe lo spinner. Per questo l'ordine degli import/provider generato non va invertito.

### NgRx (`state=ngrx`)

La libreria `<nome>-ngrx` contiene un esempio completo e funzionante:

- feature `app` (`initialized`, `loading`, `error`, con `appInit` => `appInitSuccess`) e feature `storage` (token, lingua e tema persistiti in `localStorage` da `StorageService` e `StorageEffects`);
- `StateModule` (`StoreModule.forRoot`, `EffectsModule.forRoot`, `StoreDevtoolsModule`) che al bootstrap emette `storageHydrate()` e `appInit()`; va importato dall'app (lo fa lo schematic in `AppModule` / `app.config.ts`).

**Aggiungere una feature**: crea i 5 file `<feature>.state.ts`, `<feature>.actions.ts`, `<feature>.reducer.ts`, `<feature>.selectors.ts`, `<feature>.effects.ts` in una nuova cartella della libreria, aggiungi la feature a `RootState` (`root.state.ts`), a `rootReducers` (`root.reducers.ts`) e a `rootEffects` (`root.effects.ts`), ed esportali da `public-api.ts`. I side effect (storage, HTTP) vanno negli effects, mai nel reducer. Come evoluzione, per feature caricate in lazy si puo' registrare lo stato nella rotta con `StoreModule.forFeature` / `provideState` e `provideEffects`, invece che nello store radice: lo schematic non lo genera.

### `RouteFakeGuard`

`core/service/router.fake.guard.ts` implementa `CanMatch`, `CanActivate` e `CanActivateChild` e ritorna `true` di default (placeholder da sostituire con la propria logica). Le rotte `home` generate usano `canMatch: [RouteFakeGuard]` e `canActivate: [RouteFakeGuard]`. Con login Azure **solo** `canActivate` delega a `MsalGuard` (vedi sopra), cosi' un solo punto avvia il login MSAL; `canMatch` e `canActivateChild` restano `true`.

### Mock API, CI, Sonar

- `mock-api=node-express`: server Express in `mock-api/` (porta `PORT`, default **3001**, stessa di `environment.http.api.baseUrl`; endpoint `/health` e `/api/workers`); si avvia con `npm run mock-api`.
- `ci`: Node 22.x; `npm ci`, `npm run build-dev` e, se `tests != none`, `npm test -- --watch=false --browsers=ChromeHeadless`, poi pubblicazione dell'artefatto `dist`.
- `enable-sonar-qube=Y`: `sonar-project.properties` in radice e script `sonar`.

## Matrice di compatibilita'

| pl-schematics | Angular | Node.js | Architetture | Verifica |
|---|---|---|---|---|
| **4.0.x** | **19, 20, 21** | ^20.19 / ^22.12 / >=24 | classic + standalone (rilevamento automatico) | matrice `npm run test:e2e` (vedi [Limiti noti](./CHANGELOG.md#limiti-noti)) |
| 3.x e precedenti | non supportato | - | - | generavano progetti non compilabili su Angular 19+ |

Versioni delle dipendenze aggiunte al progetto (tabella in `src/pl-schematics/utils/versions.utils.ts`; range pinnati per major di Angular, **eccezione esplicita**: `pl-core-utils-library`, `pl-decorator` e `pl-loading-trace` sono sempre `latest`, quindi si risolvono all'ultima versione pubblicata al momento dell'installazione):

| Pacchetto | Angular 19 | Angular 20 | Angular 21 |
|---|---|---|---|
| `@angular/material`, `@angular/cdk` (con `ui=material`), `ng-packagr`, `@ngrx/*` (con `state=ngrx`) | ^19.0.0 | ^20.0.0 | ^21.0.0 |
| `@angular/localize`, `@angular/animations` (con `ui=material`): stessa minor di `@angular/core` del progetto | ^19.m.0 | ^20.m.0 | ^21.m.0 |
| `@ng-bootstrap/ng-bootstrap` (richiesto da `pl-core-utils-library`) | ^18.0.0 | ^19.0.1 | ^20.0.0 |
| `@ngx-translate/core`, `@ngx-translate/http-loader` (con `i18n=ngx-translate`) | ^17.0.0 | ^17.0.0 | ^17.0.0 |
| `ngx-ui-loader` (peer di `pl-core-utils-library`) | ^19.0.0 | ^19.0.0 | ^19.0.0 |
| `pl-core-utils-library`, `pl-decorator`, `pl-loading-trace` | latest | latest | latest |
| `bootstrap`, `@popperjs/core` | ^5.3.0, ^2.11.8 | idem | idem |
| `@compodoc/compodoc` | ^1.1.19 | idem | idem |
| `@azure/msal-angular`, `@azure/msal-browser`, `@microsoft/microsoft-graph-client` (solo login Azure) | ^6.3.0, ^5.29.0, ^3.0.7 | idem | idem |
| `jquery`, `@fortawesome/fontawesome-free` (solo `ui=bootstrap`) | ^3.7.0, ^6.1.1 | idem | idem |
| `sonar-scanner` (solo `enable-sonar-qube=Y`) | ^3.1.0 | idem | idem |
| `express`, `cors`, `ts-node`, `ts-node-dev` e relativi `@types` (solo `mock-api=node-express`, devDependencies) | ^4.18.2, ^2.8.5, ^10.9.2, ^2.0.0 | idem | idem |

Le firme di `PlHttpService`/`PlHttpRequest` usate dai template sono quelle di `pl-core-utils-library` 2.1.3 e il workaround per `PlLoadingRegistryService` riguarda `pl-loading-trace` 1.2.x: poiche' le tre librerie PL sono `latest`, versioni piu' recenti possono introdurre differenze non coperte dalla matrice.

## Sviluppo del pacchetto

```sh
npm install
npm run build                  # tsc: compila i .ts dello schematic (i template in files/** NON sono compilati)
npm test                       # build + unit test (jasmine, SchematicTestRunner, test/unit/*.spec.js)
```

I template sotto `src/pl-schematics/files/**` sono **EJS** (`<% if (...) { %>`, `<%= variabile %>`): i loro errori emergono solo generando un progetto reale e compilandolo, cioe' con la matrice e2e.

### Matrice e2e

Ogni riga fa: `ng new` => schematic (collection locale, `schematics-cli`, `--no-dry-run --no-debug --force`) => `npm install` => `ng build` (app + librerie) => compilazione degli spec (`tsc -p tsconfig.spec.json --noEmit`) => `ng test` headless => verifica runtime (build di sviluppo servita in Chrome headless: home, `<pl-loading-overlay>`, i18n, interceptor non duplicato, console senza errori). Una riga e' PASS solo se tutti i passi riescono.

```sh
npm run test:e2e               # tutte le righe: Angular 19/20/21 x classic/standalone x casi (42 righe)
npm run test:e2e:19            # solo Angular 19 (anche :20 e :21)
npm run test:schematic         # riga singola: Angular 19, caso base, strict
npm run test:e2e:pack          # installazione "da utente": npm pack -> ng new -> npm i tarball -> ng generate -> ng build
node tools/e2e-matrix.js --list
node tools/e2e-matrix.js --angular 21 --arch standalone --case azure --keep
node tools/e2e-matrix.js --angular 21 --jobs 3 --fresh
```

Opzioni di `tools/e2e-matrix.js`: `--angular <19|20|21|all>`, `--arch <classic|standalone|both>`, `--case <nome|all>`, `--strict <true|false|both>`, `--work <dir>`, `--jobs <n>`, `--keep`, `--fresh`, `--list`, `--skip-tests-run`, `--skip-runtime`. Casi: `base` (opzioni di default; provato anche con `ng new --strict false`), `full` (material + ngrx + interceptor classic + logging advanced), `bootstrap` (bootstrap + interceptor funzionale + logging advanced + Sonar + documentazione + mock-api + GitHub Actions), `azure` (MSAL + Azure DevOps + ngrx), `minimal` (i18n/state/http/logging/tests `none`), `nested` (`cloud/agic`, material + ngrx + interceptor funzionale, `strict`).

Cose da sapere prima di lanciarla:

- **Durata**: la matrice completa e' nell'ordine delle ore (ogni riga richiede da alcuni minuti a circa mezz'ora, `npm install` incluso); la prima esecuzione e' piu' lenta perche' prepara le basi `ng new` per versione/architettura, poi riusate (`--fresh` le ricrea).
- **Porte fisse 3001 e 4300**: la verifica runtime avvia uno stub API su `3001` e un server statico su `4300`; la fase runtime e' sequenziale e le porte devono essere libere (niente `mock-api` o `ng serve` in esecuzione).
- **Chrome** installato: la verifica runtime lo lancia (`playwright-core`, `channel: 'chrome'`) e Karma usa `ChromeHeadless` su Angular 19-20.
- Variabili impostate dal runner per i processi figli: `CI=true`, `PL_DEPS_CHECK=false`, `NG_CLI_ANALYTICS=false`.
- Log e risultati in `<work>/rows/<id>/e2e.log`, `<work>/results.md` e `results.json` (`--work`, default `<tmp>/pl-schematics-e2e`).

## Versioning e rilascio

Il numero di versione e' in `package.json` (e nel `CHANGELOG.md`). Gli script **non creano tag ne' commit** (`--no-git-tag-version`) e ricompilano:

```sh
npm run release-patch          # 4.0.0 => 4.0.1
npm run release-minor          # 4.0.0 => 4.1.0
npm run release-major          # 4.0.0 => 5.0.0
```

Prima di pubblicare: aggiornare `CHANGELOG.md`, eseguire `npm test` e la matrice `npm run test:e2e`, poi verificare il contenuto del pacchetto e pubblicare:

```sh
npm pack --dry-run             # oppure: npm pack  (elenco/tarball del pacchetto)
npm publish
```

Il pacchetto pubblica (`files`) `src/` (collection, schema, `.js`/`.d.ts` compilati, template `files/**`), `README.md` e `CHANGELOG.md`. I `.js` compilati devono essere aggiornati (`npm run build`) prima della pubblicazione.

## Limiti noti

L'elenco aggiornato e dettagliato e' nel [CHANGELOG](./CHANGELOG.md#limiti-noti). In sintesi:

- la matrice e2e su Angular 21 non e' completamente verde in modo stabile (due righe con errori intermittenti), e Angular 19/20 sono stati verificati sul codice finale solo in parte;
- `http-store-auth-adapter.service.ts` e' uno scaffold commentato e non esportato;
- l'interceptor MSAL con `http=interceptor-functional` non e' stato provato a runtime;
- `nameCompany` e `strict` non hanno oggi effetti sul codice generato.

## Documentazione correlata

- [CHANGELOG.md](./CHANGELOG.md): modifiche e BREAKING CHANGE della 4.0.0, limiti noti.
- [AI_README.md](./AI_README.md): contesto e convenzioni per assistenti AI/LLM (prompt di contesto, architettura, regole per chi modifica lo schematic).
- Le funzionalita' di runtime (cache di rete, decoratori, mock HTTP, `PlBaseComponent`, utility su `String`/`Array`/`JSON`) appartengono a `pl-core-utils-library`, non a questo pacchetto: vanno consultate nella documentazione di quella libreria.

## Autore e licenza

Creato da @l.piciollo (lucapiciolo@gmail.com). Licenza MIT.
