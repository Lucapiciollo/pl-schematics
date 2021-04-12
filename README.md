

1. <a href="#presentazione">Presentazione pl-schematics</a>
   1. <a href="#applicazionenuova">Applicazione della libreria su un nuovo progetto</a>
   1. <a href="#applicazionenuova">Applicazione della libreria su un progetto gia in essere</a>
   1. <a href="#nuovaalberatura">Nuova alberatura del progetto</a>
   1. <a href="#packagecore">Presentazione del package core</a>
        1. <a href="#alberaturaclassi"> Alberatura e classi</a>
        1. <a href="#packagebean"> Package bean</a>
        1. <a href="#packageinitializer"> Package initializer</a>
        1. <a href="#packageinterceptor"> Package interceptor</a>
        1. <a href="#packagemodule"> Package module</a>
        1. <a href="#packageservice"> Package service</a>
        1. <a href="#packagetype"> Package type</a>
        1. <a href="#packageutils"> Package utils</a>
    1. <a href="#packageshare"> Package shared</a>
    1. <a href="#packagejson"> package.json</a>
    1. <a href="#sonar"> SONAR</a>
1. <a href="#tutorial">TUTORIAL</a> 
    1. <a href="#chiamatehttp">Chiamate HTTP</a>   
    1. <a href="#cache">Cache HTTP</a> 
    1. <a href="#decoratori">Decorator</a>
    1. <a href="#funzioniaggiuntive">Funzionalità aggiuntive</a>
    1. <a href="#mockhttp">MockUp HTTP REST</a>
    1. <a href="#funzioniutili">Funzionalità utili</a>
    1. <a href="#alert">Alert message personale</a>
    1. <a href="#basecomponent">Support BaseComponent</a>
    1. <a href="#rxjs">Rxjs polling ed uuid</a> 
    1. <a href="#opzioniconfigurabili">Configurazione opzioni di avvio applicazione</a> 
1. <a href="#documentazione">Documentazione on line </a>   
1. <a href="#author">Author</a>   
 
---

#  <p id="presentazione">Portable Library Schematics</p>

  
pl-schematics nasce dall'esigenza di standardizzare il preocesso di creazione di applicazioni angular > 2, ha lo scopo di velocizzare la realizzazione della struttura core applicativa, mettendo a diaposizione un pattern di sviluppo ben preciso e collaudato.. inoltre predispone una serie di funzionalità gia pronte all'uso che non necessitano di configurazioni, come intercettori di rete, di rotte, servizi http con kill di processo in caso di cambio rotta, funzionalita di download e uploadfile e tanto altro.


L'obbiettivo di questa libreria è abbattere le tempistiche di realizzazione di un applicazione angular di molti giorni uomo, riducendo drasticamente il tempo di startup del sistema, dando la possibilità anche ai piu junior di dedicarsi allo siluppo in modo semplificato, utilizzando le risorse messe a disposizione, lasciando solo il compito di creare componenti grafici.

pl-schematics è l'autrice della manipolazione del pacchetto angular, sia di nuova fattura che su di un progetto esistente.. ma per un funzionamento completo si avvale di un'altra libreria, pl-core-utils che si occupa di mredisporre le vere funzionalita core.

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

> Con la richiesta di configurare il pacchetto per l'autenticazione AZURE, il progetto viene sottoposto a particolari configurazioni, vengono installate librerie MSAL di microsoft. Vengono intercettate tutte le chiamate di rete, e vengono corredate di un tokenId staccato al momento della login, tutte le rotte sono intercettate per verificare se il token è ancora valido, in caso verrà prelevato uno nuovo. All'apertura della web app, viene presentata la schermata di login per l'autenticazione in caso del primo accesso al portale. La mancata autenticazione, impone l'uscita dal portale.



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

## Si riporta graficamente l'alberatura interna delle cartelle create

 

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




# <p id="packagecore">Presentazione del package core</p>


