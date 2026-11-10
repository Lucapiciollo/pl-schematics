# AI_README.md — Guida di contesto per assistenti AI / LLM

> **Prompt di contesto — incolla questo blocco a un LLM/agente AI prima di chiedergli di lavorare su questo repository o su un progetto generato con questo tool:**
>
> "Stai lavorando con (o su) **pl-schematics**, uno schematic per Angular CLI (`@angular-devkit/schematics`) che **standardizza l'architettura iniziale di un progetto Angular enterprise**. Non è una libreria di componenti UI e non genera business logic applicativa: applica un pattern di progetto (cartelle, moduli, servizi core, autenticazione, gestione errori, HTTP, state management) su un progetto Angular nuovo o esistente, tramite `schematics pl-schematics:pl-schematics --no-dry-run --no-debug` (opzioni in kebab-case). Versione 4.x: Angular 19/20/21, app classic (NgModule) e standalone, rilevate automaticamente. Il risultato è: un layer applicativo `core` (autenticazione MSAL opzionale, interceptor HTTP con retry e refresh-token, servizio `GlobalService` come punto centrale di dispatch per le chiamate al BE) e due **librerie Angular reali** generate nel workspace (`projects/<nome>-shared`, e se richiesto `projects/<nome>-ngrx`), non semplici cartelle. Se ti viene chiesto di modificare il **sorgente dello schematic** (questo repo, cartella `src/pl-schematics/files/**`), ricorda che quei file sono **template EJS** (`<% if (...) { %> ... <% } %>`, `<%= variabile %>`), processati con le opzioni dello schema al momento della generazione: non sono codice TypeScript eseguito direttamente da questo repo, ma testo che diventerà codice TypeScript nel progetto target. Se ti viene chiesto di lavorare su un **progetto generato** da questo schematic, segui le convenzioni descritte più sotto (GlobalService come punto di dispatch HTTP, ErrorBean per gli errori, pattern NgRx in `projects/<nome>-ngrx/src/lib`, injection token per configurazione) invece di inventarne di nuove."

---

## 1. Cos'è pl-schematics

`pl-schematics` è un pacchetto npm (`schematics`) che, una volta installato in un progetto Angular CLI, applica un pattern architetturale enterprise tramite:

```sh
ng new my-app                    # progetto Angular standard (19/20/21, classic o standalone)
npm i -D pl-schematics@4
npx schematics pl-schematics:pl-schematics --name-package=my-app --no-dry-run --no-debug
```

L'architettura (classic/standalone) viene rilevata da `main.ts`: `bootstrapApplication` => standalone, `bootstrapModule` => classic. Non crea un'app da zero (serve `ng new` prima): **arricchisce/standardizza** un workspace Angular CLI esistente.

## 2. Cosa genera (in sintesi)

