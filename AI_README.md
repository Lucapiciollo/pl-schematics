# AI_README.md — Guida di contesto per assistenti AI / LLM

> **Prompt di contesto — incolla questo blocco a un LLM/agente AI prima di chiedergli di lavorare su questo repository o su un progetto generato con questo tool:**
>
> "Stai lavorando con (o su) **pl-schematics**, uno schematic per Angular CLI (`@angular-devkit/schematics`) che **standardizza l'architettura iniziale di un progetto Angular enterprise**. Non è una libreria di componenti UI e non genera business logic applicativa: applica un pattern di progetto (cartelle, moduli, servizi core, autenticazione, gestione errori, HTTP, state management) su un progetto Angular nuovo o esistente, tramite `schematics pl-schematics:pl-schematics --force`. Il risultato è: un layer applicativo `core` (autenticazione MSAL opzionale, interceptor HTTP con retry e refresh-token, servizio `GlobalService` come punto centrale di dispatch per le chiamate al BE) e due **librerie Angular reali** generate nel workspace (`projects/<nome>-shared`, e se richiesto `projects/<nome>-ngrx`), non semplici cartelle. Se ti viene chiesto di modificare il **sorgente dello schematic** (questo repo, cartella `src/pl-schematics/files/**`), ricorda che quei file sono **template EJS** (`<% if (...) { %> ... <% } %>`, `<%= variabile %>`), processati con le opzioni dello schema al momento della generazione: non sono codice TypeScript eseguito direttamente da questo repo, ma testo che diventerà codice TypeScript nel progetto target. Se ti viene chiesto di lavorare su un **progetto generato** da questo schematic, segui le convenzioni descritte più sotto (GlobalService come punto di dispatch HTTP, ErrorBean per gli errori, pattern NgRx in `projects/<nome>-ngrx/src/lib`, injection token per configurazione) invece di inventarne di nuove."

---

## 1. Cos'è pl-schematics

`pl-schematics` è un pacchetto npm (`schematics`) che, una volta installato in un progetto Angular CLI, applica un pattern architetturale enterprise tramite:

```sh
ng new my-app                    # progetto Angular standard
npm i pl-schematics@<versione>
schematics pl-schematics:pl-schematics --force
```

Non crea un'app da zero (serve `ng new` prima): **arricchisce/standardizza** un workspace Angular CLI esistente.

## 2. Cosa genera (in sintesi)

- **`src/app/<namePackage>/core/`** — layer applicativo, sempre nel progetto (non libreria):
  - `service/auth.service.ts` — login/logout, integrazione MSAL v3 (`@azure/msal-angular`) quando abilitata, altrimenti login "bypassata" (emula sempre successo, punto di innesto per SSO custom).
  - `service/http.service.ts` — wrapper tipizzato attorno a `PlHttpService` di `pl-core-utils-library` (GET/POST/PUT/DELETE/PATCH + varianti *BG non interrotte dal routing, STREAM, FORKJOIN, DOWNLOAD).
  - `service/global.service.ts` — **punto centrale di dispatch per le chiamate al BE**: espone `get/getBg/post/postBg/put/putBg/patch/patchBg/delete` che delegano a `HttpService`. I componenti feature dovrebbero iniettare `GlobalService`, non `HttpService` direttamente. Centralizza anche eventi broadcast (`pl-core-utils-library`), errori globali, redirect/re-login su 401.
  - `service/error.service.ts` — `ErrorHandler` globale Angular, converte errori in `ErrorBean` ed eventi broadcast.
  - `service/router.fake.guard.ts` — guard segnaposto (con MSAL diventa reale via `MsalGuard`, altrimenti lascia sempre passare).
  - `module/initializer.module.ts` — modulo di bootstrap: registra `BASE_URL_API`, cache/log config, MSAL (se abilitato), e due `APP_INITIALIZER`: uno per l'ambient mode, uno per `AutenticationLoader` (login + task di bootstrap custom, vedi §5).
  - `module/msal/` — wiring MSAL v3 (solo se login = Azure AD), con injection token dedicati per sovrascrivere le factory di default.
  - `initializer/`, `utils/`, `type/` — supporto.

- **`projects/<namePackage>-shared/`** — **libreria Angular vera** (ng-packagr, non una cartella):
  - `SharedModule` (CommonModule, HttpClientModule, FormsModule, PipeModule, TranslateModule, opzionalmente MaterialModule/StateModule).
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
| `namePackage` | stringa (obbligatoria) | Nome cartella app sotto `src/app/`, e prefisso per i nomi delle librerie (`<namePackage>-shared`, `<namePackage>-ngrx`) |
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
| `architecture` | `classic`\|`standalone` | *(supporto standalone non ancora completo)* |
| `tests` | `none`\|`jasmine`\|`jest` | |
| `strict` | boolean | |

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

- I file sotto `src/pl-schematics/files/**` sono **template EJS**, esclusi dalla compilazione TypeScript del pacchetto stesso (`tsconfig.json` → `exclude: ["src/*/files/**/*"]`): `npm run build` **non** li valida. Per validarli bisogna generare davvero un progetto di test (vedi `npm run test:schematic:full` o creare un workspace sintetico ed eseguire `schematics ../src/collection.json:pl-schematics ...`) e compilare l'output con `tsc`.
- Il flag CLI `--force` **non basta più** (a seconda della versione di `@angular-devkit/schematics` installata) a far sovrascrivere file già esistenti nel Tree: `add-class.rule.ts`/`add-library-class.rule.ts` usano esplicitamente `MergeStrategy.Overwrite`.
- `normalizeOptionsSync(options)` (in `normalize-options.rule.ts`) va chiamata **in modo sincrono, prima** di costruire l'array passato a `chain([...])` in `index.ts`: diverse rule (es. `addSharedLibrary`/`addNgrxLibrary`) leggono `options.sharedLibName`/`options.ngrxLibName` in modo sincrono al momento della creazione della chain, **prima** che qualunque Rule (lazy per definizione) abbia potuto eseguire il proprio corpo.
- Le dipendenze npm dei pacchetti legati alla major version di Angular (`@angular/material`, `@angular/cdk`, `@angular/animations`, `@ngrx/*`, `ng-packagr`) **non usano mai `"latest"`**: la versione viene derivata dalla `@angular/core` già presente nel `package.json` del progetto target (`getAngularMajorVersion` in `add-package-json-dependencies.rule.ts`), per evitare conflitti di peer-dependency al primo `npm install`.