pl-schematics, come gia detto , si occupa oltre a standardizzare un pattern di sviluppo.. anche di mettere a disposizione dello sviluppatore risorse pronte all'uso, grazie al supporto della pl-core-utils-libray.


##  <p id="alberaturaclassi"> Alberatura e classi</p>

 

![](https://firebasestorage.googleapis.com/v0/b/workspace-pl.appspot.com/o/img%2Fschematics%2Fdettaglio-core.PNG?alt=media&token=95344798-dadc-4e81-857c-4031a4853b6a)

<br>

Come è possibile notare, sono presenti diversi package, ogniuno con il proprio compito.

## <p id="packagebean"> Package <strong>bean</strong></p>

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
- > PlCoreUtils.Broadcast().execEvent(<strong>CORE_TYPE_EVENT.CORE_ERROR_SERVICE_DIALOG</strong>, errorBean)

2. Per la richiesta di redirect:

- >  PlCoreUtils.Broadcast().execEvent(<strong>CORE_TYPE_EVENT.CORE_ERROR_SERVICE_REDIRECT</strong>, errorBean);

3. per tutti gli altri errori:

- > PlCoreUtils.Broadcast().execEvent(<strong>CORE_TYPE_EVENT.CORE_ERROR_SERVICE</strong> , errorBean);


 

## <p id="packageinitializer">  Package <strong>initializer</strong></p>

Le classi messe a disposizione dal sistema, in questo pacchetto, si occupano della configurazione iniziale di tutto il sistema, sono presenti due classi.

|classe|descrizione|
|--|--|
|AmbientModeLoader|Lesecuzione di questa classe, è determinata in fase di startup applicativa, si antepone al sistema di loadin del bootstrap angular e si occupa di identificare il sistema in cui sti sta eseguendo il programma. Quindi si identifica il browser in uso e si specializzano nuove funzionalità per il browser.  l'esecuzione di questo inizializzatore scatena una routin della pl-core-utils.library, e precisamente PlAmbientModeLoaderService. Questo servizio, si occupa quindi di sovrascrivere funzinalità come il download di un file, rendendolo compatibile con IE, inoltre aggiunge funzionalita a stringhe, json , array e observer. |
|AutenticationLoader|L'esecuzione di questa funzionalità è determinata in fase di startup applicativa, piu precisamente nella fase di caricamento dei moduli angular, ponendo all'utente la richiesta di autenticazione, in caso sia delegata all'utente tramite un amaschera di login, oppure di autenticazione automatica con qualche provider come AZURE. Quesa classe deve essere specializzata in base alle proprie esigenze, in caso di login diversa da AZURE.|

<br>

> Entrambe le funzionalità sopra elencate, inibiscono il caricamento del programma, in caso di esito negativo della login, o in di errore nell'idetificare il sistema in uso. Questo meccanismo evita il caricamento non autorizzato dell'applicativo e quindi la sua navigazione.

<br>

La classe di autenticazione, gestisce i seguenti eventi di broadcast

 


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


 

## <p id="packageinterceptor"> Package <strong>interceptor</strong></p>
 
in questo package viene fornito un intercettore di rete, qui vengono appunto intercettate tutte le chiamate al BE che vengono effettuate durante il ciclo di vita dell'applicativo.
Tutte le chiamate get, post, delete, pathc, put vengono centralizzate ed analizzate da questo intercettore, qui è possibile quindi, aggiungere, modificare o sottrarre informazioni all'header delle chianate, oppure veicolare le chiamate ad altri puntamenti, gestire gli errore di risposta dei servizi e tanto altro.

In questo caso , l'interettore viene utilizzato per dare un'analisi sulle tempistiche di esecuzione di ogni API, e di corredare l'header di un eventuale token di autenticazione AZURE o di altro sistema, in questo caso occorre modificare l'intercettore.. specializzandolo con il sitema login scelto.

Inoltre l'intercettore gestisce la cache delle chiamate API, si occupa di prelevare dalla cache eventuali richieste gia effettuate, oppure di invocare il BE e di mettere poi in cache la rispota per prelevarla ad una successiva chiamata, ovviamente la cache ha una durata di tempo configurabile nel modulo di inizializzazione del core e le api possono essere configurate per abilitare la cache o meno.

In caso di eccezioni nella chiamata API, viene rilasciato il seguente evento:

 > PlCoreUtils.Broadcast().execEvent(CORE_TYPE_EVENT.CORE_HTTP_AJAX_ERROR, err);

 

## <p id="packagemodule"> Package <strong>module</strong></p>
 
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
|CACHE_TAG|Qui è possibile indicare al sistema di caching come identificare le API che abilitate alla cacahe. Di default il valore è <b>@cacheble@</b> quindi , l'intercettore http, controlla la url da invocare, e ricerca questo valore al suo interno.. se lo stesso viene trovato, significa che la url deve essere sottoposta al sistema di cache, altrimenti viene invocato sempre il BE.|
|DEFAULT_TIMEOUT|QUesto valore, che inizialmente è valorizzato a 300000ms, indica il tempo di attesa prima di mandare in time out le chiamate API REST
|DEFAULT_PATH_MOCK|Questo provider, specifica il path dove andare a leggere i file per il sistema di mock.. pl-schematics mette a disposizione del sistema, un motore di mock che aiuta lo sviluppatore nel procedere con il proprio lavoro anche se il BE ancora non espone i propri servizi. indicando una url come mocked:true, al momento della chiamata rest, questa viene interettata dal motore e non viente effettuata una chiamata http, ma vien prelevato il file rispettivo al metodo invocato, al path specificato in questa variabile. Lo stesso path deve essere presente sotto la cartella assets e deve essere presente un file get.json in caso di chiamate get, post.json in caso di post e cosi via. E' possibile mockare anche chiamate a file download.|
|MSAL_CONFIG|In caso di login con il sistema AZURE, questa variabile punta alla configurazione per la connessione dell'applicazione,di default la configurazione viene preimpostata in <b>environment.azure</b>|

>In questo modulo ci sono altre inizializzazioni, come configurazione della centralizzazione degli errori, intercettori e altro.. ma non ha significato modificale in quanto sono strutture gia pronte all'uso che non necessitano di configurazine da parte dello sviluppatore.

 

##  <p id="packageservice">  Package <strong>service</strong></p>
 Qi sono presenti i servizi per il sistema core, come il servizio per l'autenticazione, per la centralizzazione delgi errori, e il servizio preconfigurato per le chiamate REST. questi sono preconfigurati e non necessitano di manutenzione da parte dello sviluppatore, ma vanno semplicemente utilizzati.. soprattutto il servizio htt.

 

### <b>Importante</b>
Per quanto riguarda il servizio HTTP.. questo mette a disposizione una serie di metodi per invocare il BE sia in modalità back ground che in modalità realtime.
pl-schematics, tra le tante cose, mira ad ottimizzare il flusso dati, evitando appesantimenti inutili di rete, quindi ogni chiamata rest è sottoposta a controllo di interruzione di flusso. Ciò significa che il variare di una rotta di navigazione, comporta l'interruzione della chiamata rest appena avviata. Questo non vale per metodi che finiscono per BG, come GETBG, POSTBG ecc.. , e metodi di download o upload file. Oltre a questo, è possibile monitorare lo stato di avanzamento di qualsiasi chiamata rest, in quanto il sistema al momento dell'invocazione crea una coda di chiamate con un proprio identificativo. Con dei metodi preposti è possibile mettersi in ascolto sullo stato di avanzamento percentile di una determinata chiamata rest. o interrompere il suo flusso manualmente, magari al verificarsi di qualche controllo.

 

##  <p id="packagetype"> Package <strong>type</strong></p>
 Inserire qui file che contengono dichiarazione di tipo, al momento è presente il file type.events il quale contiene alcuni tipi di evento che vengono lanciati in broadcast dal sistema core. come ad esmepio:

    CORE_HTTP_AJAX_ERROR = "CORE:HTTP-AJAX-ERROR",
    CORE_HTTP_AJAX_CACHE="CORE:HTTP_AJAX_CACHE",
    CORE_HTTP_AJAX_AUTENTICATE_KO = "CORE:HTTP-AJAX-AUTENTICATE-KO",
    CORE_ERROR_SERVICE_REDIRECT = "CORE:ERROR_SERVICE_REDIRECT",
    CORE_ERROR_SERVICE_DIALOG = "CORE:ERROR_SERVICE_DIALOG",
    CORE_ACQUIRE_TOKEN_SUCCESS = "CORE:ACQUIRE_TOKEN_SUCCESS",
    CORE_LOGIN_SUCCESS= "CORE:LOGIN_SUCCESS",
    CORE_ERROR_SERVICE="CORE:ERROR_SERVICE"


 

## <p id="packageutils">  Package <strong>utils</strong></p>
 

Questo package contiene la configurazione iniziale per le barre di caricamento o di attesa, di un eventuale cambio rotta o chiamate di rete. al verificarsi quindi di un cambio di rotta o l'invocazione di una qualsiasi API, verrà mostrato un componente che indica, in maniera animata, all'utente che vi è un operazine in corso e che deve attendere che essa sia terminata, infatti al termine della stessa, l'animazione di interrompe in modo automatico. In questi file è possibile variare alcune configurazioni, come il colore dell'animazione, il tipo la durata, la posizione.. e tanto altro.

# <p id="packageshare"> Presentazione del pacchetto shared</p>
Come gia detto, questo package contiene diversi tipi di file, ma condividono il fatto che devono essere visti da tutto il sistema. Ci saranno componenti come bottoni, liste ecc.. che verranno poi importti in diverse pagine. Qui entra in gioco lo sviluppatore, il quale dovrà lui gestire la creazione delle grafiche e l'importazione degli eventuali moduli

Il sistema pl-schematics, crea un servizio di utilità, chiamato GlobalService. Questo servizio, ha la funzione di essere richiamato, eventualmente sia necessario, da qualsiasi parte dell'applicazione.. quindi da componenti, da pagine, da direttive e altro.. inoltre presenta dei metodi template per lla configurazione e l'invocazione di sistemi BE.


In questo servizio, sono presenti tutti gli ascoltatori ad eventi lanciati dal CORE, come il redirect page per gli errori che necessitano di redirect, oppure l'evento di apertura di una modale o login effettuata in modo corretto.. e altro ancora,  è possibile quindi specializzare il codice da eseguire al verificarsi di questi eventi.


# <p id="packagejson">Modifica al package.json</p>

Anche questo file viene modificato, vengono inseriti nuovi script per la compilazione del codice, sia in modalità produzione che in modalità sviluppo. inoltre viene inserito uno script per il lancio del comando SONAR per il controllo della qualità del codice e per la generazione della documentazione con il sistema typedoc.

    "sonar": "sonar-scanner",
    "build-dev": "ng build",
    "build-prod": "ng build  --lazyModules --aot  --prod --source-map=false",
    "typedoc": "compodoc -d  pl-schematics/document/schematics  -p tsconfig.json -s -n Portable-Schematics --theme Postmark --disablePrivate --disableCoverage"



# <p id="sonar"> Introduzione a SONAR</p>
Al momento dell'installazione del pattern, viene richiesto, oltre che abilitare il supporto per login azure, e bootstrap 4 anche se configurre il pacchetto per essere sottoposto a controlli SONAR. A tal proposito vengono installate tutte le librerie preposte, viene creato un file che dovrà essere configurato con le proprie informazioni, e in piu viene reso disponibile lo script di avvio nel package JSON.

> "sonar": "sonar-scanner"

quindi è possibile lanciarlo da riga di comando con :
- npm run sonar


per la configurazione viene creato il file <strong>sonar-project.properties</strong> che richiede di configurare le seguenti informazioni

    sonar.host.url=http://localhost:9000
    sonar.login=admin
    sonar.password=admin
    sonar.projectKey=test2
    sonar.projectName=projectName
    sonar.projectVersion=1.0
    sonar.sourceEncoding=UTF-8
    sonar.sources=src
    sonar.exclusions=**/node_modules/**,**/atena-component/**,**/src/assets/**,**/*.css
    sonar.tests=src
    sonar.test.inclusions=**/*.spec.ts
    sonar.typescript.lcov.reportPaths=coverage/lcov.info
    sonar.nodejs.executable=/program Files/nodejs/node.exe 
 
 quindi al lancio del comando il pacchetto viene sottoposto a scanner sonar e il risultato viene pubblicato nel server preposto.


# <p id="tutorial">Tutorial su alcune funzionalit</p>

## <p id="chiamatehttp">Chiamate HTTP</p>

  

Il sistema viene equipagiato con servizi utili per le chiamate al BE, tali chiamate hanno la possibilità di essere terminate in caso di determinati eventi

  

    callMock(p1: any, p2: any): Observable<any> {
        return new Observable<any>(obs => {
            let plHttpRequest: PlHttpRequest = new PlHttpRequest(
                environment.http.api.mock,
                Object({ api: "api", files: "files" }),
                Object({ api: p1, files: p2 }),
                null);
        this.httpService.GETFILE(plHttpRequest, RESPONSE_TYPE.ARRAYBUFFER, (idAjax => {
            setTimeout((id) => {
               PlCoreUtils.progressBars[id].interrupt.next(true);
            }, 10,idAjax);
        }), null).subscribe(sb => {
        obs.next(sb);
        obs.complete()
        }, error => {
            obs.error(error);
        }, () => { })
        })
    }

in questo esempio si termina il servizio dopo 10 millisecondi, ovviamente in caso di un download di file, questo termina lo scaricamento dello stesso. L'evento di termine puo essere anche avviato diversamente, tramite un pulsante ad esempio.

  

E' possibile dichiarare url contenenti dei pathParams, il sistema provvederò in autonomia alla sua valorizzazione.

  
  

    mock: {
        url: "@cacheble@/example/:api/:files",
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
        si riporta un esempio di una api riconosciuta come storable, grazie al tag @cacheble@ presente nella URL.
        si nota come i parametri sono passati con {0} e {1}.. il sistema è equipagiato da una funzionalita che specializza
        le stringhe ad avere il format function.. quindi .. è possibile formattare la url richimandola in questo modo:
        E.S.
        let url = environment.exampleApi.format("P1","P2")
        quindi avviene una formattazione per posizione dei paraetri..
        exampleApi: `@cacheble@/example/cacable/api?param1={0}&param2={1}`
    */
    exampleApi: `@cacheble@/example/cache/api?param1={0}&param2={1}`,
    exampleApeNoCache: `example/no/cache/api?param1={0}&param2={1}`

  

>come si può notare, alla url è stato anteposto il **@cacheble@** , questo sta ad indicare che la url dovrà essere sottoposta al motore di cache sia in chiamata verso la rete che in risposta verso il client.

  

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
            url: "@cacheble@/example/:api/:files",
            mocked: true,
            method:"GET"
        }
        il mock a true, impone al sistema di risalire alla folder                     
        assets/public/mock/example/no/cache/api/122 e prelevare il
        json relativo al metodo utilizzato.. quindi post||get||put||delete||patch .json
    */

    mock: {
        url: "@cacheble@/example/:api/:files",
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

	showMessage(){
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