- **`src/app/<namePackage>/core/`** — layer applicativo, sempre nel progetto (non libreria). `<namePackage>` puo' contenere `/` (es. `cloud/agic`); le librerie usano il nome kebab `cloud-agic-shared`:
  - `service/auth.service.ts` — login/logout, integrazione MSAL v3 (`@azure/msal-angular`) quando abilitata, altrimenti login "bypassata" (emula sempre successo, punto di innesto per SSO custom).
  - `service/http.service.ts` — wrapper tipizzato attorno a `PlHttpService` di `pl-core-utils-library` (GET/POST/PUT/DELETE/PATCH + varianti *BG non interrotte dal routing, STREAM, FORKJOIN, DOWNLOAD).
  - `service/global.service.ts` — **punto centrale di dispatch per le chiamate al BE**: espone `get/getBg/post/postBg/put/putBg/patch/patchBg/delete` che delegano a `HttpService`. I componenti feature dovrebbero iniettare `GlobalService`, non `HttpService` direttamente. Centralizza anche eventi broadcast (`pl-core-utils-library`), errori globali, redirect/re-login su 401.
  - `service/error.service.ts` — `ErrorHandler` globale Angular, converte errori in `ErrorBean` ed eventi broadcast.
  - `service/router.fake.guard.ts` — guard di default (`CanMatch`, `CanActivate`, `CanActivateChild`; con MSAL delega a `MsalGuard` solo nel runtime web, altrimenti ritorna sempre `true`); le rotte generate usano `canMatch: [RouteFakeGuard]` accanto a `canActivate`.
  - `provide-core.ts` — **solo standalone**: `provideCore()`, equivalente dell'InitializerModule con `provideAppInitializer`, `ErrorHandler`, `importProvidersFrom(PlCoreModule)`, MSAL (il loader grafico e' registrato in `app.config.ts`, vedi §7).
  - `module/pl-loading.module.ts` — **solo classic**: `PlLoadingModule`, loader grafico `pl-loading-trace` (`forRoot` + `PlLoadingRegistryService`), importato in `AppModule` prima di `SharedModule.forRoot`.
  - `module/initializer.module.ts` — **solo classic**: modulo di bootstrap: registra `BASE_URL_API`, cache/log config, MSAL (se abilitato), e due `APP_INITIALIZER`: uno per l'ambient mode, uno per `AutenticationLoader` (login + task di bootstrap custom, vedi §5).
  - `msal/` — wiring MSAL (solo se login = Azure AD; `@azure/msal-angular` ^6): `providePlMsal()` (classic e standalone), `msal-auth.module.ts` (solo classic), injection token per sovrascrivere le factory.
  - `utils/shared.config.ts` — `appSharedConfig`, la config della libreria shared ricavata dall'environment.
  - `utils/pl-loading.config.ts` — `plLoadingTraceOptions` (`PlLoadingTraceOptions`), config del loader grafico `pl-loading-trace` (barra di rotta + spinner HTTP).
  - `initializer/`, `utils/`, `type/` — supporto.

- **`projects/<namePackage>-shared/`** — **libreria Angular vera** (ng-packagr, non una cartella):
  - `SharedModule` (CommonModule, FormsModule, PipeModule, TranslateModule se i18n, opzionalmente MaterialModule) + `SharedModule.forRoot(config)` (classic) / `providePlShared(config)` (standalone, in `lib/config/shared-lib.config.ts`): registrano HttpClient, interceptor, ngx-translate. **La libreria non importa mai l'environment dell'app**: la config arriva da `appSharedConfig`. `StateModule` NON e' importato dalla shared: lo importa l'app.
  - Pipe riusabili (`comma-decimal`, `currency-format`, `localized-date`, `safe`, `truncate`, ecc.).
  - `Utils` e device-detector.
  - `ErrorBean`/`ErrorCode` (bean di errore generico, usato ovunque nel progetto).
  - Logging avanzato opzionale (`LoggerService`, `LoggerFeature`).
  - Sistema HTTP interceptor completo (opzionale, vedi §4): token/config, adapter di autenticazione, `HttpInterceptorService`, provider `provideHttpInterceptor(...)`.
  - `MaterialModule` (opzionale).
  - Importabile con lo specifier `<namePackage>-shared` (path mapping in `tsconfig.json` verso il sorgente, non verso `dist/`: non serve build separata in sviluppo).

- **`projects/<namePackage>-ngrx/`** — **libreria Angular NgRx** (solo se `state=ngrx`), con un esempio COMPLETO e funzionante:
  - Feature `app` (init/loading/error) e feature `storage` (token/lingua/tema persistiti in `localStorage` tramite `StorageService` + `StorageEffects`).
  - `StateModule` dispatcha `storageHydrate()` e `appInit()` al bootstrap: l'esempio funziona out-of-the-box, non è solo boilerplate inerte.
  - **Segui questo stesso pattern per aggiungere una nuova feature**: `<feature>.state.ts` → `<feature>.actions.ts` → `<feature>.reducer.ts` → `<feature>.selectors.ts` → `<feature>.effects.ts`, poi registra reducer/effect in `root.reducers.ts`/`root.effects.ts`.

