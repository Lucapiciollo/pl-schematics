# pl-schematics

Schematic per Angular CLI che **standardizza l'architettura iniziale di un progetto Angular enterprise**. Non e' una libreria di componenti UI e non genera logica di business: su un workspace creato con `ng new` applica un pattern di progetto gia' collaudato, composto da:

- un layer applicativo `core` (inizializzazione, autenticazione, gestione errori, accesso al BE);
- due **librerie Angular reali** nel workspace (`projects/<nome>-shared` e, opzionalmente, `projects/<nome>-ngrx`);
- configurazione di `angular.json`, `tsconfig.json`, `package.json`, environment, i18n, loader grafico, CI, mock API e Sonar, a scelta.

Si rivolge ai team che avviano (o allineano) piu' applicazioni Angular con la stessa struttura. Il codice generato si appoggia a `pl-core-utils-library`, `pl-decorator` e `pl-loading-trace` (vedi [Matrice di compatibilita'](#matrice-di-compatibilita)).

> Versione **4.0.0**. Il pacchetto e' stato riscritto per Angular 19-21: le versioni 3.x e precedenti non sono supportate. L'elenco delle modifiche e delle BREAKING CHANGE e' in [CHANGELOG.md](./CHANGELOG.md); le convenzioni per assistenti AI/LLM sono in [AI_README.md](./AI_README.md).

## Indice

- [Requisiti](#requisiti)
- [Installazione e uso](#installazione-e-uso)
- [Guida rapida: primo avvio](#guida-rapida-primo-avvio)
- [Opzioni](#opzioni)
- [Cosa viene generato](#cosa-viene-generato) (albero commentato, librerie `shared` e `ngrx`)
- [Il codice generato](#il-codice-generato) (bootstrap, `GlobalService`, interceptor, MSAL, loader, NgRx, guard)
- [Esempi passo passo](#esempi-passo-passo) (backend, NgRx, rotte lazy, bootstrap, interceptor, loader, MSAL, libreria shared)
- [Test e build del progetto generato](#test-e-build-del-progetto-generato)
- [Domande frequenti e problemi comuni](#domande-frequenti-e-problemi-comuni)
- [Matrice di compatibilita'](#matrice-di-compatibilita)
- [Sviluppo del pacchetto](#sviluppo-del-pacchetto) e [Versioning e rilascio](#versioning-e-rilascio)
- [Limiti noti](#limiti-noti) e [Documentazione correlata](#documentazione-correlata)

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

## Guida rapida: primo avvio

**Obiettivo**: da zero a un'applicazione che parte in locale con `core`, librerie, NgRx, interceptor e backend di prova. Si usa `--name-package=demo`, quindi la cartella applicativa e' `src/app/demo/` e le librerie sono `demo-shared` e `demo-ngrx`. Prerequisiti: i [Requisiti](#requisiti) (Node e Angular CLI).

```sh
# 1. workspace Angular (classic; per un'app standalone ometti --standalone false)
ng new demo --skip-git --routing --style css --ssr false --defaults --standalone false
cd demo

# 2. installa lo schematic e generalo
npm install -D pl-schematics@4
ng generate pl-schematics:pl-schematics --name-package=demo --ui=material --state=ngrx \
  --http=interceptor-classic --logging=advanced --mock-api=node-express --no-interactive

# 3. installa le dipendenze aggiunte al package.json
npm install

# 4. avvio: backend di prova (terminale 1, porta 3001) e applicazione (terminale 2, porta 4200)
npm run mock-api
ng serve
```

Aprendo **`http://localhost:4200/#/home`** si vede:

- il testo `home works! (Home)` (il secondo `Home` arriva da `HOME.TITLE` in `src/assets/public/i18n/it.json`: la pipe `translate` e' attiva, ngx-translate e' il default);
- **la sola home e' raggiungibile**: su `http://localhost:4200/` (senza `#/home`) non compare nessuna pagina, perche' lo schematic non genera un redirect dalla rotta vuota (aggiungilo in `app-routing-module.ts` / `app.routes.ts` con `{ path: '', redirectTo: 'home', pathMatch: 'full' }` se serve);
- il **loader**: barra in cima al cambio di rotta e spinner modale per le chiamate di rete, mostrati solo se superano il debounce di 200 ms (`core/utils/pl-loading.config.ts`); all'avvio non c'e' nessuna chiamata lenta, per vederlo vedi l'[esempio 7](./docs/GUIDA.md#7-configurare-il-loader-pl-loading-trace);
- nella console i log del `LoggerService` (`--logging=advanced`, livello `DEBUG` in `environment.ts`), compresi i tempi delle chiamate dell'interceptor;
- con NgRx, in Redux DevTools (estensione del browser) lo stato `app` (`initialized: true` dopo `[App] Init Success`) e `storage`; con `npm run mock-api` attivo, `http://localhost:3001/api/workers` risponde con 3 lavoratori.

Se qualcosa non parte, vedi [Domande frequenti](#domande-frequenti-e-problemi-comuni). Il passo successivo e' l'[esempio 2](./docs/GUIDA.md#2-chiamare-il-backend-con-globalservice): leggere quei 3 lavoratori dalla home.

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
| `includeDocumentation` (`--include-documentation`) | booleano | `false` | Copia nel progetto, in `pl-schematics/document/`, la documentazione compodoc dell'applicazione generata (aggiornata ai commenti JSDoc del codice dello schematic) |
| `strict` (`--strict`) | booleano | `false` | Oggi non produce effetti: il codice generato compila sia con `ng new --strict` sia con `--strict false` |

`addSupportBootstrap` e' un'opzione interna (derivata da `ui`, non visibile): non va passata.

## Cosa viene generato

Albero commentato per `--name-package=demo --state=ngrx` con login Azure, Material, interceptor e logging avanzato (le parti opzionali sono indicate; `my-app` o altri nomi cambiano solo il prefisso di cartelle e librerie):

```
<workspace>/
├── angular.json                  # + progetti demo-shared / demo-ngrx; build dell'app: fileReplacements, budget initial 3MB/5MB,
│                                 #   polyfill @angular/localize/init, assets src/assets => /assets, tema Material (ui) o Bootstrap
├── tsconfig.json                 # + paths "demo-shared" / "demo-ngrx" verso projects/<lib>/src/public-api.ts (sorgente, niente build in sviluppo)
├── package.json                  # + dipendenze e script: build-dev, build-prod, typedoc, deps:check, deps:update, postinstall,
│                                 #   mock-api, ci:install/ci:build/ci:test, sonar (in base alle opzioni)
├── azure-pipelines.yml | .github/workflows/build.yml   # --ci
├── sonar-project.properties      # --enable-sonar-qube=Y
├── mock-api/                     # --mock-api=node-express: Express su :3001 (src/index.ts, routes/workers.routes.ts, data/workers.mock.json)
├── tools/check-dependencies-on-install.js   # controllo dipendenze interattivo (postinstall)
├── pl-schematics/document/       # --include-documentation=true
├── projects/
│   ├── demo-shared/              # libreria Angular (ng-packagr), si importa come 'demo-shared'
│   │   ├── ng-package.json, package.json, tsconfig.lib.json, tsconfig.lib.prod.json
│   │   └── src/
│   │       ├── public-api.ts     # tutto cio' che l'app puo' importare va riesportato qui
│   │       └── lib/
│   │           ├── module/       # SharedModule (forRoot)
│   │           ├── config/       # SharedLibConfig, SHARED_LIB_CONFIG, providePlShared
│   │           ├── pipe/         # PipeModule e una ventina di pipe (comma-decimal, currency-format, localized-date, safe, truncate, ...)
│   │           ├── utils/        # Utils, costanti di device detection
│   │           ├── bean/         # ErrorBean, ErrorCode
│   │           ├── tokens/       # BASE_URL_API, APP_BOOTSTRAP_TASKS
│   │           ├── logging/      # solo logging=advanced: LoggerService, LoggerFeature, provideLogger, ...
│   │           ├── http/, interceptor/   # solo http != none: HttpInterceptorService, token/config, adapter di autenticazione
│   │           ├── material/     # solo ui=material: MaterialModule
│   │           └── component/{header,footer,menu}/, directive/   # cartelle vuote (.gitkeep)
│   └── demo-ngrx/                # solo state=ngrx
│       └── src/
│           ├── public-api.ts
│           └── lib/
│               ├── state.module.ts      # StateModule: StoreModule.forRoot, EffectsModule.forRoot, StoreDevtools; emette storageHydrate() e appInit()
│               ├── root.{state,reducers,effects,selectors}.ts   # RootState, rootReducers, rootEffects, barrel dei selector
│               ├── app/                 # slice app: state, actions, reducer, selectors, effects
│               └── storage/             # slice storage (token, lingua, tema in localStorage) + storage.service.ts
└── src/
    ├── index.html, main.ts, styles.css
    ├── assets/public/{i18n/it.json, mock/example/api/files/get.json}   # traduzioni e file mock (DEFAULT_PATH_MOCK)
    ├── environments/{environment.ts, environment.prod.ts, environment.model.ts}   # AppEnvironment: http, i18n, logging, features, azure
    └── app/
        ├── app-module.ts + app-routing-module.ts   (classic)  |  app.config.ts + app.routes.ts   (standalone);  app.ts + app.html (root)
        └── demo/                                  # src/app/<namePackage>
            ├── core/
            │   ├── service/       # auth.service, global.service, http.service, error.service, router.fake.guard
            │   ├── initializer/   # AutenticationLoader (login + APP_BOOTSTRAP_TASKS), AmbientModeLoader (browser)
            │   ├── module/        # solo classic: initializer.module.ts, pl-loading.module.ts
            │   ├── provide-core.ts   # solo standalone: equivalente di InitializerModule
            │   ├── msal/          # solo login Azure: factory MSAL, token PL_MSAL_*, providePlMsal (classic: + msal-auth.module.ts)
            │   ├── type/type.event.ts   # CORE_TYPE_EVENT: eventi broadcast del core
            │   └── utils/         # shared.config.ts (appSharedConfig), pl-loading.config.ts (plLoadingTraceOptions)
            └── component/
                ├── page/home/     # HomeComponent + HomeService + spec (classic: + home.module.ts e home-routing.module.ts)
                └── section/{filter,tab}/    # cartelle vuote (.gitkeep)
```

Le voci con "solo ..." dipendono dall'opzione indicata (`logging=advanced`, `http != none`, `ui=material`, `state=ngrx`, login Azure, architettura). Con `i18n=none` la pipe `translate-async` non viene generata. I file della shell (`app*.ts`, `index.html`, `main.ts`, `styles.css`) sono quelli di `ng new`, modificati o sostituiti come descritto in [Modifiche ai file esistenti](#modifiche-ai-file-esistenti); i nomi reali sono letti dal progetto (Angular 19: `app.component.ts`, `app.module.ts`, `app-routing.module.ts`; Angular 20+: `app.ts`, `app.html`, `app-module.ts`, `app-routing-module.ts`).

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

## Esempi passo passo

La guida [`docs/GUIDA.md`](./docs/GUIDA.md) contiene gli esempi 2-9 (obiettivo, prerequisiti, file da creare o modificare, codice, risultato atteso, problemi comuni), scritti sul progetto del [primo avvio](#guida-rapida-primo-avvio); il primo avvio e la sezione test e build sono in questo README. Valgono per applicazioni classic e standalone (dove differiscono e' mostrato entrambi):

| # | Esempio | Contenuto |
|---|---|---|
| 1 | [Primo avvio](#guida-rapida-primo-avvio) | `ng new`, generazione, `npm run mock-api`, `ng serve` |
| 2 | [Chiamare il backend](./docs/GUIDA.md#2-chiamare-il-backend-con-globalservice) | `GlobalService` (`get`/`post`, varianti `*Bg`), `PlHttpRequest`, `ErrorBean`, `baseUrl` e token `BASE_URL_API` |
| 3 | [Feature NgRx](./docs/GUIDA.md#3-aggiungere-una-feature-ngrx) | slice completo (state, actions, reducer, selectors, effects) registrato in `root.*`; nota su `forFeature` / lazy |
| 4 | [Rotta lazy con `RouteFakeGuard`](./docs/GUIDA.md#4-aggiungere-una-rotta-lazy-con-routefakeguard) | `canMatch` / `canActivate`, classic e standalone, `applicationType.type` |
| 5 | [Codice prima dell'avvio](./docs/GUIDA.md#5-task-di-bootstrap-con-app_bootstrap_tasks) | `APP_BOOTSTRAP_TASKS`: caricamento di una config remota |
| 6 | [Interceptor HTTP](./docs/GUIDA.md#6-interceptor-http-retry-timeout-e-401) | retry/backoff, `HTTP_INTERCEPTOR_CONFIG`, adapter con refresh, cosa succede su 401 |
| 7 | [Loader `pl-loading-trace`](./docs/GUIDA.md#7-configurare-il-loader-pl-loading-trace) | `pl-loading.config.ts`: debounce, animazioni, esclusione url |
| 8 | [Login Azure MSAL](./docs/GUIDA.md#8-configurare-il-login-azure-msal) | `environment.azure`, `protectedResourceMap`, verifica in locale, limiti |
| 9 | [Libreria shared](./docs/GUIDA.md#9-aggiungere-una-pipe-o-una-utility-alla-libreria-shared) | nuova pipe e utility in `projects/demo-shared`, `public-api` |
| 10 | [Test e build](#test-e-build-del-progetto-generato) | `ng build` (app e librerie), `ng test`, matrice e2e |

## Test e build del progetto generato

```sh
ng build                                  # applicazione, configurazione "production" (default di ng new: fileReplacements, budget 3MB/5MB)
ng build --configuration development      # build di sviluppo
npm run build-prod                        # = ng build --configuration production (build-dev = ng build)
ng build demo-shared                      # libreria shared => dist/demo-shared/ (non e' inclusa in "ng build")
ng build demo-ngrx                        # libreria ngrx (solo --state=ngrx) => dist/demo-ngrx/
ng test --watch=false                     # Angular 21: Vitest (runner di default di ng new)
ng test --watch=false --browsers=ChromeHeadless   # Angular 19/20: Karma + Jasmine, serve Chrome
```

- Gli spec generati sono quelli di `HomeComponent`, `HomeService` e del componente root; le librerie hanno solo il target `build`, non `test`.
- In sviluppo le librerie non vanno compilate: `tsconfig.json` le mappa sul sorgente (`ng serve` e `ng build` dell'app le compilano insieme all'app). `ng build demo-shared` serve a verificare che la libreria compili da sola (ng-packagr) e a produrre il pacchetto in `dist/`.
- Per verificare lo **schematic** (non il tuo progetto) esiste la matrice e2e del pacchetto: `npm run test:e2e` (richiede ore, vedi [Matrice e2e](#matrice-e2e)).

## Domande frequenti e problemi comuni

**`ng generate` risponde che la collezione non esiste.** Lo schematic va installato nel workspace (`npm install -D pl-schematics@4`) e il comando lanciato dalla radice del workspace. Altri errori espliciti: Angular minore di 19 o maggiore di 21, `--architecture` diversa da quella rilevata, componente root con template inline, `--tests=jest`.

**`npm install` fallisce con `ERESOLVE`.** Il conflitto riguarda le peer dependency tra pacchetti gia' presenti nel progetto e quelli aggiunti dallo schematic (`@angular/material`, `@angular/cdk`, `@ngrx/*`, `ng-packagr` pinnati sul major di Angular; `@angular/localize` e `@angular/animations` sulla stessa minor di `@angular/core`). Leggi l'albero dell'errore, allinea il pacchetto indicato al major di Angular del progetto (ad esempio `@angular/material` ^19 in un progetto Angular 20 va portato a ^20) e rilancia. `npm install --legacy-peer-deps` e' l'ultima risorsa: ignora il controllo e puo' nascondere incompatibilita' reali. Nella matrice e2e `npm install` su un `ng new` pulito riesce senza flag.

**`npm install` resta in attesa di una risposta.** E' il controllo interattivo delle dipendenze (`postinstall`): rispondi, oppure imposta `PL_DEPS_CHECK=false` (e' gia' saltato in CI e in terminali non interattivi).

**`ng build` fallisce con "bundle initial exceeded maximum budget".** Lo schematic porta i budget `initial` della build production a 3MB (warning) / 5MB (error) perche' `pl-core-utils-library` e `pl-loading-trace` superano il default. Se non basta, riduci il bundle (lazy loading, dipendenze inutili) oppure alza `maximumWarning` / `maximumError` in `angular.json` > `projects.<app>.architect.build.configurations.production.budgets`.

**`ng test`: cosa cambia tra Angular 19 e 21.** Su 19/20 il runner e' Karma + Jasmine: servono Chrome e `--browsers=ChromeHeadless`, e senza `--watch=false` il comando resta in ascolto. Su 21 il runner di default e' Vitest: `ng test --watch=false`. Lo script generato `ci:test` usa `npm test -- --watch=false --browsers=ChromeHeadless`: su Angular 21 il flag `--browsers` non e' stato verificato (Vitest senza provider browser potrebbe rifiutarlo); in caso di errore usa `ng test --watch=false`, come la matrice e2e.

**`NullInjectorError` (NG0201) su un servizio di `pl-loading-trace` nei test.** Il componente testato contiene `<pl-loading-overlay>` (il componente root standalone) e il `TestBed` non ha i provider del loader: aggiungi `providePlLoadingTrace()` (da `pl-loading-trace`) ai `providers`, come fa lo spec generato del componente root. Nelle app classic lo spec del root usa `schemas: [NO_ERRORS_SCHEMA]`; in un test di integrazione importa `PlLoadingModule` (`core/module/pl-loading.module.ts`), che fornisce anche `PlLoadingRegistryService`.

**Login Azure in locale: `BrowserAuthError: interaction_in_progress`.** MSAL ha gia' un'interazione (redirect) in corso e ne viene avviata un'altra: capita se un login e' stato interrotto (tab chiusa o ricarica a meta'), con piu' tab aperte sulla stessa origine o quando piu' flussi partono insieme (`APP_INITIALIZER`, `InitializerModule` / `provideCore()`, `MsalGuard`). Rimedio: DevTools > Application > *Clear site data* per `localhost:4200` (oppure cancella le chiavi `msal.*` da `localStorage` / `sessionStorage`), chiudi le altre tab e ripeti un solo login. La causa non e' ancora chiarita (vedi [Limiti noti](./CHANGELOG.md#limiti-noti)); con `redirectUri` diverso dall'URI registrata come SPA su Azure l'errore e' invece `AADSTS50011` ([esempio 8](./docs/GUIDA.md#8-configurare-il-login-azure-msal)).

**La pagina e' bianca su `http://localhost:4200/`.** La rotta vuota non ha un redirect: la home e' su `/#/home` (il routing usa l'hash).

**Ogni richiesta HTTP parte due volte.** L'interceptor della libreria shared e' registrato due volte (ad esempio chiamando di nuovo `provideHttpInterceptor` o `SharedModule.forRoot`): deve essere registrato una sola volta; per cambiare la configurazione usa `provideHttpInterceptorConfig` ([esempio 6](./docs/GUIDA.md#6-interceptor-http-retry-timeout-e-401)).

**Su un 401 la pagina si ricarica in continuazione.** L'adapter di default (`LocalStorageAuthAdapterService`) non implementa il refresh: su un 401 cancella i token e ricarica la pagina. Fornisci un `HttpAuthAdapter` con `refreshToken()` ([esempio 6](./docs/GUIDA.md#6-interceptor-http-retry-timeout-e-401)).

**`SyntaxError ... "undefined" is not valid JSON` creando una `PlHttpRequest`, oppure url errato.** Path param, query param e body non possono essere `undefined` (usa `{}` / `null`) e l'url deve essere relativo a `BASE_URL_API` ([esempio 2](./docs/GUIDA.md#2-chiamare-il-backend-con-globalservice)).

**`Cannot find module 'demo-shared'` / `'demo-ngrx'`.** Controlla che `tsconfig.json` abbia i `paths` verso `projects/<lib>/src/public-api.ts` e che l'import sia il nome della libreria (non un percorso relativo); un simbolo nuovo deve essere riesportato da `public-api.ts`. Riavvia il TypeScript server dell'IDE se necessario.

**La vista non si aggiorna dopo una chiamata.** Le applicazioni Angular senza `zone.js` (zoneless) non rilevano le semplici assegnazioni a campi dentro `subscribe`: usa `signal` o la pipe `async`.

**Ho rieseguito lo schematic e le mie modifiche sono sparite.** I template di `core/`, `environment` e delle librerie (`public-api.ts`, `pipe.module.ts`, `root.*.ts`, ...) vengono sovrascritti: committa prima di rigenerare e riapplica le tue modifiche con `git diff`.

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

Il rilascio e' automatico: `tools/publish.js` decide da solo il tipo di aumento di versione, esegue i test, aggiorna `package.json` e `CHANGELOG.md`, pubblica su npm, crea il tag e fa il push.

```sh
npm run release:plan           # mostra il piano (versione, motivi, controlli) e NON pubblica
npm run release                # esegue davvero: test, versione, changelog, commit, npm publish, tag, push
node tools/publish.js --yes --dry-run   # prova completa con `npm publish --dry-run`, senza tag ne' push
```

**Come sceglie la versione**, guardando i commit (Conventional Commits) e lo `schema.json` dall'ultima versione rilasciata:

| Cosa trova | Aumento |
|---|---|
| commit con `!` (es. `feat!:`) o con `BREAKING CHANGE`; opzione, valore di enum o default tolti/cambiati nello schema | **major** |
| commit `feat`; nuova opzione o nuovo valore nello schema | **minor** |
| `fix`, `perf`, `refactor`, `docs`, `build`, `ci`, `test`, `chore` o messaggi non convenzionali | **patch** |
| nessun commit nuovo | si ferma, non pubblica |

Se la versione di `package.json` non e' ancora sul registry (es. la prima 4.0.0), viene pubblicata cosi' com'e', senza aumento. Si puo' forzare il livello con `--bump major|minor|patch`.

Prima di pubblicare lo script controlla: albero git pulito, branch `main`, `npm whoami` (token valido, vedi sotto) e `npm test`. Opzioni: `--yes`, `--bump`, `--dry-run`, `--no-push`, `--skip-tests`, `--tag <dist-tag>`, `--allow-branch`.

Il token npm deve essere un Granular Access Token con permesso di scrittura sul pacchetto e 2FA bypass: `npm config set //registry.npmjs.org/:_authToken <TOKEN>` (non usare `npm login`).

Gli script `release-patch|minor|major` restano per un aumento manuale e **non creano tag ne' commit** (`--no-git-tag-version`). Consigliato prima di un major o minor: la matrice `npm run test:e2e`.

```sh
npm pack --dry-run             # elenco del pacchetto
```

Il pacchetto pubblica (`files`) `src/` (collection, schema, `.js`/`.d.ts` compilati, template `files/**`), `README.md` e `CHANGELOG.md`. I `.js` compilati devono essere aggiornati (`npm run build`) prima della pubblicazione.

## Limiti noti

L'elenco aggiornato e dettagliato e' nel [CHANGELOG](./CHANGELOG.md#limiti-noti). In sintesi:

- la matrice e2e su Angular 21 non e' completamente verde in modo stabile (due righe con errori intermittenti), e Angular 19/20 sono stati verificati sul codice finale solo in parte;
- `http-store-auth-adapter.service.ts` e' uno scaffold commentato e non esportato;
- l'interceptor MSAL con `http=interceptor-functional` non e' stato provato a runtime;
- `nameCompany` e `strict` non hanno oggi effetti sul codice generato.

## Documentazione correlata

- [docs/GUIDA.md](./docs/GUIDA.md): esempi passo passo sul progetto generato (backend, NgRx, rotte lazy, bootstrap, interceptor, loader, MSAL, libreria shared).
- [CHANGELOG.md](./CHANGELOG.md): modifiche e BREAKING CHANGE della 4.0.0, limiti noti.
- [AI_README.md](./AI_README.md): contesto e convenzioni per assistenti AI/LLM (prompt di contesto, architettura, regole per chi modifica lo schematic).
- Documentazione del codice generato: con `--include-documentation` viene copiata in `pl-schematics/document/` la documentazione compodoc dell'applicazione generata; nel progetto lo script `npm run typedoc` (compodoc, aggiunto in `package.json` con `@compodoc/compodoc` tra le dipendenze) la genera in `pl-schematics/document/schematics`.
- Librerie esterne usate dal codice generato: [`pl-loading-trace`](https://www.npmjs.com/package/pl-loading-trace) (demo online <https://lucapiciollo.github.io/loadingTrace-demo/>), `pl-core-utils-library` (cache di rete, decoratori, mock HTTP, `PlBaseComponent`, utility su `String`/`Array`/`JSON`: non appartengono a questo pacchetto, vanno consultate nella documentazione di quella libreria) e `pl-decorator`.

## Autore e licenza

Creato da @l.piciollo (lucapiciolo@gmail.com). Licenza MIT.
