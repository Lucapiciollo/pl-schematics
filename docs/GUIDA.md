# Guida passo passo ed esempi

Esempi concreti per lavorare sul progetto generato da `pl-schematics`. Completano il [README](../README.md) (opzioni, struttura, comportamento del codice generato) e non lo ripetono: per la procedura di installazione e per il primo avvio vedi [Guida rapida: primo avvio](../README.md#guida-rapida-primo-avvio).

Convenzioni usate negli esempi:

- il progetto e' stato generato con `--name-package=demo`: la cartella applicativa e' `src/app/demo/`, le librerie sono `demo-shared` (`projects/demo-shared`) e `demo-ngrx` (`projects/demo-ngrx`);
- i nomi dei file della shell sono quelli di Angular 20/21 (`app-module.ts`, `app-routing-module.ts`, `app.ts`); su Angular 19 sono `app.module.ts`, `app-routing.module.ts`, `app.component.ts`;
- quando classic e standalone differiscono sono mostrati entrambi; negli esempi sul codice di feature le due architetture differiscono solo per dove si registrano i provider (`providers` di `AppModule` oppure di `appConfig` in `app.config.ts`);
- le nuove applicazioni Angular 21 possono essere create senza `zone.js`: gli esempi aggiornano la vista con `signal` o con la pipe `async`, validi con e senza zone;
- i simboli citati (servizi, token, funzioni) esistono nel codice generato; il file che li definisce e' indicato di volta in volta. Gli esempi non sono generati dallo schematic: sono codice da aggiungere al proprio progetto.

> **Rigenerare lo schematic sovrascrive i file che genera** (template di `core/`, `environment`, e dentro le librerie: `public-api.ts`, `pipe.module.ts`, `root.*.ts`, ...). Prima di rieseguirlo committa le modifiche e, dopo, confronta con `git diff` per riapplicare le tue.

## Indice

| # | Esempio | Dove |
|---|---|---|
| 1 | Primo avvio: `ng new`, generazione, `ng serve` | [README](../README.md#guida-rapida-primo-avvio) |
| 2 | [Chiamare il backend con GlobalService](#2-chiamare-il-backend-con-globalservice) | `GlobalService`, `ErrorBean`, `BASE_URL_API` |
| 3 | [Aggiungere una feature NgRx](#3-aggiungere-una-feature-ngrx) | libreria `demo-ngrx` |
| 4 | [Aggiungere una rotta lazy con RouteFakeGuard](#4-aggiungere-una-rotta-lazy-con-routefakeguard) | classic e standalone |
| 5 | [Task di bootstrap con APP_BOOTSTRAP_TASKS](#5-task-di-bootstrap-con-app_bootstrap_tasks) | config remota prima dell'avvio |
| 6 | [Interceptor HTTP: retry, timeout e 401](#6-interceptor-http-retry-timeout-e-401) | `HttpInterceptorConfig`, adapter |
| 7 | [Configurare il loader pl-loading-trace](#7-configurare-il-loader-pl-loading-trace) | `pl-loading.config.ts` |
| 8 | [Configurare il login Azure MSAL](#8-configurare-il-login-azure-msal) | `environment.azure`, factory MSAL |
| 9 | [Aggiungere una pipe o una utility alla libreria shared](#9-aggiungere-una-pipe-o-una-utility-alla-libreria-shared) | `projects/demo-shared` |
| 10 | Test e build | [README](../README.md#test-e-build-del-progetto-generato) |

Gli esempi 2, 3, 5, 6 e 9 partono dal progetto dell'esempio 1 (`--state=ngrx --http=interceptor-classic --mock-api=node-express`); l'8 richiede `--login-support-configuration=AZURE-ACTIVE-DIRECT`.

## 2. Chiamare il backend con GlobalService

**Obiettivo**: leggere la lista da `GET {baseUrl}/workers`, leggere un elemento per id, gestire l'errore con `ErrorBean`, usare le varianti `*Bg` e dichiarare dove si configura l'indirizzo del BE.

**Prerequisiti**: progetto dell'esempio 1 con `mock-api` in esecuzione (`npm run mock-api`, porta 3001). Il mock espone `GET /api/workers` (3 lavoratori: Mario Rossi, Anna Bianchi, Luca Verdi, il terzo con `active: false`) e `GET /api/workers/:id` (404 con `{ message: 'Worker not found', id }` se l'id non esiste).

**File**: nuovo `src/app/demo/component/page/home/workers.service.ts`; modificati `home.component.ts` e `home.component.html` nella stessa cartella.

Regole da conoscere (dal codice di `core/service/global.service.ts` e `core/service/http.service.ts`):

- si inietta `GlobalService`, non `HttpClient` ne' `HttpService`;
- la richiesta e' un `PlHttpRequest` di `pl-core-utils-library` (2.1.3): `new PlHttpRequest({ url, mocked?, method? }, pathParams, queryParams, body, httpHeaders?)`. Path params, query params e body devono essere **sempre valorizzati** (`{}` o `null`): con `undefined` il costruttore fallisce (`JSON.parse(undefined)`). I path param si scrivono `:nome` nell'url;
- l'url e' **sempre relativo** a `BASE_URL_API` e inizia con `/`: `HttpService` antepone comunque la base url, quindi un url assoluto produrrebbe un indirizzo errato;
- `GlobalService.get`/`post` restituiscono il **body** tipizzato; `put`, `patch`, `delete` e tutte le varianti `*Bg` restituiscono la `HttpResponse` completa. Le varianti `*Bg` non vengono interrotte dal cambio di rotta, le altre si.

```ts
import { HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PlHttpRequest } from 'pl-core-utils-library';

import { GlobalService } from '../../../core/service/global.service';

/** Elemento restituito da GET /api/workers (mock-api generato con --mock-api=node-express). */
export interface WorkerDto {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
}

/** Nessun path param / query param: il costruttore di PlHttpRequest li richiede sempre. */
const NONE = {} as unknown as JSON;

/**
 * Esempio di servizio di feature: passa sempre da GlobalService, mai da HttpClient.
 * Gli url sono RELATIVI a BASE_URL_API e iniziano con '/'.
 */
@Injectable({ providedIn: 'root' })
export class WorkersService {
  private readonly global = inject(GlobalService);

  /** GET {baseUrl}/workers?role=Operator: interrotta al cambio di rotta. */
  list(role?: string): Observable<WorkerDto[]> {
    const query = (role ? { role } : {}) as unknown as JSON;
    const request = new PlHttpRequest({ url: '/workers' }, NONE, query, null);

    return this.global.get<WorkerDto[]>(request);
  }

  /** GET {baseUrl}/workers/:id (path param sostituito da PlHttpRequest). */
  byId(id: number): Observable<WorkerDto> {
    const request = new PlHttpRequest(
      { url: '/workers/:id' },
      { id } as unknown as JSON,
      NONE,
      null,
    );

    return this.global.get<WorkerDto>(request);
  }

  /** POST {baseUrl}/workers: il body e' il 4° argomento; il mock-api generato NON espone questo endpoint. */
  create(worker: Omit<WorkerDto, 'id'>): Observable<WorkerDto> {
    return this.global.post<WorkerDto>(
      new PlHttpRequest({ url: '/workers' }, NONE, NONE, worker),
    );
  }

  /** Variante *Bg: NON viene interrotta dal cambio di rotta e restituisce la HttpResponse completa. */
  refreshInBackground(): Observable<WorkerDto[]> {
    return new Observable<WorkerDto[]>((observer) => {
      this.global.getBg(new PlHttpRequest({ url: '/workers' }, NONE, NONE, null)).subscribe({
        next: (response) => {
          observer.next(response.body as WorkerDto[]);
          observer.complete();
        },
        error: (error: unknown) => observer.error(error),
      });
    });
  }

  /** Header per singola richiesta letti dall'interceptor: timeout di 60 s e nessun retry. */
  exportAll(): Observable<WorkerDto[]> {
    const headers = new HttpHeaders({ timeout: '60000', 'x-skip-retry': '1' });
    const request = new PlHttpRequest({ url: '/workers' }, NONE, NONE, null, headers);

    return this.global.get<WorkerDto[]>(request);
  }
}
```

Componente (`home.component.ts`): le parti nuove sono `workers`, `errorMessage`, `workersService`, `ngOnInit` e `showWorker`; il resto e' quello generato.

```ts
import { Component, Injector, OnInit, inject, signal } from '@angular/core';
import { PlBaseComponent } from 'pl-core-utils-library';

import { ErrorBean } from 'demo-shared';

import { HomeService } from './home.service';
import { WorkerDto, WorkersService } from './workers.service';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [HomeService],
})
export class HomeComponent extends PlBaseComponent implements OnInit {
  /** signal: l'aggiornamento della vista funziona sia con zone.js sia zoneless */
  readonly workers = signal<WorkerDto[]>([]);
  readonly errorMessage = signal('');

  private readonly workersService = inject(WorkersService);

  constructor(protected override injector: Injector) {
    super(injector);
  }

  override ngOnInit() {
    this.workersService.list().subscribe({
      next: (workers) => this.workers.set(workers),
      error: (error: ErrorBean) => this.errorMessage.set(error.message),
    });
  }

  /** Con id inesistente il mock-api risponde 404: l'errore arriva come ErrorBean. */
  showWorker(id: number): void {
    this.errorMessage.set('');
    this.workersService.byId(id).subscribe({
      next: (worker) => this.workers.set([worker]),
      error: (error: ErrorBean) => this.errorMessage.set(error.message),
    });
  }
}
```

Nel componente standalone generato il decorator ha `imports: [SharedModule]` al posto di `standalone: false`: lascia quello che c'e' e aggiungi solo le parti nuove.

Template (`home.component.html`); la riga `{{ 'HOME.TITLE' | translate }}` c'e' solo con `--i18n=ngx-translate` (default):

```html
<p>
  home works! ({{ 'HOME.TITLE' | translate }})
</p>

@if (errorMessage()) {
  <p class="error">{{ errorMessage() }}</p>
}

<ul>
  @for (worker of workers(); track worker.id) {
    <li>{{ worker.firstName }} {{ worker.lastName }} - {{ worker.role }}</li>
  }
</ul>

<button type="button" (click)="showWorker(999)">Carica id inesistente</button>
```

**Gestione errori**. Dai metodi di `GlobalService` l'errore arriva come `ErrorBean` (dalla libreria shared): `message`, `eCode` (`ErrorCode.SYSTEMERRORCODE` o `ErrorCode.NETWORKERROR`), `redirect` e `dialog`. Quando `HttpService` converte un errore generico di rete in `ErrorBean` usa `redirect: false` e `dialog: true`. Il flag `dialog` non apre nulla da solo: un `ErrorBean` non gestito arriva a `ErrorService` (l'`ErrorHandler` di Angular registrato dallo schematic), che lancia gli eventi broadcast `CORE_ERROR_SERVICE_DIALOG` / `CORE_ERROR_SERVICE_REDIRECT` (`core/type/type.event.ts`) che `GlobalService` si limita a scrivere nel log: la dialog o il redirect vanno implementati dall'applicazione ascoltando quegli eventi (`PlCoreUtils.Broadcast().listenEvent(...)`, come fa `GlobalService.registerCoreEvents`). Per lanciare un errore applicativo:

```ts
import { ErrorBean, ErrorCode } from 'demo-shared';

throw new ErrorBean('Dati non validi', ErrorCode.NETWORKERROR, false, true);
```

**Dove si configura l'indirizzo del BE**:

- `src/environments/environment.ts`: `http.api.baseUrl` (default di sviluppo `http://localhost:3001/api`, la porta del `mock-api`);
- `src/environments/environment.prod.ts`: `http.api.baseUrl` (default `/api`, url relativo: l'app e il BE stanno sullo stesso host). La build `production` sostituisce `environment.ts` con questo file (`fileReplacements`);
- il valore e' registrato nel token `BASE_URL_API` (`projects/demo-shared/src/lib/tokens/base-url-api.token.ts`) da `InitializerModule` (classic) o da `provideCore()` (standalone). Per sovrascriverlo senza toccare `core/`, fornisci il token tra i `providers` dell'app **dopo** quelli del core (in un array di provider vince l'ultima registrazione; nei `providers` di `AppModule` vincono sui provider dei moduli importati):

```ts
import { BASE_URL_API } from 'demo-shared';

{ provide: BASE_URL_API, useValue: 'https://api.example.com/v1' },   // senza "/" finale: gli url delle richieste iniziano con "/"
```

**Risultato atteso**: aprendo `http://localhost:4200/#/home` la home elenca i 3 nomi; nel Network di DevTools compare `GET http://localhost:3001/api/workers`. Il pulsante mostra il messaggio dell'errore HTTP (404) nel paragrafo `.error`. Con il `mock-api` spento la `GET` viene ritentata 2 volte con backoff (500 ms, poi 1000 ms) prima di fallire con l'`ErrorBean` (retry dell'interceptor, vedi esempio 6).

**Problemi comuni**:

- `SyntaxError ... "undefined" is not valid JSON` in `new PlHttpRequest(...)`: hai passato `undefined` come path/query param o body; usa `{}` / `null`.
- Url sbagliato (`.../apihttp:...`): hai passato un url assoluto; usa un url relativo a `BASE_URL_API`.
- Errore CORS: il `mock-api` generato abilita CORS; un BE reale deve ammettere l'origine `http://localhost:4200`.
- La vista non si aggiorna in un'app senza `zone.js`: usa `signal` o la pipe `async`, non assegnazioni a campi semplici dentro `subscribe`.

## 3. Aggiungere una feature NgRx

**Obiettivo**: aggiungere alla libreria `demo-ngrx` lo slice `workers` (lista, stato di caricamento, errore) con state, actions, reducer, selectors ed effects, usando come modello gli slice `app` e `storage` generati (`projects/demo-ngrx/src/lib/app/`, `.../storage/`).

**Prerequisiti**: `--state=ngrx`; esempio 2 (il servizio `WorkersService` fornisce i dati).

**Perche' un token**: la libreria `demo-ngrx` e' indipendente dall'app e non puo' importare `GlobalService`. L'effect chiede quindi i dati a una funzione fornita dall'app tramite l'`InjectionToken` `WORKERS_LOADER`.

**File da creare** in `projects/demo-ngrx/src/lib/workers/`:

`workers.state.ts`

```ts
/** Elemento della lista (stessa forma di GET /api/workers del mock-api). */
export interface WorkerItem {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
}

/** Stato dello slice workers. */
export interface WorkersState {
  items: WorkerItem[];
  loading: boolean;
  error: string | null;
}

/** Stato iniziale: lista vuota, nessun caricamento, nessun errore. */
export const initialWorkersState: WorkersState = {
  items: [],
  loading: false,
  error: null,
};
```

`workers.actions.ts`

```ts
import { createAction, props } from '@ngrx/store';

import { WorkerItem } from './workers.state';

export const workersLoad = createAction('[Workers] Load');

export const workersLoadSuccess = createAction(
  '[Workers] Load Success',
  props<{ items: WorkerItem[] }>(),
);

export const workersLoadFailure = createAction(
  '[Workers] Load Failure',
  props<{ error: string }>(),
);
```

`workers.reducer.ts`

```ts
import { createReducer, on } from '@ngrx/store';

import { workersLoad, workersLoadFailure, workersLoadSuccess } from './workers.actions';
import { initialWorkersState, WorkersState } from './workers.state';

/** Chiave dello slice nello store: usata in rootReducers, RootState e nei selector. */
export const workersFeatureKey = 'workers';

/** Reducer puro: nessuna chiamata HTTP qui, solo transizioni di stato. */
export const workersReducer = createReducer(
  initialWorkersState,

  on(workersLoad, (state): WorkersState => ({ ...state, loading: true, error: null })),

  on(workersLoadSuccess, (state, action): WorkersState => ({
    ...state,
    items: action.items,
    loading: false,
  })),

  on(workersLoadFailure, (state, action): WorkersState => ({
    ...state,
    loading: false,
    error: action.error,
  })),
);
```

`workers.selectors.ts`

```ts
import { createFeatureSelector, createSelector } from '@ngrx/store';

import { workersFeatureKey } from './workers.reducer';
import { WorkerItem, WorkersState } from './workers.state';

export const selectWorkersState = createFeatureSelector<WorkersState>(workersFeatureKey);

export const selectWorkers = createSelector(
  selectWorkersState,
  (state: WorkersState): WorkerItem[] => state.items,
);

export const selectWorkersLoading = createSelector(
  selectWorkersState,
  (state: WorkersState): boolean => state.loading,
);

export const selectWorkersError = createSelector(
  selectWorkersState,
  (state: WorkersState): string | null => state.error,
);

/** Selector derivato: solo i lavoratori attivi. */
export const selectActiveWorkers = createSelector(selectWorkers, (items): WorkerItem[] =>
  items.filter((worker) => worker.active),
);
```

`workers.effects.ts`

```ts
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { workersLoad, workersLoadFailure, workersLoadSuccess } from './workers.actions';
import { WorkerItem } from './workers.state';

/**
 * La libreria ngrx e' indipendente dall'app (non puo' importare GlobalService): la sorgente dei dati
 * e' un token che l'app fornisce (vedi AppModule / app.config.ts).
 */
export const WORKERS_LOADER = new InjectionToken<() => Observable<WorkerItem[]>>('WORKERS_LOADER');

@Injectable()
export class WorkersEffects {
  private readonly actions$ = inject(Actions);
  private readonly loader = inject(WORKERS_LOADER);

  /** workersLoad => chiamata al BE => workersLoadSuccess | workersLoadFailure. */
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(workersLoad),
      switchMap(() =>
        this.loader().pipe(
          map((items) => workersLoadSuccess({ items })),
          catchError((error: { message?: string }) =>
            of(workersLoadFailure({ error: error?.message ?? 'Errore di caricamento' })),
          ),
        ),
      ),
    ),
  );
}
```

**File da modificare** (le righe aggiunte sono quelle con `workers` / `Workers`):

`projects/demo-ngrx/src/lib/root.state.ts`: aggiungi lo slice a `RootState`.

```ts
import { WorkersState } from './workers/workers.state';

export interface RootState {
  app: AppState;
  storage: StorageState;
  workers: WorkersState;
}
```

`root.reducers.ts`:

```ts
import { workersFeatureKey, workersReducer } from './workers/workers.reducer';

export const rootReducers: ActionReducerMap<RootState> = {
  [appFeatureKey]: appReducer,
  [storageFeatureKey]: storageReducer,
  [workersFeatureKey]: workersReducer,
};
```

`root.effects.ts`:

```ts
import { WorkersEffects } from './workers/workers.effects';

export const rootEffects = [AppEffects, StorageEffects, WorkersEffects];
```

`root.selectors.ts` (barrel): aggiungi `export * from './workers/workers.selectors';`.

`projects/demo-ngrx/src/public-api.ts`: aggiungi in fondo

```ts
export * from './lib/workers/workers.actions';
export * from './lib/workers/workers.effects';
export * from './lib/workers/workers.reducer';
export * from './lib/workers/workers.selectors';
export * from './lib/workers/workers.state';
```

**Registrazione della sorgente dati** nell'app. Classic, `src/app/app-module.ts` (`providers` di `AppModule`); standalone, `providers` di `appConfig` in `app.config.ts`:

```ts
import { inject, Injector } from '@angular/core';
import { WORKERS_LOADER } from 'demo-ngrx';
import { WorkersService } from './demo/component/page/home/workers.service';

{
  provide: WORKERS_LOADER,
  useFactory: () => {
    const injector = inject(Injector);

    return () => injector.get(WorkersService).list();   // WorkersService si istanzia al primo caricamento
  },
},
```

**Uso nel componente** (alternativa all'esempio 2: sostituisce `home.component.ts`):

```ts
import { Component, Injector, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { PlBaseComponent } from 'pl-core-utils-library';

import { RootState, selectActiveWorkers, selectWorkersError, selectWorkersLoading, workersLoad } from 'demo-ngrx';

import { HomeService } from './home.service';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [HomeService],
})
export class HomeComponent extends PlBaseComponent implements OnInit {
  private readonly store: Store<RootState> = inject(Store);

  /** Observable dallo store: nel template si usa la pipe async (valida anche zoneless). */
  readonly workers$ = this.store.select(selectActiveWorkers);
  readonly loading$ = this.store.select(selectWorkersLoading);
  readonly error$ = this.store.select(selectWorkersError);

  constructor(protected override injector: Injector) {
    super(injector);
  }

  override ngOnInit() {
    this.store.dispatch(workersLoad());
  }
}
```

Template:

```html
@if (loading$ | async) {
  <p>Caricamento...</p>
}
@if (error$ | async; as error) {
  <p class="error">{{ error }}</p>
}

<ul>
  @for (worker of workers$ | async; track worker.id) {
    <li>{{ worker.firstName }} {{ worker.lastName }} - {{ worker.role }}</li>
  }
</ul>
```

**Risultato atteso**: la home elenca solo Mario Rossi e Anna Bianchi (`selectActiveWorkers` filtra `active: true`: Luca Verdi non compare). In Redux DevTools (`StoreDevtoolsModule` e' incluso da `StateModule`) si vedono `[Workers] Load` e `[Workers] Load Success`; lo stato contiene la chiave `workers` accanto ad `app` e `storage`. Se la libreria non compila (`ng build demo-ngrx`), controlla di aver esportato i 5 file da `public-api.ts`.

**Evoluzione per feature lazy (non generata dallo schematic)**: invece di registrare lo slice nello store radice (`root.*`) si puo' registrarlo sulla rotta della feature con `provideState(workersFeatureKey, workersReducer)` e `provideEffects(WorkersEffects)` (rotta con `providers`, standalone) oppure `StoreModule.forFeature(...)` / `EffectsModule.forFeature([...])` nel modulo lazy (classic), togliendo lo slice da `RootState`, `rootReducers` e `rootEffects`. E' la strada standard di NgRx, ma il template non la usa e non e' stata provata sul progetto generato.

## 4. Aggiungere una rotta lazy con RouteFakeGuard

**Obiettivo**: aggiungere la pagina `reports` caricata in lazy, protetta da `RouteFakeGuard` (`canMatch` e `canActivate`), e capire quando il login MSAL entra in gioco.

**File (classic)**: nuovi `src/app/demo/component/page/reports/{reports.component.ts, reports-routing.module.ts, reports.module.ts}`; modificato `src/app/app-routing-module.ts`.

`reports.component.ts`

```ts
import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-reports',
  template: '<p>reports works!</p>',
})
export class ReportsComponent {}
```

`reports-routing.module.ts`

```ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReportsComponent } from './reports.component';

const routes: Routes = [{ path: '', data: { breadcrumb: 'Report' }, component: ReportsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
```

`reports.module.ts`

```ts
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from 'demo-shared';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';

@NgModule({
  declarations: [ReportsComponent],
  imports: [CommonModule, ReportsRoutingModule, SharedModule],
})
export class ReportsModule {}
```

`app-routing-module.ts` (a fianco di `home`, che e' gia' presente):

```ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteFakeGuard } from './demo/core/service/router.fake.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./demo/component/page/home/home.module').then(module => module.HomeModule),
    canMatch: [RouteFakeGuard],
    canActivate: [RouteFakeGuard],
  },
  {
    path: 'reports',
    loadChildren: () => import('./demo/component/page/reports/reports.module').then(module => module.ReportsModule),
    canMatch: [RouteFakeGuard],
    canActivate: [RouteFakeGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
```

**File (standalone)**: nuovo `src/app/demo/component/page/reports/reports.component.ts` (standalone, `imports: [SharedModule]`), modificato `src/app/app.routes.ts`:

```ts
import { Component } from '@angular/core';

import { SharedModule } from 'demo-shared';

@Component({
  selector: 'app-reports',
  imports: [SharedModule],
  template: '<p>reports works!</p>',
})
export class ReportsComponent {}
```

```ts
import { Routes } from '@angular/router';
import { RouteFakeGuard } from './demo/core/service/router.fake.guard';

export const routes: Routes = [
  {
    path: 'home',
    data: { breadcrumb: 'Home' },
    loadComponent: () =>
      import('./demo/component/page/home/home.component').then((module) => module.HomeComponent),
    canMatch: [RouteFakeGuard],
    canActivate: [RouteFakeGuard],
  },
  {
    path: 'reports',
    data: { breadcrumb: 'Report' },
    loadComponent: () =>
      import('./demo/component/page/reports/reports.component').then((module) => module.ReportsComponent),
    canMatch: [RouteFakeGuard],
    canActivate: [RouteFakeGuard],
  },
];
```

**Cosa fa `RouteFakeGuard`** (`core/service/router.fake.guard.ts`): `canMatch` e `canActivateChild` ritornano `true`; `canActivate` ritorna `true`, salvo con login Azure e `AuthService.applicationType.type == 'web'`, dove delega a `MsalGuard`. E' il punto in cui inserire la propria logica (ruoli, token, feature flag). Esempio: non rendere selezionabile la rotta senza token (con `canMatch` che ritorna `false` il chunk lazy non viene scaricato e il router passa alle rotte successive; se nessuna corrisponde segnala che non esiste una rotta valida):

```ts
canMatch(route: Route, segments: UrlSegment[]): boolean {
  return !!localStorage.getItem('token');
}
```

**Nota onesta su `applicationType.type`**. Con il login Azure `AuthService.applicationType` e' un oggetto statico `{ type: '' }`: il template **non** lo valorizza. Finche' resta `''`, `canActivate` ritorna `true` e `MsalGuard` non viene mai invocata; la login all'avvio e' comunque imposta dall'`APP_INITIALIZER` (`AutenticationLoader`). Per attivare la delega l'applicazione deve impostare il tipo prima del bootstrap, ad esempio in `src/main.ts`:

```ts
import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app-module';
import { AuthService } from './app/demo/core/service/auth.service';

// Attiva la delega di RouteFakeGuard.canActivate a MsalGuard (default: '' => nessuna delega).
AuthService.applicationType.type = 'web';

platformBrowser().bootstrapModule(AppModule)
  .catch(err => console.error(err));
```

Con `'teams'` si ottiene invece l'interceptor "fake" al posto di `MsalInterceptor` (`myServiceFactory`). Attenzione: la configurazione di default di `MsalGuard` usa `loginFailedRoute: '/login-failed'` (`core/msal/MSALGuardConfigFactory.ts`) e quella rotta **non e' generata**: se la usi, crea la pagina.

**Risultato atteso**: `http://localhost:4200/#/reports` mostra `reports works!`; alla prima visita il Network mostra il download di un chunk JavaScript separato (caricamento lazy) e, durante il cambio rotta, la barra del loader in cima alla pagina (se il caricamento supera il `debounceMs`).

**Problemi comuni**:

- pagina bianca su `/`: nessuna rotta vuota e' generata, si entra da `/#/home` (o aggiungi `{ path: '', redirectTo: 'home', pathMatch: 'full' }`);
- `NG04002: Cannot match any routes` dopo un `canMatch` che ritorna `false`: e' il comportamento atteso (la rotta non e' selezionabile); usa `canActivate` per bloccare la navigazione senza cercare altre rotte;
- su Angular 19 il file di routing si chiama `app-routing.module.ts`.

## 5. Task di bootstrap con APP_BOOTSTRAP_TASKS

**Obiettivo**: caricare una configurazione remota (feature flag) **dopo la login e prima che l'app parta**.

**Come funziona** (`core/initializer/AutenticationLoader.ts`): l'`APP_INITIALIZER` bloccante esegue `AuthService.login()` e solo dopo, in parallelo (`forkJoin`), tutte le funzioni registrate nel token multi-provider `APP_BOOTSTRAP_TASKS` (`Observable<boolean>` o `Promise<boolean>`). Se la login o anche un solo task va in errore l'app non parte. Il valore emesso dal task **non** viene valutato: per bloccare l'avvio il task deve andare in errore (`throwError` / `reject`), non emettere `false`; un `Observable` che completa senza emettere lascia l'avvio appeso.

**File**: nuovo `src/app/demo/core/service/remote-config.service.ts`; nuovo `src/assets/public/remote-config.json`; registrazione in `AppModule` (classic) o in `appConfig` (standalone).

Il servizio usa `HttpClient` e non `GlobalService` perche' il file e' un asset dell'app, non una risorsa di `BASE_URL_API`:

```ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

/** Forma del file assets/public/remote-config.json. */
export interface RemoteConfig {
  featureFlags: Record<string, boolean>;
}

@Injectable({ providedIn: 'root' })
export class RemoteConfigService {
  private readonly http = inject(HttpClient);
  private config: RemoteConfig | null = null;

  /**
   * Task di bootstrap: deve EMETTERE un valore (e completare) per far partire l'app;
   * se va in errore il portale non parte. Il valore emesso (true/false) non viene valutato.
   */
  load(): Observable<boolean> {
    return this.http.get<RemoteConfig>('assets/public/remote-config.json').pipe(
      tap((config) => (this.config = config)),
      map(() => true),
    );
  }

  isEnabled(flag: string): boolean {
    return !!this.config?.featureFlags[flag];
  }
}
```

`src/assets/public/remote-config.json` (la cartella `src/assets` e' servita come `assets/` dalla configurazione di `angular.json` generata):

```json
{ "featureFlags": { "newDashboard": true } }
```

Registrazione, nei `providers` di `AppModule` (classic) o di `appConfig` (standalone):

```ts
import { APP_BOOTSTRAP_TASKS } from 'demo-shared';
import { RemoteConfigService } from './demo/core/service/remote-config.service';

{
  provide: APP_BOOTSTRAP_TASKS,
  useFactory: (config: RemoteConfigService) => () => config.load(),
  deps: [RemoteConfigService],
  multi: true,
},
```

Uso: `inject(RemoteConfigService).isEnabled('newDashboard')` in qualsiasi componente o guard (ad esempio dentro `RouteFakeGuard.canMatch`, esempio 4).

**Risultato atteso**: nel Network, `remote-config.json` viene richiesto all'avvio, prima di qualsiasi chiamata di una pagina; l'app parte e `isEnabled('newDashboard')` ritorna `true`. Rinominando il file la richiesta risponde 404, il task va in errore e il portale non si avvia (errore in console, nessuna pagina).

**Problemi comuni**: un task che non completa blocca l'avvio per sempre (nessun timeout predefinito: aggiungi `timeout(...)` di RxJS se serve); i task girano **dopo** la login: con Azure non puoi usarli per decidere se fare login.

## 6. Interceptor HTTP: retry, timeout e 401

**Obiettivo**: cambiare retry e backoff, usare un adapter con refresh token reale e capire cosa succede su un 401.

**Prerequisiti**: `--http=interceptor-classic` (o `interceptor-functional`). L'interceptor e' `HttpInterceptorService` in `projects/demo-shared/src/lib/interceptor/`, registrato **una sola volta** da `SharedModule.forRoot(appSharedConfig)` / `providePlShared(appSharedConfig)`.

**Default** (`DEFAULT_HTTP_INTERCEPTOR_CONFIG`, `lib/http/http-interceptor.tokens.ts`): `enableRetry: true`, `maxRetryAttempts: 2`, `retryDelayMs: 500`, `retryBackoffMultiplier: 2`, `maxRetryDelayMs: 8000`, `retryableStatusCodes: [408, 429, 500, 502, 503, 504]`, `retryOnNetworkError`/`retryOnTimeoutError: true`, `retryOnlyIdempotentMethods: true` (solo `GET`, `HEAD`, `OPTIONS`, `PUT`, `DELETE`), timeout `defaultTimeout` (`environment.http.timeout`, 30000 ms). L'attesa del tentativo *n* e' `min(retryDelayMs * retryBackoffMultiplier^(n-1), maxRetryDelayMs)`.

**Per richiesta**, con `HttpHeaders` nel quinto argomento di `PlHttpRequest` (vedi `exportAll()` nell'esempio 2): `timeout: '60000'` (timeout in ms), `x-skip-retry` (nessun retry), `x-skip-auth` (nessun token e nessuna gestione del 401).

**Cambiare la configurazione**. `appSharedConfig` (`core/utils/shared.config.ts`) porta nella libreria solo timeout, url di refresh e log dei tempi: gli altri parametri si passano con `provideHttpInterceptorConfig` (esportata da `demo-shared`), che sostituisce `HTTP_INTERCEPTOR_CONFIG` e, opzionalmente, l'adapter. Non chiamare di nuovo `provideHttpInterceptor`: registrerebbe un secondo interceptor e ogni richiesta verrebbe eseguita due volte. Poiche' il token viene sostituito per intero, vanno ripetuti i valori che arrivavano dall'environment:

```ts
import { HTTP_AUTH_ADAPTER, provideHttpInterceptorConfig } from 'demo-shared';

import { environment } from '../../../../environments/environment';
import { ApiAuthAdapter } from './api-auth.adapter';

/**
 * Sostituisce config e adapter registrati da SharedModule.forRoot / providePlShared.
 * NON chiama provideHttpInterceptor(): l'interceptor e' gia' registrato e andrebbe in doppio.
 * Ripete i valori che appSharedConfig ricava dall'environment (il token viene sostituito per intero).
 */
export const appHttpInterceptorProviders = provideHttpInterceptorConfig(
  {
    defaultTimeout: environment.http.timeout,
    refreshUrlIncludes: environment.http.api.refreshToken,
    enableExecutionTimeLog: environment.http.enableExecutionTimeLog,
    reloadOnRefreshFailure: true,

    maxRetryAttempts: 3,
    retryDelayMs: 1000,
    retryBackoffMultiplier: 2,
    maxRetryDelayMs: 10000,
    retryableStatusCodes: [502, 503, 504],
  },
  { provide: HTTP_AUTH_ADAPTER, useExisting: ApiAuthAdapter },
);
```

Registrazione: `...appHttpInterceptorProviders` nei `providers` di `AppModule` (prevalgono sui provider portati da `SharedModule.forRoot`) oppure nei `providers` di `appConfig`, **dopo** `providePlShared(appSharedConfig)` (l'ultima registrazione vince).

**Adapter con refresh reale** (quello di default, `LocalStorageAuthAdapterService`, non lo implementa):

```ts
import { HttpBackend, HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpAuthAdapter, HttpRefreshTokenResponse } from 'demo-shared';

import { environment } from '../../../../environments/environment';

/**
 * Adapter con refresh reale. HttpClient costruito su HttpBackend: la richiesta di refresh NON passa dagli
 * interceptor (con il normale HttpClient si avrebbe una dipendenza circolare con HttpInterceptorService).
 */
@Injectable({ providedIn: 'root' })
export class ApiAuthAdapter implements HttpAuthAdapter {
  private readonly http = new HttpClient(inject(HttpBackend));

  getAccessToken(): string | null {
    return localStorage.getItem('token');
  }

  setAccessToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
  }

  /** Il BE deve restituire { accessToken, refreshToken? }. */
  refreshToken(): Observable<HttpRefreshTokenResponse> {
    return this.http.post<HttpRefreshTokenResponse>(environment.http.api.refreshToken, {
      refreshToken: this.getRefreshToken(),
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.reload();
  }
}
```

**Cosa fa su un 401** (`HttpInterceptorService.handle401Error`):

1. nessun retry: il 401 non e' tra gli status ritentabili;
2. se non e' gia' in corso un refresh, chiama `adapter.refreshToken()`; le altre richieste restano in attesa del nuovo token (una sola richiesta di refresh alla volta);
3. al successo salva il nuovo token (`setAccessToken`, `setRefreshToken` se presente) e ripete la richiesta originale con il nuovo `Authorization`;
4. al fallimento (errore, o risposta senza `accessToken`) scrive il log, chiama `adapter.logout()` e rilancia l'errore. Con l'adapter di default `logout()` cancella `token` e `refreshToken` dal `localStorage` e **ricarica la pagina**; se l'adapter non ha `logout`, ricarica la pagina quando `reloadOnRefreshFailure` e' `true`;
5. la richiesta di refresh e' riconosciuta da `refreshUrlIncludes` e non viene mai ritentata ne' rifatta su 401.

Con il login Azure, in aggiunta, `GlobalService` ascolta l'evento `CORE_HTTP_AJAX_ERROR` e su status 401 rilancia `AuthService.login()`.

**Risultato atteso / come verificarlo**: spegni il `mock-api` e carica la home: nel Network vedi la `GET /workers` ripetuta (con `maxRetryAttempts: 3` e `retryDelayMs: 1000`: dopo ~1 s, ~2 s, ~4 s) e, alla fine, l'`ErrorBean` nell'esempio 2. Con `retryableStatusCodes: [502, 503, 504]` un `500` non viene piu' ritentato. Per il log dei tempi (`HTTP execution time`, `enableExecutionTimeLog`) con `--logging=advanced` apri la console del browser.

**Problemi comuni**:

- ogni richiesta parte due volte: l'interceptor e' registrato in due punti (non richiamare `provideHttpInterceptor`);
- `NG0200` (dipendenza circolare) nell'adapter: non iniettare `HttpClient`; costruiscilo su `HttpBackend` come nell'esempio;
- ricarica continua della pagina su 401: adapter di default senza refresh (vedi sopra) o endpoint di refresh che risponde errore.

## 7. Configurare il loader pl-loading-trace

**Obiettivo**: regolare debounce, animazione per le chiamate di rete e per il cambio rotta, ed escludere alcuni url dal loader.

**File**: `src/app/demo/core/utils/pl-loading.config.ts` (`plLoadingTraceOptions`, letto da `PlLoadingModule` in classic e da `providePlLoadingTrace(...)` in standalone). Gli overlay `<pl-loading-overlay source="router" />` e `<pl-loading-overlay source="http" />` sono nel template del componente root: non vanno duplicati.

Configurazione generata: `shared: { debounceMs: 200 }`, `http: { animationType: 'spinner', modal: true }`, `router: { animationType: 'bar' }`. Esempio modificato:

```ts
import { PlLoadingTraceOptions } from 'pl-loading-trace';

export const plLoadingTraceOptions: PlLoadingTraceOptions = {
  /** valori comuni: nessun overlay per le richieste piu' brevi di 300 ms */
  shared: { debounceMs: 300 },
  /** spinner modale con etichetta; i file di traduzione e l'health check non accendono il loader */
  http: {
    animationType: 'spinner',
    modal: true,
    label: 'Caricamento...',
    excludeUrls: ['/assets/public/i18n/', '/health'],
  },
  /** barra in cima alla pagina, con i colori del tema indigo-pink */
  router: { animationType: 'bar', barColorStart: '#3f51b5', barColorEnd: '#ff4081' },
};
```

- `shared` vale per tutti gli overlay; `http` e `router` lo specializzano. `debounceMs` e' un debounce solo all'avvio: le richieste piu' brevi non mostrano l'overlay, che si nasconde subito a fine caricamento (default della libreria 150 ms, 200 nel template).
- `excludeUrls`: sottostringhe confrontate con l'url completo della richiesta (che include la base url).
- altre opzioni (`enableHttpTracer`, `enableRouterTracer`, `position`, `animationType` tra oltre 100 animazioni, `color`, `size`, `barColorStart`/`barColorEnd`, `label`, `zIndex`, ...) e l'elenco delle animazioni sono nel README di [`pl-loading-trace`](https://www.npmjs.com/package/pl-loading-trace) e nella demo online <https://lucapiciollo.github.io/loadingTrace-demo/>.

**Risultato atteso**: cambiando rotta compare la barra in cima con il gradiente indigo/rosa; le chiamate HTTP che durano piu' di 300 ms mostrano lo spinner modale con la scritta "Caricamento..."; le richieste verso `/assets/public/i18n/` e `/health` non lo accendono. Per vederlo in locale limita la velocita' dal pannello Network di DevTools (ad esempio "Slow 4G") oppure imposta temporaneamente `debounceMs: 0`.

**Problemi comuni**: non cambiare l'ordine di `PlLoadingModule` / `providePlLoadingTrace` rispetto a `SharedModule.forRoot` / `providePlShared` (il loader deve avvolgere retry e refresh dell'interceptor, altrimenti lo spinner scompare tra un tentativo e l'altro); non registrare un secondo interceptor del loader.

## 8. Configurare il login Azure MSAL

**Obiettivo**: far partire il login Microsoft Entra ID (Azure AD) con la registrazione della propria app e verificarlo in locale.

**Prerequisiti**: generazione con `--login-support-configuration=AZURE-ACTIVE-DIRECT` (installa `@azure/msal-angular` ^6, `@azure/msal-browser` ^5 e `@microsoft/microsoft-graph-client`; con `http=none` viene forzato `interceptor-classic`).

**Passi sul portale Azure** (nomi dell'interfaccia in inglese):

1. *Microsoft Entra ID* > *App registrations* > *New registration*; scegli i tipi di account supportati.
2. In *Redirect URI* scegli la piattaforma *Single-page application (SPA)* e inserisci `http://localhost:4200` (identico a `environment.azure.redirectUri`; per l'ambiente di produzione registra anche la URL pubblica).
3. Dalla pagina *Overview* copia *Application (client) ID* e *Directory (tenant) ID*.
4. *API permissions*: con lo scope di default `user.read` basta *Microsoft Graph* > *User.Read* (delegated).

**Passi nel progetto**: compila il blocco `azure` di `src/environments/environment.ts` (e di `environment.prod.ts`, i cui `redirectUri` / `postLogoutRedirectUri` generati sono `'/'`). Il tenant fa parte di `authority`:

```ts
azure: {
  clientId: '11111111-2222-3333-4444-555555555555',                              // Application (client) ID
  authority: 'https://login.microsoftonline.com/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', // Directory (tenant) ID
  redirectUri: 'http://localhost:4200',
  postLogoutRedirectUri: 'http://localhost:4200',
  scope: {
    consentScopes: ['user.read'],
  },
},
```

(i valori generati sono i segnaposto `CHANGE_ME_CLIENT_ID` e `CHANGE_ME_TENANT_ID`; quelli sopra sono d'esempio).

**Quali richieste ricevono il token**: `MsalInterceptor` aggiunge il token solo agli url della `protectedResourceMap` di `MSALInterceptorConfigFactory` (`core/msal/`): per default `https://graph.microsoft.com/v1.0/me` e `environment.http.api.baseUrl`, entrambi con gli `consentScopes`. Se il tuo BE ha uno scope proprio (*Expose an API*), sostituisci la factory senza modificare i file del core, fornendo il token `PL_MSAL_INTERCEPTOR_CONFIG_FACTORY` (`core/msal/msal-auth.tokens.ts`; analoghi `PL_MSAL_INSTANCE_FACTORY` e `PL_MSAL_GUARD_CONFIG_FACTORY`):

```ts
import { MsalInterceptorConfiguration } from '@azure/msal-angular';
import { InteractionType } from '@azure/msal-browser';

import { environment } from '../../../../environments/environment';

/**
 * Sostituisce MSALInterceptorConfigFactory: il BE ha un proprio scope (exposed API), Graph resta su user.read.
 * Le chiavi della mappa sono url (o prefissi/pattern) delle richieste a cui MsalInterceptor aggiunge il token.
 */
export function MSALApiInterceptorConfigFactory(): MsalInterceptorConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap: new Map<string, Array<string>>([
      ['https://graph.microsoft.com/v1.0/me', environment.azure.scope.consentScopes],
      [environment.http.api.baseUrl, ['api://00000000-0000-0000-0000-000000000000/access_as_user']],
    ]),
  };
}
```

```ts
import { PL_MSAL_INTERCEPTOR_CONFIG_FACTORY } from './demo/core/msal/msal-auth.tokens';
import { MSALApiInterceptorConfigFactory } from './demo/core/msal/MSALApiInterceptorConfigFactory';

// nei providers di AppModule (classic) o di appConfig, dopo provideCore() (standalone)
{ provide: PL_MSAL_INTERCEPTOR_CONFIG_FACTORY, useValue: MSALApiInterceptorConfigFactory },
```

Lo scope `api://.../access_as_user` e' un valore d'esempio: usa quello esposto dalla tua API. Il codice del BE deve validare il token (audience/scope).

**Come verificare in locale**:

1. `ng serve`: l'`APP_INITIALIZER` esegue `AuthService.login()`; senza account il browser viene mandato a `login.microsoftonline.com`. Dopo l'accesso torni su `http://localhost:4200` (poi apri `/#/home`).
2. In DevTools > *Application* > *Local Storage* compaiono le chiavi `msal.*` (`cacheLocation: 'localStorage'`).
3. Nel Network, le richieste verso `baseUrl` portano `Authorization: Bearer ...` (aggiunto da `MsalInterceptor` per gli url della mappa).
4. Per provare Microsoft Graph: `inject(GlobalService).getUserName().then(console.log)` da un componente (restituisce il `displayName` di `/me`).

**Limiti noti**: il flusso e' verificato solo fino al redirect verso `login.microsoftonline.com` (nessuna credenziale reale nei test automatici); l'interceptor MSAL con `http=interceptor-functional` non e' stato provato a runtime; il routing a hash (`#/`) insieme al redirect MSAL non e' coperto da test. Se il redirect torna su un url con frammento `#code=...` e il router non lo riconosce, verifica `redirectUri` e la registrazione SPA.

**Problemi comuni**: vedi nelle FAQ del README `BrowserAuthError: interaction_in_progress`; `AADSTS50011` (redirect URI non corrispondente): l'URI registrata deve coincidere esattamente con `redirectUri`; `AADSTS9002326`: la piattaforma dell'URI deve essere *SPA* e non *Web*.

## 9. Aggiungere una pipe o una utility alla libreria shared

**Obiettivo**: aggiungere la pipe `initials` e la funzione `slugify` a `projects/demo-shared` e usarle nell'app.

**File**: nuovi `projects/demo-shared/src/lib/pipe/initials.pipe.ts` e `projects/demo-shared/src/lib/utils/slugify.ts`; modificati `projects/demo-shared/src/lib/pipe/pipe.module.ts` e `projects/demo-shared/src/public-api.ts`.

Le pipe condivise sono dichiarate (`standalone: false`) in `PipeModule` ed esportate da `SharedModule`: un'app classic le ottiene importando `SharedModule` (lo fanno `HomeModule` e ogni modulo di feature); un componente standalone lo importa direttamente (`imports: [SharedModule]`, come `HomeComponent`).

`initials.pipe.ts`

```ts
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe "initials": iniziali di un nome completo. Uso: {{ 'Mario Rossi' | initials }} => MR
 */
@Pipe({
  standalone: false,
  name: 'initials',
})
export class InitialsPipe implements PipeTransform {
  transform(value: string | null | undefined, max = 2): string {
    if (!value) {
      return '';
    }

    return value
      .trim()
      .split(/\s+/)
      .slice(0, max)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }
}
```

`slugify.ts`

```ts
/** Trasforma un testo in uno slug: "Report Mensile" => "report-mensile". */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

`pipe.module.ts`: aggiungi import e voce nell'array `PIPES` (e' usato sia per `declarations` sia per `exports`):

```ts
import { InitialsPipe } from './initials.pipe';

const PIPES = [
  // ...pipe esistenti
  FirstCharPipe,
  InitialsPipe,
  LocalizedDatePipe,
  // ...
];
```

`public-api.ts`: tutto cio' che deve essere importabile dall'app va riesportato qui.

```ts
export * from './lib/pipe/initials.pipe';
export * from './lib/utils/slugify';
```

Uso in un componente che importa `SharedModule` (template e TypeScript):

```html
<span class="avatar">{{ worker.firstName + ' ' + worker.lastName | initials }}</span>
```

```ts
import { slugify } from 'demo-shared';

const path = '/reports/' + slugify('Report Mensile');   // '/reports/report-mensile'
```

**Risultato atteso**: `Mario Rossi` diventa `MR`; `slugify('Report Mensile')` ritorna `report-mensile`. `ng build demo-shared` compila la libreria (output in `dist/demo-shared/`); in sviluppo non serve, perche' `tsconfig.json` mappa `demo-shared` direttamente su `projects/demo-shared/src/public-api.ts`.

**Problemi comuni**:

- `NG8004: No pipe found with name 'initials'`: la pipe non e' in `PIPES`/non e' esportata, oppure il modulo/componente che la usa non importa `SharedModule`;
- `Module '"demo-shared"' has no exported member`: manca la riga in `public-api.ts`;
- la libreria shared **non** deve importare l'app (ne' `environment`): la configurazione le arriva da `appSharedConfig`;
- rieseguire lo schematic riscrive `pipe.module.ts` e `public-api.ts`: riapplica le due modifiche.