## 3. Opzioni principali dello schematic (`src/pl-schematics/schema.json`)

| Opzione | Valori | Effetto |
|---|---|---|
| `namePackage` | stringa (obbligatoria), uno o piu' segmenti `[A-Za-z0-9_-]` separati da `/` | Cartella app sotto `src/app/<namePackage>`; nomi librerie da `getLibBaseName` (minuscolo, `_`->`-`, `/`->`-`): `<base>-shared`, `<base>-ngrx` |
| `nameCompany` | stringa | Metadato, default `mycompany` |
| `ui` | `none`\|`material`\|`bootstrap` | Angular Material o Bootstrap 5 |
| `state` | `none`\|`ngrx` | Genera `projects/<namePackage>-ngrx` |
| `logging` | `none`\|`console`\|`advanced` | `advanced` genera `LoggerService` nella lib shared |
| `http` | `none`\|`interceptor-classic`\|`interceptor-functional` | Genera il sistema di interceptor HTTP (tokens, adapter, `HttpInterceptorService` con retry) nella lib shared |
| `loginSupportConfiguration` | `NONE`\|`AZURE-ACTIVE-DIRECT` | MSAL v3. **Se scelto insieme a `http=none`, `http` viene forzato a `interceptor-classic`** (MSAL dipende dall'interceptor per il token) |
| `i18n` | `none`\|`ngx-translate` | |
| `mockApi` | `none`\|`node-express` | Genera un mini server Express (`mock-api/`) fuori dal workspace Angular |
| `ci` | `none`\|`github-actions`\|`azure-devops` | Pipeline CI/CD |
| `enableSonarQube` | `Y`\|`N` | |
| `includeDocumentation` | boolean | |
| `architecture` | `auto`\|`classic`\|`standalone` | Default `auto` (rilevata da `main.ts`). Un valore diverso da quello rilevato => errore chiaro |
| `tests` | `none`\|`jasmine`\|`jest` | Influisce solo su script/CI generati (`ci:test`, step test); non configura Jest |
| `strict` | boolean | Riservata: il codice generato compila sia con `ng new --strict` (default) sia `--strict false` (verificato in e2e) |

## 4. Interceptor HTTP e retry (quando `http != 'none'`)

`HttpInterceptorService` (in `projects/<namePackage>-shared/src/lib/interceptor/`) gestisce **due meccanismi indipendenti**:
1. **Refresh-token su 401**: tramite `HTTP_AUTH_ADAPTER` (default `LocalStorageAuthAdapterService`, sovrascrivibile — es. per NgRx vedi `http-store-auth-adapter.service.ts`, scaffold commentato da completare).
2. **Retry generico con backoff esponenziale** per errori diversi da 401 (timeout, errori di rete status 0, 408/429/500/502/503/504), configurabile via `HTTP_INTERCEPTOR_CONFIG` (`enableRetry`, `maxRetryAttempts`, `retryDelayMs`, `retryBackoffMultiplier`, `retryableStatusCodes`, `retryOnlyIdempotentMethods`, ecc.).

⚠️ **Non registrare mai `HttpInterceptorService` una seconda volta** (es. in `InitializerModule`): la registrazione avviene **solo** in `SharedModule.forRoot()` tramite `provideHttpInterceptor(config)`. Una doppia registrazione esegue ogni richiesta due volte.

## 5. Bootstrap dell'applicazione (`APP_INITIALIZER`)

`AutenticationLoader` (in `core/initializer/`) blocca il bootstrap dell'app finché:
1. `AuthService.login()` non risolve (reale con MSAL, no-op con login `NONE`);
2. **poi**, tutte le eventuali funzioni registrate tramite l'injection token `APP_BOOTSTRAP_TASKS` (multi-provider, opzionale, esportato dalla lib shared) non risolvono con successo.

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

Se non registri nessun task, il comportamento resta identico alla sola login.

## 6. Convenzioni da rispettare quando generi/modifichi codice in un progetto derivato

- **Chiamate al BE**: passa sempre da `GlobalService.get/post/put/delete/...`, non iniettare `HttpService` direttamente (a meno di funzionalità avanzate non wrappate: `STREAM`, `FORKJOIN`, `DOWNLOAD`, `BASICHTTP`).
- **Errori**: usa `ErrorBean`/`ErrorCode` importati da `<namePackage>-shared`, mai ridichiarare un bean di errore locale.
- **NgRx**: segui il pattern a 5 file per feature (`state`/`actions`/`reducer`/`selectors`/`effects`) già presente in `projects/<namePackage>-ngrx/src/lib/{app,storage}`; i side-effect (localStorage, HTTP) vanno negli effects, mai nel reducer.
- **Login/MSAL**: la decisione se abilitare MSAL è dell'utente in fase di generazione (`loginSupportConfiguration`); il codice generato mantiene sempre entrambi i rami (con/senza Azure) tramite `<% if %>` — non rimuovere i branch condizionali quando modifichi i template.
- **Logging**: usa `LoggerService`/`LoggerFeature` (da `<namePackage>-shared`) solo se `logging === 'advanced'`; altrimenti `console.debug/warn/error` (pattern già presente in tutti i servizi core).
- **Librerie vs app**: qualunque cosa sia genuinely riusabile (pipe, utility, bean generici, infrastruttura HTTP/NgRx) va nella libreria `shared`/`ngrx`, mai duplicata nell'app; qualunque cosa sia specifica di business (AuthService, GlobalService, ErrorService) resta in `core/` nell'app.

## 7. Note per chi modifica il sorgente dello schematic (questo repo)

- **Flusso** (`index.ts`): `normalizeOptionsSync()` (sincrona, nessun Tree) -> una Rule che esegue `resolveWorkspaceOptions()` (progetto, prefix, major Angular, architettura rilevata da `utils/workspace.utils.ts::detectApp`) e solo DOPO costruisce la `chain([...])` con le opzioni definitive.
- **Shell dell'app** (`rules/update-app-shell.rule.ts`): non sovrascrive `app.module.ts`/`app.config.ts`; li *modifica* (`utils/ts-edit.utils.ts`: `addImports`, `addToArrayProperty`, idempotenti) cosi' si preservano le scelte di `ng new` (es. `provideZoneChangeDetection` vs zoneless in Angular 21). I file di destinazione hanno i nomi reali del progetto (Angular 19: `app.component.ts`/`app.module.ts`; 20+: `app.ts`/`app.html`/`app-module.ts`). Template di shell: `files/shell` (html root), `files/shell-classic`, `files/shell-standalone`.
- Template per architettura: `files/core/module` e `files/core/msal-classic`, `files/home-classic` solo classic; `files/core/standalone` solo standalone (vedi `add-template-files.rule.ts`). Nessun file generato deve restare inutilizzato.
- Versioni: tabella per major in `utils/versions.utils.ts` (range pinnati; **unica eccezione esplicita** richiesta dall'utente: `pl-core-utils-library`, `pl-decorator` e `pl-loading-trace` sono sempre `latest`; nessun accesso alla rete). Per una nuova major di Angular: aggiungerla a `SUPPORTED_ANGULAR_MAJORS`, verificare i peer (`npm view <pkg>@<v> peerDependencies`) ed eseguire la matrice e2e.
- JSON: usare sempre `readJsonFile`/`overwriteJsonFile` (`utils/json.utils.ts`): JSONC-aware (il `tsconfig.json` di `ng new` ha commenti), la scrittura tocca solo le chiavi cambiate.
- **Test**: `npm test` (build + `test/unit/*.spec.js`, `SchematicTestRunner`); `npm run test:e2e[:19|:20|:21]` (`tools/e2e-matrix.js`: `ng new` -> schematic -> `npm install` -> `ng build` app + librerie -> compilazione spec). Gli errori nei template EJS emergono solo cosi': i `.ts` sotto `files/**` non sono compilati dal `tsc` del pacchetto.
- Editing dei template con encoding misto (alcuni file contengono byte cp1252): modificare preservando i byte (niente riscritture complete con encoding diverso).

- I file sotto `src/pl-schematics/files/**` sono **template EJS**, esclusi dalla compilazione TypeScript del pacchetto stesso (`tsconfig.json` → `exclude: ["src/*/files/**/*"]`): `npm run build` **non** li valida. Per validarli bisogna generare davvero un progetto di test (vedi `npm run test:schematic:full` o creare un workspace sintetico ed eseguire `schematics ../src/collection.json:pl-schematics ...`) e compilare l'output con `tsc`.
- Il flag CLI `--force` **non basta più** (a seconda della versione di `@angular-devkit/schematics` installata) a far sovrascrivere file già esistenti nel Tree: `add-class.rule.ts`/`add-library-class.rule.ts` usano esplicitamente `MergeStrategy.Overwrite`.
- `normalizeOptionsSync(options)` (in `normalize-options.rule.ts`) va chiamata **in modo sincrono, prima** di costruire qualunque Rule: `addSharedLibrary`/`addNgrxLibrary` leggono `options.sharedLibName`/`options.ngrxLibName` alla creazione. Le rule che dipendono da architettura/versione di Angular sono costruite dopo `resolveWorkspaceOptions()`.
- Le dipendenze npm dei pacchetti legati alla major version di Angular (`@angular/material`, `@angular/cdk`, `@angular/animations`, `@ngrx/*`, `ng-packagr`) **non usano mai `"latest"`**: la versione deriva dalla major di `@angular/core` del progetto target (`getAngularMajorVersion`/`getVersions` in `utils/versions.utils.ts`); major non supportata o non determinabile => errore. Le sole dipendenze `latest` sono le librerie interne `pl-core-utils-library`, `pl-decorator`, `pl-loading-trace` (scelta esplicita dell'utente).
- **Loader grafico**: e' `pl-loading-trace` (NON `ngx-ui-loader`, che resta solo come peer di `pl-core-utils-library` e non va montato nella UI). Template root: `files/shell/app.component.html` con `<pl-loading-overlay source="router" />` e `<pl-loading-overlay source="http" />`; config in `files/core/utils/pl-loading.config.ts` (`plLoadingTraceOptions`). `PlLoadingModule` (nuovo `core/module/pl-loading.module.ts`, che contiene `PlLoadingTraceModule.forRoot(...)`) in `AppModule` (classic, prima di `SharedModule.forRoot`) o `providePlLoadingTrace(...)` in `app.config.ts` (standalone, prima di `providePlShared`); `PlLoadingOverlayComponent` negli `imports` del root standalone (aggiunto da `update-app-shell.rule.ts`). L'interceptor HTTP del loader e' gia' registrato in `HTTP_INTERCEPTORS` da `forRoot`/`providePlLoadingTrace`: **non registrarlo di nuovo** (ne' come classe, ne' come `plLoadingHttpInterceptor` in `withInterceptors`). **Deve avvolgere** l'interceptor di retry/refresh-token della shared (il suo contatore decrementa a ogni `finalize`: se interno ai retry nasconde lo spinner a ogni tentativo fallito): per questo viene prima nell'ordine degli imports/providers e `providePlShared` (functional) usa `provideHttpClient(withInterceptorsFromDi(), withInterceptors([httpInterceptorFn]))`. Il provider `PlLoadingRegistryService` e' aggiunto a mano nel modulo classic perche' `forRoot` 1.2.x non lo fornisce.
