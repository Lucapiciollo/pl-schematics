### Continuous Integration: Azure DevOps & GitHub Actions

- **CI Azure DevOps (`files/ci-azure-devops/`)**  
    Genera template di pipeline YAML per Azure DevOps, già configurati per build, test, lint, deploy e step personalizzati. Pronti all’uso e facilmente estendibili.
  
    _Esempio:_
    ```yaml
    # azure-pipelines.yml generato
    trigger:
        - main
    pool:
        vmImage: 'ubuntu-latest'
    steps:
        - script: npm install
        - script: npm run build
        - script: npm test
    ```

- **CI GitHub Actions (`files/ci-github-actions/`)**  
    Genera workflow YAML per GitHub Actions, con job per installazione, build, test, lint e deploy. Subito pronto per progetti Angular.
  
    _Esempio:_
    ```yaml
    # .github/workflows/ci.yml generato
    name: CI
    on:
        push:
            branches: [ main ]
    jobs:
        build:
            runs-on: ubuntu-latest
            steps:
                - uses: actions/checkout@v2
                - name: Install
                    run: npm install
                - name: Build
                    run: npm run build
                - name: Test
                    run: npm test
    ```

_Vantaggi:_
- Pipeline pronte e standard
- Facilità di integrazione continua e deploy automatico
- Riduzione errori di configurazione
### Mock API per sviluppo locale (`files/mock-api-node/`)

- **Mock API Node**  
    Genera servizi backend simulati per localhost, utili per sviluppare e testare frontend senza dipendenze da API reali. Permette di definire risposte, delay, errori simulati e persistenza temporanea dei dati.
  
    _Esempio:_
    ```sh
    npm run mock:api
    # Avvia un server mock su http://localhost:3000 con le route definite in files/mock-api-node/
    ```
    _Vantaggi:_
    - Sviluppo frontend indipendente dal backend
    - Test di casi limite e errori
    - Demo e prototipazione rapida
#  <p id="presentazione">Portable Library Schematics</p>

  
pl-schematics nasce dall'esigenza di standardizzare il preocesso di creazione di applicazioni angular > 2, ha lo scopo di velocizzare la realizzazione della struttura core applicativa, mettendo a diaposizione un pattern di sviluppo ben preciso e collaudato.. inoltre predispone una serie di funzionalità gia pronte all'uso che non necessitano di configurazioni, come intercettori di rete, di rotte, servizi http con kill di processo in caso di cambio rotta, funzionalità di download e uploadfile e tanto altro.


L'obbiettivo di questa libreria è abbattere le tempistiche di realizzazione di un applicazione angular di molti giorni uomo, riducendo drasticamente il tempo di startup del sistema, dando la possibilità anche ai piu junior di dedicarsi allo siluppo in modo semplificato, utilizzando le risorse messe a disposizione, lasciando solo il compito di creare componenti grafici.

pl-schematics è l'autrice della manipolazione del pacchetto angular, sia di nuova fattura che su di un progetto esistente.. ma per un funzionamento completo si avvale di un'altra libreria, pl-core-utils che si occupa di mredisporre le vere funzionalità core.

---



#  Presentazione Tecnica

  
pl-schematics, come gia detto, si propone sia in contesti dove lo sviluppo è gia avviato, che in quelli dove si parte da zero, ovviamente in questo caso si trova giovamento nel suo utilizzo

## <p id="applicazione"> Applicazione della libreria su un nuovo progetto</p>
1. Creazione di uprogetto con i comandi standard di angular
> ng new Project-Name

2. Installazione della libreria

> npm i pl-schematics@version

3. Applicazione del pattern

 - Adattamento del progetto al patter
> schematics pl-schematics:pl-schematics --force

<br>

Durante l'installazione, è richiesta l'interazine con lo sviluppatore per l'inizializzazione del sistema. Verranno richieste diverse informazioni, come:

![alt text](https://firebasestorage.googleapis.com/v0/b/workspace-pl.appspot.com/o/img%2Fschematics%2Fapplicazione-pattern.PNG?alt=media&token=62b982f0-b06d-46a2-bd06-942d6b604a4a)

Con la configurazione sopra riportata, si sta chiedendo alla libreria di inizializzare per noi tutto il processo di login con il sistema AZURE, di rendere disponibile il funzionamento della web-app con il sistema chrome e di inizializzare SONAR e Bootstrap 4. Come si vede è stato specificato anche il nome di un package dove verrà sistemata tutta la gerarchia di classi generate dalla stessa.

> Con la richiesta di configurare il pacchetto per l'autenticazione AZURE, il progetto viene sottoposto a particolari configurazioni, vengono installate librerie MSAL di microsoft. Vengono intercettate tutte le chiamate di rete, e vengono corredate di un tokenId staccato al momento della login, tutte le rotte sono intercettate per verificare se il token è ancora valido, in caso verrà prelevato uno nuovo. All'apertura della web app, viene presentata la schermata di login per l'autenticazione in caso del primo accesso al portale. La mancata autenticazione, impone l'uscita dal portale. E' stato introdotto un meccanismo di auto configurazione in caso l'applicazione fosse destinata ad un contesto microsoft teams app, in questo caso il sistema login viene configurato con l'SSO di temas stesso.



## <p id="applicazionevecchia">Applicazione della libreria su un progetto gia in essere</p>

In caso si volesse usufruire delle funzionalità core della pl-schematics in un nuovo progetto, occorre sapere che la libreria sovrascriverà i seguenti file:
 


| File | Descrizione |
|--|--|
| app.component.html | il file viene sovrascritto per introdurre nuovi componenti come le barre di caricamento per il cambio pagina o chiamate rest. |
| app.module.ts | il file originale viene sovrascritto, introducento altri collegamenti a moduli come routin, shared, e modulo core della pl-core-utils-library per richiamare tutte le funzionalità core |
| environment.ts | viene modificato, inserendo il pattern iniziale per la dichiarazione di puntamenti a servizi rest e configurazioni per AZURE login per sviluppo|
| environment.prod.ts |  viene modificato, inserendo il pattern iniziale per la dichiarazione di puntamenti a servizi rest e configurazioni per AZURE login per produzione |
| sonar-project.properties | file di configurazione per l'inizializzazione del sistema SONAR |
| app-routing.module.ts | file creato o modificato in caso di gia esistente, per l'introduzione di caricamento lazy load |
 
 <br> 
 
Al termine dell'installazione, possibile visualizzare la lista dei file che verranno creati per noi, e quelli che il pattern ha modificato..

![alt text](https://firebasestorage.googleapis.com/v0/b/workspace-pl.appspot.com/o/img%2Fschematics%2Fcompletamento-pattern.PNG?alt=media&token=fd455bc1-7956-4ebd-b257-25d899830fc3)


> Occorre quindi prenderne atto clonando questi file per poi prelevare la parti essenziali e rimetterle nei nuovi file.
  

# <p id="nuovaalberatura">Nuova alberatura del progetto</p>

L'applicazione della libreria, impone un riadattamento del pacchetto in termini di package e di nuoi file che introducono nuove classi wrapper per l'utilizzo immediato della parte core applicativa e di altre funzionalità.

## Alberatura gerale del pacchetto

Aprendo il pacchetto, è possibile notare in prima vista che è presente un nuovo package.. con il nome impostato al momento della richiesta del suo inserimento.
> com\mycompany\normalize

![](https://firebasestorage.googleapis.com/v0/b/workspace-pl.appspot.com/o/img%2Fschematics%2Falberatura-generale.PNG?alt=media&token=1606f186-6c70-476f-a98a-1ff9ac937044)

Al suo interno vi sono altri tre package

>	component

>	core

>	shared

<br>

Questi package hanno funzionalità specifiche. 
<br><br>

| Package |Descrizione
| -- | -- |
|component| in questo path, sono presenti tutti i macro componenti come le pagine di un portale e le varie sezione, quindi eventuali oggetti complessi come filtri per tabelle o tab per la visualizzazione di determinate parti della pagina|
|core | questa cartella contiene tutte le classi per l'inizializzazione della parte core applicativa, quindi vengono creati intercettori di rete, di rotta, configurazione di barre progressive , inizializzazione della login, AZURE o altro. E tanto ancora|
|shared |cartella contenente tutti gli oggetti che devono essere condivisi con il resto del sistema, come componenti grafici, moduli di utilità routing, pipe, directive , bean e tanto altro 		|


<br><br>

# pl-schematics

> **Schematics Angular per architetture enterprise-ready**

---

## Sommario

- [Cos'è pl-schematics](#cosè-pl-schematics)
- [Struttura e funzionalità](#struttura-e-funzionalità)
- [Esempi di utilizzo](#esempi-di-utilizzo)
- [Perché standardizzare con schematics](#perché-standardizzare-con-schematics)
- [Comando schematic](#comando-schematic)
- [Autore](#autore)

---

## Cos'è pl-schematics

**pl-schematics** è una raccolta di schematics Angular che automatizza la generazione di una struttura applicativa solida, modulare e scalabile. Ogni schematic produce codice conforme alle best practice enterprise, riducendo tempi di setup e garantendo coerenza tra progetti.

---

## Struttura e funzionalità

### Core Services (`files/core/service/`)

- **AuthService**  
    Gestione centralizzata autenticazione (login/logout, MSAL/Azure AD, adapter per NgRx/altro state management).
  
    _Esempio:_
    ```typescript
    this.authService.login();
    this.authService.logout();
    ```

- **ErrorService**  
    Gestione errori centralizzata, broadcast, wrappa errori con info aggiuntive.
  
    _Esempio:_
    ```typescript
    throw new ErrorBean('Errore di rete', ErrorCode.NETWORKERROR, true, false);
    ```

- **HttpService**  
    Chiamate HTTP GET/POST/PUT/DELETE con cache, timeout, kill su cambio rotta, mock API, monitoraggio avanzamento.
  
    _Esempio:_
    ```typescript
    this.httpService.GETBG(request, type, onProgress, onError).subscribe(...);
    ```

- **RouteFakeGuard**  
    Simula la protezione delle rotte in sviluppo.

### Interceptor (`files/core/interceptor/`)

- **HttpInterceptorService**  
    Intercetta tutte le chiamate HTTP, aggiunge header, gestisce token, errori, cache.
- **HttpInterceptorFakeService**  
    Simula risposte HTTP per test e sviluppo offline.

### Shared Services (`files/shared/service/`)

- **GlobalService**  
    Utility globale, ascolto eventi core, gestione redirect, modali, login, ecc.
  
    _Esempio:_
    ```typescript
    this.globalService.onEvent('CORE_ERROR_SERVICE_DIALOG', handler);
    ```

### Pipe (`files/shared/pipe/`)

- **PipeModule**  
    Esporta tutte le pipe utili (formattazione date, numeri, enum, ecc.).

    _Principali pipe:_
    - `CommaDecimalPipe`, `CountYearsPipe`, `CurrencyFormatPipe`, `DecimalFixPipe`, `EnumToDescPipe`, `ExpiredDatePipe`, `FirstCharPipe`, `LocalizedDatePipe`, `NormalizePipe`, `RemoveLeadingZerosPipe`, `RoundPipe`, `SafePipe`, `SortPipe`, `TranslateAsyncPipe`, `TruncatePipe`, ecc.

    _Esempio:_
    ```html
    {{ valore | commaDecimal }}
    {{ data | localizedDate:'it-IT' }}
    ```

### Utils (`files/shared/utils/`)

- **Utils**  
    Metodi statici per manipolazione stringhe, array, oggetti, ecc.
- **Device Detector**  
    Funzioni per rilevare device, browser, sistema operativo.
  
    _Esempio:_
    ```typescript
    const info = detectDeviceInfo();
    ```


### State Management NgRx (`files/ngrx/`)

- **StoreModule, Effects, Adapter, Helpers**  
    Struttura pronta per la gestione dello stato con NgRx: store, effetti, selettori, azioni, adapter e helper per ridurre la boilerplate e standardizzare la gestione dello stato.
  
    _Esempio:_
    ```typescript
    import { Store } from '@ngrx/store';
    this.store.dispatch(MyActions.loadData());
    this.store.select(MySelectors.selectData).subscribe(...);
    ```
  
    _Vantaggi:_
    - Separazione chiara tra stato, effetti e UI
    - Facilità di testing e debugging
    - Struttura scalabile e riutilizzabile

### Advanced Logging (`files/advanced-logging/`)

- **LoggerService**  
    Logging avanzato con livelli, feature, provider custom.
  
    _Esempio:_
    ```typescript
    this.loggerService.log('Messaggio', LoggerLevel.INFO);
    ```

### Moduli e Inizializzatori

- **SharedModule**  
    Modulo comune che importa/espone CommonModule, HttpClientModule, FormsModule, PipeModule, TranslateModule, MaterialModule (opzionale), StateModule (opzionale).
  
    _Esempio:_
    ```typescript
    import { SharedModule } from 'src/app/tuo-package/shared/module/shared.module';
    @NgModule({ imports: [SharedModule] })
    ```

- **InitializerModule**  
    Configura provider core (API base, browser, cache, mock, MSAL, ecc.).
- **AmbientModeLoader, AutenticationLoader**  
    Inizializzano ambiente e autenticazione all’avvio.

---

## Esempi di utilizzo

### Import moduli e servizi

```typescript
import { SharedModule } from 'src/app/tuo-package/shared/module/shared.module';
import { CoreModule } from 'src/app/tuo-package/core/module/initializer.module';
```

### Dependency injection servizi

```typescript
constructor(private authService: AuthService, private globalService: GlobalService) {}
```

### Pipe nei template

```html
{{ valore | commaDecimal }}
```

### Utility per device detection

```typescript
const device = detectDeviceType(navigator.userAgent);
```

---

## Perché standardizzare con schematics

- **Standardizzazione:** Struttura solida, coerente e scalabile per ogni progetto.
- **Velocità:** Setup e onboarding rapidissimi.
- **Best Practice:** Codice generato secondo pattern enterprise e Angular style guide.
- **Manutenzione:** Aggiornamenti e estensioni centralizzati e semplici.

---

## Comando schematic

Per generare la struttura base:

```sh
schematics pl-schematics:pl-schematics --force
```

---

## Autore

- **Luca Piciollo**  
    [lucapiciolo@gmail.com](mailto:lucapiciolo@gmail.com)
        Permette di simulare la protezione delle rotte in ambienti di sviluppo.

    ### 2. Interceptor (`files/core/interceptor/`)

    - **HttpInterceptorService**  
        Intercetta tutte le chiamate HTTP, aggiunge header, gestisce token, errori, cache.
    - **HttpInterceptorFakeService**  
        Simula risposte HTTP per test e sviluppo offline.

    ### 3. Shared Services (`files/shared/service/`)

    - **GlobalService**  
        Espone metodi di utilità globale, ascolta eventi core, gestisce redirect, modali, login, ecc.
  
        **Esempio:**
        ```typescript
        this.globalService.onEvent('CORE_ERROR_SERVICE_DIALOG', handler);
        ```

    ### 4. Pipe (Shared) (`files/shared/pipe/`)

    - **PipeModule**  
        Esporta tutte le pipe utili (formattazione date, numeri, enum, ecc.).

    - **Esempi di pipe:**
        - `CommaDecimalPipe`, `CountYearsPipe`, `CurrencyFormatPipe`, `DecimalFixPipe`, `EnumToDescPipe`, `ExpiredDatePipe`, `FirstCharPipe`, `LocalizedDatePipe`, `NormalizePipe`, `RemoveLeadingZerosPipe`, `RoundPipe`, `SafePipe`, `SortPipe`, `TranslateAsyncPipe`, `TruncatePipe`, ecc.

        **Esempio d’uso:**
        ```html
        {{ valore | commaDecimal }}
        {{ data | localizedDate:'it-IT' }}
        ```

    ### 5. Utils (`files/shared/utils/`)

    - **Utils**  
        Metodi statici per manipolazione stringhe, array, oggetti, ecc.
    - **Device Detector**  
        Funzioni per rilevare device, browser, sistema operativo.
  
        **Esempio:**
        ```typescript
        const info = detectDeviceInfo();
        ```

    ### 6. Advanced Logging (`files/advanced-logging/`)

    - **LoggerService**  
        Logging avanzato con livelli, feature, provider custom.
  
        **Esempio:**
        ```typescript
        this.loggerService.log('Messaggio', LoggerLevel.INFO);
        ```

    ### 7. Moduli e Inizializzatori

    - **SharedModule**  
        Modulo comune che importa/espone CommonModule, HttpClientModule, FormsModule, PipeModule, TranslateModule, MaterialModule (opzionale), StateModule (opzionale).
  
        **Esempio di import:**
        ```typescript
        import { SharedModule } from 'src/app/tuo-package/shared/module/shared.module';
        @NgModule({ imports: [SharedModule] })
        ```

    - **InitializerModule**  
        Configura provider core (API base, browser, cache, mock, MSAL, ecc.).
    - **AmbientModeLoader, AutenticationLoader**  
        Inizializzano ambiente e autenticazione all’avvio.

    ---

    ## Esempi di utilizzo

    1. **Importa i moduli e servizi nei tuoi moduli Angular:**
         ```typescript
         import { SharedModule } from 'src/app/tuo-package/shared/module/shared.module';
         import { CoreModule } from 'src/app/tuo-package/core/module/initializer.module';
         ```

    2. **Usa i servizi tramite dependency injection:**
         ```typescript
         constructor(private authService: AuthService, private globalService: GlobalService) {}
         ```

    3. **Applica le pipe direttamente nei template:**
         ```html
         {{ valore | commaDecimal }}
         ```

    4. **Utilizza le utility per device detection o manipolazione dati:**
         ```typescript
         const device = detectDeviceType(navigator.userAgent);
         ```

    ---

    ## Perché usare schematics

    - **Standardizzazione:** Ogni progetto parte con una struttura solida, coerente e scalabile.
    - **Velocità:** Riduce drasticamente il tempo di setup e onboarding di nuovi sviluppatori.
    - **Best Practice:** Tutto il codice generato segue pattern enterprise e Angular style guide.
    - **Manutenzione:** Aggiornare o estendere la base è semplice e centralizzato.

    ---

    ## Comando schematic

    Per generare la struttura base:

    ```sh
    schematics pl-schematics:pl-schematics --force
    ```

    ---

    **Autore:** Luca Piciollo  
    **Email:** lucapiciolo@gmail.com

    **pl-schematics** è una libreria avanzata per Angular che automatizza la creazione della struttura core di un'applicazione, standardizza pattern architetturali, integra servizi fondamentali (autenticazione, error handling, http, cache, mock, Sonar, ecc.) e velocizza lo startup di progetti enterprise-ready.

    ---

    ## Caratteristiche principali

    - Generazione automatica di struttura modulare (core, shared, component)
    - Integrazione servizi di autenticazione (MSAL/Azure AD)
    - Intercettori HTTP avanzati, gestione cache e mock API
    - Error handling centralizzato e broadcast eventi
    - Decoratori utili per lifecycle, permessi, log, unsubscribe, ecc.
    - Supporto SonarQube, script di build, typedoc
    - Pattern e best practice per progetti Angular enterprise

    ---

    ## Installazione e utilizzo rapido

    1. **Crea un nuovo progetto Angular**
         ```sh
         ng new nome-progetto
         ```
    2. **Installa la libreria**
         ```sh
         npm i pl-schematics
         ```
    3. **Applica lo schematic**
         ```sh
         schematics pl-schematics:pl-schematics --force
         ```
         Durante l'installazione ti verranno richieste alcune opzioni (login, Sonar, browser, ecc.).

    ---

    ## Cosa viene generato/modificato

    - Struttura a pacchetti: `core/`, `shared/`, `component/`
    - File chiave: `app.module.ts`, `app.component.html`, `environment.ts`, `environment.prod.ts`, `app-routing.module.ts`, `sonar-project.properties`
    - Script utili in `package.json` (build, sonar, typedoc)
    - Configurazione SonarQube e typedoc

    ---

    ## Architettura e struttura generata

    ```
    src/app/
        ├── core/
        ├── shared/
        └── component/
    ```

    - **core/**: servizi di autenticazione, error handling, http, initializer, interceptor, moduli di configurazione
    - **shared/**: pipe, utility, bean, servizi condivisi, moduli riutilizzabili
    - **component/**: macro-componenti, pagine, sezioni principali

    ---

    ## Funzionalità e servizi principali

    ### Autenticazione (MSAL/Azure AD)
    - Login/logout, gestione token, broadcast eventi login
    - Esempio:
        ```typescript
        this.authService.login();
        this.authService.logout();
        ```

    ### Error Handling centralizzato
    - Classe `ErrorBean` e servizio `ErrorService` per gestione errori, redirect, dialog, broadcast eventi
    - Esempio:
        ```typescript
        throw new ErrorBean('Errore di rete', ErrorCode.NETWORKERROR, true, false);
        ```

    ### HTTP Service avanzato
    - Metodi GET/POST/PUT/DELETE con cache, timeout, kill su cambio rotta, mock API, monitoraggio avanzamento
    - Esempio:
        ```typescript
        this.httpService.GETBG(request, type, onProgress, onError).subscribe(...);
        ```

    ### Interceptor e cache
    - Intercettazione centralizzata di tutte le chiamate, gestione header, token, errori, cache configurabile tramite tag `@cachable@`
    - Esempio:
        ```typescript
        { provide: CACHE_TAG, useValue: "@cachable@" }
        ```

    ### Mock API
    - Simulazione risposte backend tramite file JSON in assets
    - Esempio:
        ```typescript
        let req = new PlHttpRequest('mock', {api: 'test'}, {api: 'val'}, null);
        this.httpService.GETFILE(req, ...)
        ```

    ### Decoratori utili
    - `@PLFormatDate`, `@PLTraceHooks`, `@PLUnsubscribe`, `@PLPermission`, `@PLDelay`
    - Esempio:
        ```typescript
        @PLFormatDate(FORMAT_DATE.FULLDATE)
        data: Date;
        @PLUnsubscribe()
        class MyComponent {}
        ```

    ### Utility su String, Array, JSON
    - Metodi estesi: `format`, `isNullOrEmpty`, `moveUp`, `changeValuesByKey`, ecc.
    - Esempio:
        ```typescript
        let url = environment.exampleApi.format('P1', 'P2');
        let arr = [1,2,3]; arr.moveUp(2);
        let obj = JSON.changeValuesByKey(user, 'cognome', 'NuovoCognome');
        ```

    ---

    ## Esempi pratici

    ### Chiamata HTTP con kill su cambio rotta
    ```typescript
    this.httpService.GETBG(request, type, onProgress, onError).subscribe(...);
    // Se cambi pagina, la chiamata viene interrotta automaticamente
    ```

    ### Mock di una chiamata REST
    ```typescript
    let req = new PlHttpRequest('mock', {api: 'test'}, {api: 'val'}, null);
    this.httpService.GETFILE(req, ...)
    ```

    ### Decoratore per auto-unsubscribe
    ```typescript
    @PLUnsubscribe()
    class MyComponent {}
    ```

    ---

    ## Best practice e cosa NON fa la libreria

    - Non genera componenti grafici custom
    - Non implementa logiche di business specifiche
    - Non gestisce provider di autenticazione diversi da quelli previsti
    - Non configura pipeline CI/CD custom (fornisce solo template base)
    - Non gestisce database o storage

    ---

    ## Supporto, documentazione e autori

    - Documentazione inline nei file e in questo README
    - Per domande o supporto: lucapiciolo@gmail.com
    - Autore: Luca Piciollo

    ---

    **pl-schematics**: la base solida e moderna per ogni progetto Angular enterprise.
    mock: {
        url: "@cachable@/example/:api/:files",
        mocked: true,
        method:"GET"
    }

passando l'oggetto sopra al plHttpRequest, questo provvederà in autonomia a sostituire i valori dei parametri, con ad esempio "api e "files"

    let plHttpRequest: PlHttpRequest = new PlHttpRequest(
        environment.http.api.mock,
        Object({ api: "api", files: "files" }),
        Object({ api: p1, files: p2 }),
        null);

  

>si avverte che le chiavi dell'oggetto contenente i valori da impostare nei pathparams, deve essere lo stesso del pathparam stesso con l'esclusione dei ":", in caso non si verificasse questo match.. la sostituzione non avverà, con la conseguente mal formattazione della URL.

  

## <p id="cache">Esempio abilitazione cache delle chiamate di rete</p>

il sistema come gia detto mette a disposizione anche un servizio di cache, per evitare appesantimenti di rete, per via di chiamate repentine al BE che hanno stessa request ed ovviamente stessa response. per la configurazione della cache è opportuno inserire una semplice annotazione nella url del servizio.

  

    /**
        @author l.piciollo
        si riporta un esempio di una api riconosciuta come storable, grazie al tag @cachable@ presente nella URL.
        si nota come i parametri sono passati con {0} e {1}.. il sistema è equipagiato da una funzionalita che specializza
        le stringhe ad avere il format function.. quindi .. è possibile formattare la url richimandola in questo modo:
        E.S.
        let url = environment.exampleApi.format("P1","P2")
        quindi avviene una formattazione per posizione dei paraetri..
        exampleApi: `@cachable@/example/cacable/api?param1={0}&param2={1}`
    */
    exampleApi: `@cachable@/example/cache/api?param1={0}&param2={1}`,
    exampleApeNoCache: `example/no/cache/api?param1={0}&param2={1}`

  

>come si può notare, alla url è stato anteposto il **@cachable@** , questo sta ad indicare che la url dovrà essere sottoposta al motore di cache sia in chiamata verso la rete che in risposta verso il client.

  

>di default il tag da inserire è **@cacable** , si puo sostituire con qualsiasi valore, configurando opportunamente il servizio nel modulo di avvio dell'applicazione.

  

{ provide: MAX_CACHE_AGE, useValue: 300000 },

{ provide: CACHE_TAG, useValue: "@cachable@" }

  

> come per il tag, è possibile anche configurare il tempo valido per la cache.. scaduto il tempo la chiamata verrà eliminata dalla cache in modo da poter poi richiedere al BE nuovi aggiornamenti

## <p id="decoratori">Esempi decoratori</p>

  

    /**
        conversione automatica della data il campo prendera
        automaticamente il formato standard FULLDATE >> 'EEEE, MMMM d, y'
    */
    @PLFormatDate(FORMAT_DATE.FULLDATE)
    private campoData: Date = new Date()


    /**
        abilitazione del trace log dei cicli di hook delle classi,
        vengono loggati tutti i cicli di vita del componente
    */
    @PLTraceHooks( )
    export class AppComponent

    /**
        eliinatzione dei sottoscrittori in modo automatico al momento del'ondestroy
        del componente,in questo modo di hanno gli unsubscriber automatici di tutti i
        sottoscrittori creati per quel componente . E' possibile elencare gli osservatori da non
        prendere in considerazione
    */
    @PLUnsubscribe(ignore = [])
    export class AppComponent

    /**
        decoratore configurabile, se attivato, inibisce la creazione di componenti DOM in base a
        dei parametri lanciare
        document.dispatchEvent(new CustomEvent('PL:SET-PERMISSION', { detail
        [PROFILO1,PROFILO2,PROFILO3,...] }));
        inserire nel DOM <input permission="READONLY" type="text>"
        e al decoratore passare @PLPermission(true)
        l'elemento del dom viene elininato in quanto non contiene il permesso READONLY.
    */

    @PLPermission(environment.production)
    export class AppComponent

    /**
        esempio di funzionalita ritardata, la sua esecuzione avviene in modalita
        observer e dopo 3 secondi dalla sua chiamata.
    */

    //dichiarare una funzione come sotto
    @PLDelay(3000)
    public log(){..}


    /**
        per utilizzare la funzione di log, occorre sottoscriversi alla sua esecuzione in
        una funzioa
    */
    log.subscribe(response=>{ ... })

  
  

## <p id="funzioniaggiuntive">Esempi di funzionalità aggiuntive</p>

il codice viene corredato di funzionalità aggiuntive per String , Array, JSON si riporta un esempio di chiamata

    let user = {
        nome:"Luca" ,
        cognome: "Pic"
    }

    user=JSON.changeValuesByKey(user,"cognome","Piciollo");
    console.log(user);

> Verrà stampato l'oggetto - {nome : "Luca" , cognome: "Piciollo" }

>Le altre funzionalità vanno utilizzate allo stesso modo

  
  
  

    String {
        format: (...params) => string;
        isNullOrEmpty: (val: string) => boolean;
        truncateUrlIfNoParams: (val: any) => string;
        truncateUrlCache: (val: any) => string;
    }

  

    Array<T> {
        moveDown: (from) => void;
        moveTo: (from, to) => void;
        moveUp: (from) => void;
        delete: (position) => void;
        differences: (items) => Array<any>;
        inArray: (item) => Number;
        insert: (index: number, item: any) => void;
    }

  

    JSON {
        changeValues: (json,previousValue, nextValue) => any;
        changeValuesByKey: (json,key, nextValue) => any;
        findByValue: (json, value) => any;
        json2flat: (json) => any;
        json2array: (json) => any;
        json2flatObj: (json) => any;
        findKey: (json, keyFind) => any;
    }

  
  
  
  
  
  

## <p id="mockhttp">Esempio mock servizio</p>

Viene mostrato come abilitare il mock di un servizio di BE, utile in caso si voglia simulare la risposta di un servizio ancora in fase di sviluppo

  

    /**
        esempio di chiamata http
    */

    callMock(p1: any, p2: any): Observable<any> {
        return new Observable<any>(obs => {
            let plHttpRequest: PlHttpRequest = new PlHttpRequest(
            environment.http.api.mock ,
            Object({ api: "api", files: "files" }),
            Object({ api: p1, files: p2 }),
            null);

        this.httpService.GETFILE(plHttpRequest, RESPONSE_TYPE.ARRAYBUFFER, null, null).subscribe(sb => {
            obs.next(sb);
            obs.complete()
        }, error => {
             obs.error(error);
         }, () => { })
      })
    }

dichiarare nel file di properties un oggetto cosi dichiarato,

> api esposta a scopo illustrativo

    /**
        @author l.piciollo
        è possibile dichiarare una chiamata ad un mock, si consiglia di rispettare il seguente formato dichiarativo
        E.S.
        mock: {
            url: "@cachable@/example/:api/:files",
            mocked: true,
            method:"GET"
        }
        il mock a true, impone al sistema di risalire alla folder                     
        assets/public/mock/example/no/cache/api/122 e prelevare il
        json relativo al metodo utilizzato.. quindi post||get||put||delete||patch .json
    */

    mock: {
        url: "@cachable@/example/:api/:files",
        mocked: true,
        method:"GET"
    }

  

creare una struttura di cartelle per ospitare i file stub. La struttura deve essere posta a partire dal path assets e deve avere cartelle e sottocartelle come il path della url, ovviamente escludendo i queryparams.

  

- per chiamate di tipo GET : **assets/public/mock/** example/:api/:file/**get.json**

- per chiamate di tipo POST: **assets/public/mock/** example/:api/:file/****post.json**

  

> i path url possono contenere variabili indicate con :nome, il sistema intercetterà automaticamente i path params e sostituira autonomamente questi valori con i valori dei path params passati nella request.

> Es.

  

    let plHttpRequest: PlHttpRequest = new PlHttpRequest( environment.http.api.mock , Object({ api: "api", files: "files" }), Object({ api: p1, files: p2 }), null);

le chiamate http necessitano in ingresso dell'oggetto plHttpRequest, il quale contiene la url da richiamare, i query params , del body params e del pathParams. Nell'esempio sopra, si vede che l'oggetto contiene Object({ api: "api", files: "files" }), le chiavi dell'oggetto devono corrispondere con il nome del path param e il valore, sarà quello che effettivamente sostituirà il nome.

  

e cosi per gli altri metodi

  

> è possibile anche mockare servizi con url contenenti path params, ad esempio /example/:id , in questo caso creare comunque l'alberatura sopra citata, escludendo i : nel nome della folder.

  

>è possibile cambiare il path di riferimento dei file di mock, ma che comunque siano sempre sotto assets, occorre aggiungere nel modulo di avvio la seguente istruzione

  

    /**
        inizializzazione del path per reperire gli stub json di risposta al mock
    */

    { provide: DEFAULT_PATH_MOCK, useValue: "nuovo/path" }

  
  
  
  
  
  
  
  
  
  

## <p id="funzioniutili">Alcune funzionalità utili</p>

E' possibile avvalersi di alcune funzionalità utili come la gestione delle immagini. Si riportano le funzionalità messe a disposizione per la gestione della grafica

  

    /**
        si occupa di convertire un immagine esposta tramite blob url, in formato base 64
        @param imageUrl
    */

    public image2base64(imageUrl: string): Promise<any>

    /**
        Funzione che esporta l'intero elemento svg in un file per la visualizzazione in un browser,
        verrà mantenuto fedelmente il costrutto
        dell'elemento SVG
        @param elementSVG : elemento svg da elaborare
        @param nameFIle : nome del file da salvare
    */

    public svg2File(elementSVG: HTMLElement, nameFIle: string): Observable<boolean>

    /**
        Funzine per la creazione del jpeg partendo da un dom.
        l'osservatore ritorna il link all'immagine per il download
        @param elementSVG elemento SVG dom da cattuare
    */

    public dom2jpeg(elementSVG: HTMLElement): Observable<string>

    /**
        Funzione per la creazione del canvas, contenente l'immagine del DOM referenziato. non verranno presi in considerazione
        tag SVG grafici. ma solo html semplice comprese le immagini
        la funzione restituisce in callback il canvas creato, in modo da poterlo aggiungere al dom o altro.
        mentre in observer torna la url da passare alla funaione di download
        @param elementoDom : elemento dom da cattuare
        @param call : callback di ritorno dove iniettare il canvas creato.
    */

    public domToCanvas(elementoDom: HTMLElement, call: (canvas: HTMLElement) => void): Observable<string>

  

    /**
        Funzione che si occupa di scaricare un'immagine da un contenitore canvas, il canvas deve contenere un immagine non un html.
        questa funzionalità puo essere usata in risposta a domToCanvas
        viene ritornata la URL del blob da poeter scaricare
        @param canvas :oggetto canvas da scaricare
    */

    public canvasToImg(canvas: HTMLElement): Observable<string>

  

    /**
        Funzionalita per la creazione di un immagine a partire da un svg. la funzione restituisce in callback un canvas eventualmente
        da mostrare a schermo e la url del file in formato blob nell'osservable
        @param svgElement : svg element del dom
        @param callBack : funzione di ritorno per la consegna del canvas
    */

    public svgToImage(svgElement: HTMLElement, call: (canvas) => void): Observable<any>

  
## <p id="alert">Esempio message alert()</p>

Introdotto un sistema di alert() custom, al momento della chiamata alla funzione alert() di window.. verrà scatenata una routine, che mostrerà una finestra di dialogo modale in formato bootstrap.  La funzionalità è nata per velocizzare la chiamata ad un message .

.showMessage(){
    alert(title,message);
}

![alt text](https://firebasestorage.googleapis.com/v0/b/pl-schematics.appspot.com/o/img%2FAlert.PNG?alt=media&token=98a8d646-41ae-4e59-9442-fae7a293d7fc)
    
come si puo vedere l'utilizzo della funzionalità è molto semplice e immediata.

E' possibile ritornare alla funzionalità predefinita di window, semplicemente disabilitandola.
 
	 constructor(private alertService: AlertService) {
		 this.alertService.enableAlertMessage(false);
	 }
	 

## <p id="basecomponent">PlBaseComponent</p>

Componente nato per essere esteso, mette a disposizione funzionalità utili per la navigazione tramite routing. Qui è possibile passare parametri anche complessi via URL, dato che questi vengono codificate. Si occupa i importare tutti i servizi disponibili della libreria, come:

 > 1. Router
 > 1. ActivatedRoute
 > 1. PlGraphicService
 > 1. PlHttpService
 > 1. PlNetworkService
 > 1. PlUtilsService
 > 1. PLWorkerService

    /** chiamata a menu con passaggio di parametri */
    export class HomeComponent extends PlBaseComponent{
        go() {
            this.goToPage("home/menu", null, { P1: "param1", p2: { param2: "param2" }, p3: { param3: "param3" } });
        }
    }

    /** lettura dei parametri arrivati */
    export class MenuComponent extends PlBaseComponent{
        ngOnInit() {
              this.queryParams.subscribe(user => {
                this.user = user;
                this.userName = String(Object.keys(user)[0]);
                this.pathDetailUser = user[(Object.keys(user)[0])];
              })
              this.data.subscribe(user => {
                .....
              })
              this.params.subscribe(user => {
                .....
              })
        }       
    }

> ES: http://localhost:4200/#/home?OBJ=eyJob21lMSI6ImNpYW8iLCJob21lMiI6ImNpYW8ifQ%3D%3D


##  <p id="rxjs"> Rxjs polling ed uuid</p>

Tutti gli oservatori ora godono della nuova funzionalità di polling. Questa è utile specialmente a livello di chiamata HTTP su servizi di BE. La funzionalità si occupa di effettuare a ciclo continuo, ma configurando le condizioni, la richiesta all'observer di replicare nuovamente il suo funzionamento. QUindi applicato ad una chiamata rest, la stessa viene ripetuta fino al raggiungimento della condizione stabilita.

>   polling<T>(everyTime: number, forTime?: number, interrupt?: Subject<boolean> = new Subject()): Subject<T>

Per richiamare tale funzionalità occorre passare l'intervallo di tempo tra una ripetizione e l'altra, il valore che indica per quanto tempo deve essere attivo il polling, in millisecondi, indicare 0 per un ciclo infinito e in fine l'interrupt, un evento che al verificarsi blocca il processo di polling.
E' obbligatorio inserire oltre al everyTime, uno dei due parametri successivamente richiesti.
    
    /**
    * chiamata ad un servizio rest ogni secondo per un tempo complessivo di 6 secondi
    * il polling si interrompe in caso di riscontro di un cambio rotta di navigazione del portale.
    * Attenzione, la chiamata REST deve essere di tipo background altrimenti la GET semplice viene interrotta
    * al cambio rotta, quindi usare la GETBG o le altre, purche siano ..BG
    */
    let caller = <HTTPREQUEST>.polling(1000,6000, PlCoreModule.Routing().getIinterrupt() )).subscribe(
      val => console.log(val ),
      error => { console.error(error )},
      () => alert(caller.uuid)
    )

>   Attenzione: se il polling viene scatenato da un osservatore di tipo of(1,2,3), questo avrà effetto solo sul primo elemento e cioè 1. il polling è nato per osservatori che producono valori da un solo processo, come le chiamate a servizi di BE.. quindi non applicare ad osservatori come Timer, Interval o operatori simili.

Come si vede dal codice ogni osservatore o subscriber ha la proprietà uuid, la stessa viene valorizzata in automatico al momento della sua creazione. è possibile risalire ad essa semplicemente assegnando ad una variabile l'osservatore e prelevare il suo uuid

    let caller= <observer>;
    console.log(caller.uuid)

## <p id="opzioniconfigurabili">Opzioni configurabili

è possibile procedere alla configurazione personale di alcuni servizi, come ad esempio il tag cache la durata della validità della stessa. Le configurazioni al momento disponibili sono

  

>{ provide: BROWSER_VALID, useValue: [BROWSER.ALL] },

  

>{ provide: DISABLE_LOG, useValue: false },

  

>{ provide: MAX_CACHE_AGE, useValue: 300000 },

  

>{ provide: CACHE_TAG, useValue: "@cachable@" },

  

>{ provide: DEFAULT_PATH_MOCK, useValue: "public/mock" }

  
 
## <p id="documentazione">Documentazione online</p>
[Qui](https://pl-schematics.web.app/index.html) è possibile fare riferimento alla documentazione on line delle libreria e delle sue funzionalità  
Sotto alcuni documenti sull'utilizzo di alcune funzionalità della libreria

[Utilizzo di SONAR](https://drive.google.com/open?id=1MEFd3C13QmRaaaE0FNQKPHZJSZLqhj23&authuser=0)
[Compilazione del progetto](https://classroom.google.com/c/MTI4ODkwNDYwMjQ3/m/MTI5MTAxMzE0NTA4/details)
[Coda servizio REST](https://classroom.google.com/c/MTI4ODkwNDYwMjQ3/m/MTI5MTI0NDI4MTc0/details) 
[Download file con progress bar](https://classroom.google.com/c/MTI4ODkwNDYwMjQ3/m/MTI5MTMxOTIwNzQz/details) 
[Gestione eccezioni](https://classroom.google.com/c/MTI4ODkwNDYwMjQ3/m/MTI5MTI0OTQ0NjU1/details)
[Funzionalità aggiuntiva changeValues ](https://classroom.google.com/c/MTI4ODkwNDYwMjQ3/m/MTI5MDM0MzAwNzQz/details)
[Funzionalità aggiuntiva changeValuesByKey ](https://classroom.google.com/c/MTI4ODkwNDYwMjQ3/m/MTI5MDM0MzAwNzA5/details)
[Funzionalità aggiuntiva findByValue ](https://drive.google.com/open?id=1dMAgMvbbtWJVqhPbWh9_Z9DplP5atztD&authuser=0)
[Funzionalità aggiuntiva finkKey ](https://drive.google.com/open?id=138oNNwc3uzWBQSKO-xhyj13dBOxlj_6F&authuser=0)
[Funzionalità aggiuntiva json2flatObj ](https://drive.google.com/open?id=1qN2WUTHVilcI94WR5m50EX3OdAOREPam&authuser=0)
[Funzionalità aggiuntiva json2array ](https://drive.google.com/open?id=1ppbAe7lKDRfrn5Jb6j7GfD3Qvpbbfxzr&authuser=0)




## <p id="author">Author</p>
Created by @l.piciollo 
E-Mail: lucapiciollo@gmail.com

# Dettaglio Funzioni e Servizi di pl-schematics

Questa sezione elenca e spiega tutte le principali funzionalità, servizi, moduli, pipe e utilità fornite dalla libreria pl-schematics, con esempi pratici di utilizzo e chiarimenti su cosa fanno e cosa non fanno.

## Schematics principali

### plSchematics (schematic principale)
- **Cosa fa:** Inizializza la struttura core di un progetto Angular, crea cartelle `core`, `shared`, `component`, aggiunge moduli, servizi, interceptor, pipe, configurazioni di ambiente, supporto login Azure/MSAL, Sonar, Bootstrap, mock API, ecc.
- **Cosa non fa:** Non genera componenti grafici personalizzati, non configura routing avanzato custom, non implementa logiche di business specifiche.
- **Esempio:**
  ```sh
  schematics pl-schematics:pl-schematics --force
  ```

## Servizi core

### AuthService
- **Cosa fa:** Gestisce autenticazione (es. Azure AD/MSAL), login/logout, gestione token, broadcast eventi di login.
- **Cosa non fa:** Non implementa provider custom diversi da quelli previsti (es. Google, Facebook, ecc. vanno aggiunti a mano).
- **Esempio:**
  ```typescript
  this.authService.login();
  this.authService.logout();
  ```

### ErrorService & ErrorBean
- **Cosa fa:** Centralizza la gestione degli errori, lancia eventi broadcast per redirect o dialog, wrappa errori con informazioni aggiuntive.
- **Cosa non fa:** Non gestisce errori di business custom senza estensione della classe.
- **Esempio:**
  ```typescript
  throw new ErrorBean('Errore di rete', ErrorCode.NETWORKERROR, true, false);
  ```

### HttpService
- **Cosa fa:** Fornisce metodi GET/POST/PUT/DELETE con gestione automatica di cache, timeout, kill su cambio rotta, mock API, monitoraggio avanzamento.
- **Cosa non fa:** Non gestisce websocket, non implementa retry custom avanzati.
- **Esempio:**
  ```typescript
  this.httpService.GETBG(request, type, onProgress, onError).subscribe(...);
  ```

### GlobalService
- **Cosa fa:** Espone metodi di utilità globale, ascolta eventi core, gestisce redirect, modali, login, ecc.
- **Cosa non fa:** Non implementa logiche di business custom.
- **Esempio:**
  ```typescript
  this.globalService.onEvent('CORE_ERROR_SERVICE_DIALOG', handler);
  ```

## Moduli e Pipe

### InitializerModule
- **Cosa fa:** Inizializza provider core (API base, browser, cache, mock, MSAL, ecc.).
- **Cosa non fa:** Non configura provider custom non previsti.
- **Esempio:**
  ```typescript
  imports: [InitializerModule]
  ```

### PipeModule
- **Cosa fa:** Esporta pipe utili (formattazione date, numeri, enum, ecc.).
- **Cosa non fa:** Non aggiunge pipe custom non incluse.
- **Esempio:**
  ```html
  {{ valore | commaDecimal }}
  ```

## Decoratori

- **@PLFormatDate:** Formatta automaticamente le date.
- **@PLTraceHooks:** Logga i cicli di vita dei componenti.
- **@PLUnsubscribe:** Unsubscribe automatico dagli observable.
- **@PLPermission:** Gestisce permessi su elementi DOM.
- **@PLDelay:** Esegue una funzione con ritardo.

**Esempio:**
```typescript
@PLFormatDate(FORMAT_DATE.FULLDATE)
data: Date;

@PLUnsubscribe()
class MyComponent {}
```

## Funzionalità aggiuntive su String, Array, JSON

- **String.format, isNullOrEmpty, truncateUrlIfNoParams, truncateUrlCache**
- **Array.moveDown, moveTo, moveUp, delete, differences, inArray, insert**
- **JSON.changeValues, changeValuesByKey, findByValue, json2flat, json2array, findKey**

**Esempio:**
```typescript
let url = environment.exampleApi.format('P1', 'P2');
let arr = [1,2,3]; arr.moveUp(2);
let obj = JSON.changeValuesByKey(user, 'cognome', 'NuovoCognome');
```

## Mock API

- **Cosa fa:** Permette di simulare risposte di backend tramite file JSON in assets.
- **Cosa non fa:** Non genera automaticamente i file di mock, non simula logiche complesse.
- **Esempio:**
```typescript
let req = new PlHttpRequest('mock', {api: 'test'}, {api: 'val'}, null);
this.httpService.GETFILE(req, ...)
```

## Cosa NON fa la libreria
- Non genera componenti grafici custom.
- Non implementa logiche di business specifiche.
- Non gestisce provider di autenticazione diversi da quelli previsti.
- Non configura pipeline CI/CD custom (fornisce solo template base).
- Non gestisce database o storage.

---

Per ulteriori dettagli, consultare la documentazione inline nei file o le sezioni precedenti di questo README.