

  

# Portable Library Schematics

  
pl-schematics nasce dall'esigenza di standardizzare il preocesso di creazione di applicazioni angular > 2, ha lo scopo di velocizzare la realizzazione della struttura core applicativa, mettendo a diaposizione un pattern di sviluppo ben preciso e collaudato.. inoltre predispone una serie di funzionalità gia pronte all'uso che non necessitano di configurazioni, come intercettori di rete, di rotte, servizi http con kill di processo in caso di cambio rotta, funzionalita di download e uploadfile e tanto altro.


L'obbiettivo di questa libreria è abbattere le tempistiche di realizzazione di un applicazione angular di molti giorni uomo, riducendo drasticamente il tempo di startup del sistema, dando la possibilità anche ai piu junior di dedicarsi allo siluppo in modo semplificato, utilizzando le risorse messe a disposizione, lasciando solo il compito di creare componenti grafici.

pl-schematics è l'autrice della manipolazione del pacchetto angular, sia di nuova fattura che su di un progetto esistente.. ma per un funzionamento completo si avvale di un'altra libreria, pl-core-utils che si occupa di mredisporre le vere funzionalita core.


  

# Presentazione Tecnica

  
pl-schematics, come gia detto, si propone sia in contesti dove lo sviluppo è gia avviato, che in quelli dove si parte da zero, ovviamente in questo caso si trova giovamento nel suo utilizzo

## Applicazione della libreria su un nuovo progetto
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




## Applicazione della libreria su un progetto gia in essere

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
  

# Nuova alberatura del progetto

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

## Si riporta graficamente l'alberatura interna delle cartelle create

<br>

 > Package component.. qui andranno tutti i componenti di navigazione.

<br>


![](https://firebasestorage.googleapis.com/v0/b/workspace-pl.appspot.com/o/img%2Fschematics%2Falberatura-component.PNG?alt=media&token=337a3e60-45df-4d09-99e3-34593557df10)

<br>

> Package core, in questa sezione vi è tutta la parte applicativa che si occupa della gestione del controllo delle rorre, http  inizializzazione dell'ambiente, login intercettazione di erori e tanto altro.

<br>

![](https://firebasestorage.googleapis.com/v0/b/workspace-pl.appspot.com/o/img%2Fschematics%2Falberatura-core.PNG?alt=media&token=a53a4178-7ca8-43ef-97b6-f8ed86a471c6)

<br>

> Package shared, utilizzato per contenere elementi grafici, da condividere con il resto del sistema, quindi si avranno button combobox, classi di utility, servicem bean di trastoporto per chiamate rest, pipe, direttive e atanto altro.

<br>


![](https://firebasestorage.googleapis.com/v0/b/workspace-pl.appspot.com/o/img%2Fschematics%2Falberatura-shared.PNG?alt=media&token=3d6508c6-89ea-44c6-8602-1b5257963350)




# Presentazione del package core


pl-schematics, come gia detto , si occupa oltre a standardizzare un pattern di sviluppo.. anche di mettere a disposizione dello sviluppatore risorse pronte all'uso, grazie al supporto della pl-core-utils-libray.


## Alberatura e classi

<br>

![](https://firebasestorage.googleapis.com/v0/b/workspace-pl.appspot.com/o/img%2Fschematics%2Fdettaglio-core.PNG?alt=media&token=95344798-dadc-4e81-857c-4031a4853b6a)

<br>

Come è possibile notare, sono presenti diversi package, ogniuno con il proprio compito.

## Package <strong>bean</strong>

 Qui devono essere inseriti tutti i bean utilizzati dal core, in questo caso vi è la classe ErrorBean che si occupa di wrpappare le eccezioni riscontrate durante il funzionamento o di lanciarne delle proprie.
 Tutte le eccezioni vengono catturate dal servizio ErrorService che si occupa poi di gestire l'errore rilasciando eventi di broadcast agli ascoltatori

	throw new ErrorBean(err.message, ErrorCode.NETWORKERROR, false, true) 
il costruttore prevede 4 parametri

| parametro|descrizione|
|--|--|
|messaggio|stringa che descrive l'errore riscontrato|
|tipo|Tipo dell'errore riscontrato, vengono gia confezionati diversi tipi di errore nell'enumeration ErrorCode, ma è possibile inserirne degli altri, in questo caso si consiglia di modificare la classe ErrorCode, inserendo gli errori custom|
|redirect|valore booleano, indica al servizio ErrorService, che si intende avere una redirect applicativa in caso il valore sia positivo, ad esempio ad una pagina di errore.. questo meccanismo va configurato con la creazione di un ascoltatore di evento broadcast il quale poi gestisc la redirect, si occupera quindi la ErrorService a lanciare la richiesta di redirect grazie alla configurazione di questo parametro|
|dialog|indica alla al servizio ErrorService, che si vuole una modale che  visualizzi al suo interno il messaggio di erre riscontrato, anche in questo caso il processo è lo stesso della redirect|

> Tutti gli eventi che vengono lanciati dalla ErrorBean, sono registati nella GlobaService, messa a disposizione sempre da pl-schematics.

Gli eventi rilanciati dalla ErrorService, quindi sono:

1. Per la modalità di apertura del dialogo

- PlCoreUtils.Broadcast().execEvent(<strong>CORE_TYPE_EVENT.CORE_ERROR_SERVICE_DIALOG</strong>, errorBean)

2. Per la richiesta di redirect:

-  PlCoreUtils.Broadcast().execEvent(<strong>CORE_TYPE_EVENT.CORE_ERROR_SERVICE_REDIRECT</strong>, errorBean);

3. per tutti gli altri errori:

- PlCoreUtils.Broadcast().execEvent(<strong>CORE_TYPE_EVENT.CORE_ERROR_SERVICE</strong> , errorBean);


<br><br>

## Package <strong>initializer</strong>

Le classi messe a disposizione dal sistema, in questo pacchetto, si occupano della configurazione iniziale di tutto il sistema, sono presenti due classi.

|classe|descrizione|
|--|--|
|AmbientModeLoader|Lesecuzione di questa classe, è determinata in fase di startup applicativa, si antepone al sistema di loadin del bootstrap angular e si occupa di identificare il sistema in cui sti sta eseguendo il programma. Quindi si identifica il browser in uso e si specializzano nuove funzionalità per il browser.  l'esecuzione di questo inizializzatore scatena una routin della pl-core-utils.library, e precisamente PlAmbientModeLoaderService. Questo servizio, si occupa quindi di sovrascrivere funzinalità come il download di un file, rendendolo compatibile con IE, inoltre aggiunge funzionalita a stringhe, json , array e observer. |
|AutenticationLoader|L'esecuzione di questa funzionalità è determinata in fase di startup applicativa, piu precisamente nella fase di caricamento dei moduli angular, ponendo all'utente la richiesta di autenticazione, in caso sia delegata all'utente tramite un amaschera di login, oppure di autenticazione automatica con qualche provider come AZURE. Quesa classe deve essere specializzata in base alle proprie esigenze, in caso di login diversa da AZURE.|

<br>

> Entrambe le funzionalità sopra elencate, inibiscono il caricamento del programma, in caso di esito negativo della login, o in di errore nell'idetificare il sistema in uso. Questo meccanismo evita il caricamento non autorizzato dell'applicativo e quindi la sua navigazione.

<br>

La classe di autenticazione, gestisce i seguenti eventi di broadcast

<br>


     /**registrazione ad eventi lanciati dalla libreria azure per il  
      this.broadcastService.subscribe("msal:acquireTokenFailure", (error) => {
        this.logout();
      })
      /**registrazione ad eventi lanciati dalla libreria azure per il controllo della login */
      this.broadcastService.subscribe("msal:loginFailure", (error) => {
        this.logout();
      })
      /**registrazione ad eventi lanciati dalla libreria azure per il controllo della login */
      this.broadcastService.subscribe("msal:stateMismatch", (error) => {
        this.logout();
      })
      /**registrazione ad eventi lanciati dalla libreria azure per il controllo della login */
      this.broadcastService.subscribe("msal:acquireTokenSucces", (OK) => {
        PlCoreUtils.Broadcast().execEvent(CORE_TYPE_EVENT.CORE_ACQUIRE_TOKEN_SUCCESS, OK);
      })
      /**registrazione ad eventi lanciati dalla libreria azure per il controllo della login */
      this.broadcastService.subscribe("msal:loginSucces", (OK) => {
        PlCoreUtils.Broadcast().execEvent(CORE_TYPE_EVENT.CORE_LOGIN_SUCCESS, OK);
      })


<br><br>

## Package <strong>interceptor</strong>
<br>
in questo package viene fornito un intercettore di rete, qui vengono appunto intercettate tutte le chiamate al BE che vengono effettuate durante il ciclo di vita dell'applicativo.
Tutte le chiamate get, post, delete, pathc, put vengono centralizzate ed analizzate da questo intercettore, qui è possibile quindi, aggiungere, modificare o sottrarre informazioni all'header delle chianate, oppure veicolare le chiamate ad altri puntamenti, gestire gli errore di risposta dei servizi e tanto altro.

In questo caso , l'interettore viene utilizzato per dare un'analisi sulle tempistiche di esecuzione di ogni API, e di corredare l'header di un eventuale token di autenticazione AZURE o di altro sistema, in questo caso occorre modificare l'intercettore.. specializzandolo con il sitema login scelto.

Inoltre l'intercettore gestisce la cache delle chiamate API, si occupa di prelevare dalla cache eventuali richieste gia effettuate, oppure di invocare il BE e di mettere poi in cache la rispota per prelevarla ad una successiva chiamata, ovviamente la cache ha una durata di tempo configurabile nel modulo di inizializzazione del core e le api possono essere configurate per abilitare la cache o meno.

In caso di eccezioni nella chiamata API, viene rilasciato il seguente evento:

 > PlCoreUtils.Broadcast().execEvent(CORE_TYPE_EVENT.CORE_HTTP_AJAX_ERROR, err);




<br><br>

## Package <strong>module</strong>
<br>

il caricamento della parte core, prevede una configurazione iniziale, dove è possibile specificare diversi parametri di avvio.
A tale scopo viene creata la classe Initializer.module, qui come gia detto è presente una pre-configurazione dell'ambiente, ma è possibile modificare i parametri a propria discrezione.

Questo modulo, viene caricato dal modulo proncipale app.module.ts, oppure dallo shared.module.ts

i parametri di configurazione sono:

|parametro|descrizione|
|--|--|
|BASE_URL_API| Questo provider specifica la base url da utilizzare per le chiamate http. il suo valore iniziale è <b>environment.baseUrlRemoteApi</b> la quale proprietà è valorizata con localhost:XXXX, dove XXXX è la porta d'ascolto del BE. tutte le chiamate quindi,verranno effettuate secondo il dominio impostato in quella proprieta.|
|BROWSER_VALID|QUesta proprietà indica il browser abilitato alla presentazione del programma, viene valorizzato inizialmente con la scelta effettuata al momento dell'installazione della libreria, ma è possibile modificarlo in un secondo momenti, cambiando appunto questo valore. La proprietà accetta una lista di browser appure ALL, per indicare che tutti i browser sono abilitati a presentare il programma. |
|DISABLE_LOG|questa variabile è molto utile in un contesto di produzione, in quanto per le policy di sicurezza, un applicazione web non deve avere alcun tipo di log in console, qundi questa variabile puo contenere true o false. di default è valorizzata con <b>environment.production</b> che in base alla compilazione del pacchetto, se per prod o per svil, assumerà il valore true o false inibendo o meno poi i log in console.|
|MAX_CACHE_AGE|Questo valore, che di default è impostato a 300000ms, indica il tempo di validità della cache per le chiamate rest, passato questo tempo, per una determinata chiamata, alla successiva chiamata viene invocato nuovamente il BE, e non il sistema di cache.. alla risposta del be si ricomincia il ciclo di storicizzazione e cosi via|
|CACHE_TAG|Qui è possibile indicare al sistema di caching come identificare le API che abilitate alla cacahe. Di default il valore è <b>@cacable@</b> quindi , l'intercettore http, controlla la url da invocare, e ricerca questo valore al suo interno.. se lo stesso viene trovato, significa che la url deve essere sottoposta al sistema di cache, altrimenti viene invocato sempre il BE.|
|DEFAULT_TIMEOUT|QUesto valore, che inizialmente è valorizzato a 300000ms, indica il tempo di attesa prima di mandare in time out le chiamate API REST
|DEFAULT_PATH_MOCK|Questo provider, specifica il path dove andare a leggere i file per il sistema di mock.. pl-schematics mette a disposizione del sistema, un motore di mock che aiuta lo sviluppatore nel procedere con il proprio lavoro anche se il BE ancora non espone i propri servizi. indicando una url come mocked:true, al momento della chiamata rest, questa viene interettata dal motore e non viente effettuata una chiamata http, ma vien prelevato il file rispettivo al metodo invocato, al path specificato in questa variabile. Lo stesso path deve essere presente sotto la cartella assets e deve essere presente un file get.json in caso di chiamate get, post.json in caso di post e cosi via. E' possibile mockare anche chiamate a file download.|
|MSAL_CONFIG|In caso di login con il sistema AZURE, questa variabile punta alla configurazione per la connessione dell'applicazione,di default la configurazione viene preimpostata in <b>environment.azure</b>|

>In questo modulo ci sono altre inizializzazioni, come configurazione della centralizzazione degli errori, intercettori e altro.. ma non ha significato modificale in quanto sono strutture gia pronte all'uso che non necessitano di configurazine da parte dello sviluppatore.

<br><br>

## Package <strong>service</strong>
<br>

Qi sono presenti i servizi per il sistema core, come il servizio per l'autenticazione, per la centralizzazione delgi errori, e il servizio preconfigurato per le chiamate REST. questi sono preconfigurati e non necessitano di manutenzione da parte dello sviluppatore, ma vanno semplicemente utilizzati.. soprattutto il servizio htt.

<br>

### <b>Importante</b>
Per quanto riguarda il servizio HTTP.. questo mette a disposizione una serie di metodi per invocare il BE sia in modalità back ground che in modalità realtime.
pl-schematics, tra le tante cose, mira ad ottimizzare il flusso dati, evitando appesantimenti inutili di rete, quindi ogni chiamata rest è sottoposta a controllo di interruzione di flusso. Ciò significa che il variare di una rotta di navigazione, comporta l'interruzione della chiamata rest appena avviata. Questo non vale per metodi che finiscono per BG, come GETBG, POSTBG ecc.. , e metodi di download o upload file. Oltre a questo, è possibile monitorare lo stato di avanzamento di qualsiasi chiamata rest, in quanto il sistema al momento dell'invocazione crea una coda di chiamate con un proprio identificativo. Con dei metodi preposti è possibile mettersi in ascolto sullo stato di avanzamento percentile di una determinata chiamata rest. o interrompere il suo flusso manualmente, magari al verificarsi di qualche controllo.

<br><br>

## Package <strong>type</strong>
<br>

Inserire qui file che contengono dichiarazione di tipo, al momento è presente il file type.events il quale contiene alcuni tipi di evento che vengono lanciati in broadcast dal sistema core. come ad esmepio:

    CORE_HTTP_AJAX_ERROR = "CORE:HTTP-AJAX-ERROR",
    CORE_HTTP_AJAX_CACHE="CORE:HTTP_AJAX_CACHE",
    CORE_HTTP_AJAX_AUTENTICATE_KO = "CORE:HTTP-AJAX-AUTENTICATE-KO",
    CORE_ERROR_SERVICE_REDIRECT = "CORE:ERROR_SERVICE_REDIRECT",
    CORE_ERROR_SERVICE_DIALOG = "CORE:ERROR_SERVICE_DIALOG",
    CORE_ACQUIRE_TOKEN_SUCCESS = "CORE:ACQUIRE_TOKEN_SUCCESS",
    CORE_LOGIN_SUCCESS= "CORE:LOGIN_SUCCESS",
    CORE_ERROR_SERVICE="CORE:ERROR_SERVICE"


<br><br>

## Package <strong>utils</strong>
<br>

Questo package contiene la configurazione iniziale per le barre di caricamento o di attesa, di un eventuale cambio rotta o chiamate di rete. al verificarsi quindi di un cambio di rotta o l'invocazione di una qualsiasi API, verrà mostrato un componente che indica, in maniera animata, all'utente che vi è un operazine in corso e che deve attendere che essa sia terminata, infatti al termine della stessa, l'animazione di interrompe in modo automatico. In questi file è possibile variare alcune configurazioni, come il colore dell'animazione, il tipo la durata, la posizione.. e tanto altro.

# Presentazione del pacchetto shared
Come gia detto, questo package contiene diversi tipi di file, ma condividono il fatto che devono essere visti da tutto il sistema. Ci saranno componenti come bottoni, liste ecc.. che verranno poi importti in diverse pagine. Qui entra in gioco lo sviluppatore, il quale dovrà lui gestire la creazione delle grafiche e l'importazione degli eventuali moduli

Il sistema pl-schematics, crea un servizio di utilità, chiamato GlobalService. Questo servizio, ha la funzione di essere richiamato, eventualmente sia necessario, da qualsiasi parte dell'applicazione.. quindi da componenti, da pagine, da direttive e altro.. inoltre presenta dei metodi template per lla configurazione e l'invocazione di sistemi BE.


In questo servizio, sono presenti tutti gli ascoltatori ad eventi lanciati dal CORE, come il redirect page per gli errori che necessitano di redirect, oppure l'evento di apertura di una modale o login effettuata in modo corretto.. e altro ancora,  è possibile quindi specializzare il codice da eseguire al verificarsi di questi eventi.


# Modifica al package.json

Anche questo file viene modificato, vengono inseriti nuovi script per la compilazione del codice, sia in modalità produzione che in modalità sviluppo. inoltre viene inserito uno script per il lancio del comando SONAR per il controllo della qualità del codice e per la generazione della documentazione con il sistema typedoc.

    "sonar": "sonar-scanner",
    "build-dev": "ng build",
    "build-prod": "ng build  --lazyModules --aot  --prod --source-map=false",
    "typedoc": "compodoc -d  pl-schematics/document/schematics  -p tsconfig.json -s -n Portable-Schematics --theme Postmark --disablePrivate --disableCoverage"








<br><br >
## Documentazione online
[Qui](https://pl-schematics.web.app/index.html) è possibile fare riferimento alla documentazione on line delle libreria e delle sue funzionalità  
<br><br> 
## Author

  

Created by @l.piciollo