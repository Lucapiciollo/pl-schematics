

  

# Portable Library Schematics

  
Portable Library Schematics *pl-schematics è una libreria nata allo scopo di velocizzare e standardizzare il processo di startup di un progetto angular, imponendo un pattern di sviluppo ottimizzato e facilmente comprensibile.

Questa libreria, vuole aiutare lo sviluppatore a seguire un pattern di sviluppo ben preciso e consolidato, evitando il piu possibile di inserire errori applicativi e soprattutto dare la possibilità di velocizzare lo startup del progetto, fornendo funzionalità gia implementate e collaudate.
  
Realizzare un applicativo Angular, comporta sviluppare sia componenti grafici, che servizi e flussi logici, quindi la parte core. E' proprio qui che interviene pl-schematics, con il supporto della pl-core-utils-library, la quale mette a disposizione moltissime funzioni come servizi di rete, intercettori di rotta, decoratori di funzione e tanto altro
> per informazioni sulla pl-core-utils-library, è possibile fare riferimento alla documentazione.

Questo metodo garantisce uno standard di sviluppo in tutti i progetti che ne fanno uso, quindi standardizzando il pattern su tutti i progetti, è piu immediato lo sviluppo.
  

## Uso

  
pl-schematics si rende utile sia in un contesto gia avviato, che in uno nuovo, di seguito viene mostrato il suo utilizzo

 - Creazione di un nuovo progetto

>ng new ProjectName

 -  installaione del pattern

>npm i pl-schematics@version

 - Adattamento del progetto al patter
>schematics pl-schematics:pl-schematics --force

durante l'installazione, viene chiesto all'utente di interagire, inserendo dati richiesti per la configurazione del pattern. l'utente dovra rispondere alle seguenti domande.

- What's name your company? mycompany
- Insert name of package core... com/mycompany/normalize
- Insert prefix class for core schematics.. for example SC 
- Select compatible browser  BROWSER.ALL
- Login support configuration... NONE
- DO you want add bootstrap 4 support ? Y
- DO you want add sonar support ? N


come è visibile è possibile selezionare diverse opzioni e abilitare alcune funzionalità, come la login con il sistema azure, abilitazione del portale a specifici browser, configurazione di sonar e altro.


In caso di un progetto gia avviato, è possibile comunque usufruire delle funzionalità ma occorre fare attenzione ad effettuare il backup di seguenti file   

>app.component.html

>environment.ts 

>environment.prod.ts

>sonar-project.properties

>app-routing.module.ts

  
Verra creata un'alberatura predisposta ad accogliere classi e oggetti, viene creata una sezione shared dove è possibile introdurre e condividere con tutto il resto del progetto nuove funzionalita custom non previste dal core, come componenti grafici utilità ed altro.

Questo per imporre allo sviluppatore di seguire precise linee guida durante lo sviluppo. La parte core non deve essere manutenuta, in quanto autonoma.. per interaggire con le utilità  esposte, è possibile restare in ascolto ad eventi lanciati e registrati di default nella global.service.ts, servizio globale all'aplicazione e viene creata ed inizializzata dal template.

In questo modo si evita di dover modificare servizi o classi core.

Il sistema è alle prime versioni ne seguiranno degli aggiornamenti futuri

## Documentazione

È possibile risalire alla documentazione di supporto presente all'interno del pacchetto. al momento dell'installazione, oltre ad adattare il progetto ospitante, verranno create alcune folder di documentazione.

## Funzionalità  ErrorCatch

pl-schematics mette a disposizione molte funzionalità CORE, alcune autonome alcune messe a disposione dello sviuppatore. 

E' possibile ascoltare qualsiasi evento di errore, e gestirlo di conseguenza. Tutti gli eventi di errore passano per un intercettore e lancia un evento di allerta. alla creazione di un errore, è possibile specificare se  occorre aprire una modale di allerta, o fare redirect in una pagina. creando quindi un errore in questo modo 

	throw  new  ErrorBean(err.message, ErrorCode.SYSTEMERRORCODE, true, true);
si sta dicendo all'intercettore, che l'errore è di tipo sistemistico e che si vuole lanciare l'evento di apertura di una modale e si vuole anche il redirect in qualche pagina.

l'intercettore quindi lancerà questi eventi, dove per default sono ascoltati nella global.service.ts . Sotto viene riportato il codice gia presente, dove viene effettuato un semplice log in caso di cattura di evento

    /**
     * @author l.piciollo
     * registrazione all'intercettore di errore per servire la richiesta di apertura modale di errore.
     */
    PlCoreUtils.Broadcast().listenEvent(CORE_TYPE_EVENT.CORE_ERROR_SERVICE_DIALOG, (error) => {
      console.log(error.detail);
    });
    /**
     * @author l.piciollo
     * registrazione all'intercettore di errore per servire la richiesta di redirect
     */
    PlCoreUtils.Broadcast().listenEvent(CORE_TYPE_EVENT.CORE_ERROR_SERVICE_REDIRECT, (error) => {
      console.log(error.detail);
    });


## Funzionalità broadcast

il framework angular, prevede una gestione ben precisa per il passaggio di informazioni tra il sistema o tra componenti.. è previsto un rilancio di evento da figlio a padre ma non ad un altro componente o funzionalità contenuta nel sistema.
Per questo motivo, è stato realizzato un sistema di broadcast, in quale espone metodi per mettersi in ascolto a degli eventi, e metodi per lanciare gli eventi con eventuali parametri.

per registrarsi ad un evento occore semplicemente effettuare.. 

	PlCoreUtils.Broadcast().listenEvent(CORE_TYPE_EVENT.CORE_ERROR_SERVICE_REDIRECT, (error) => {
	    console.log(error.detail);
	});
allo stesso modo è possibile lanciare un evento 

	PlCoreUtils.Broadcast().execEvent(CORE_TYPE_EVENT.CORE_ERROR_SERVICE_DIALOG, errorBean);


## Funzioni di rete
pl-schematics introduce un importante gestione delle chiamate di rete, mette a disposizione tutte le possibili chiamate, come la GET, POST, PUT, DELETE, PATCH oltre a queste mette a disposizione funzionalità utili per il download e upload dei file. 
Le prime elencate, sono state implementate con un sistema di interrupt.. ovvero sono sensibili al cambio di rotta applicativo o ad un comando di interruzione manuale.. questo significa che al momento di una chiamata GET, se questa ad esempio impiega 5 secondi a rispondere, ma nel frattempo siamo andati in un altra pagina.. la stessa chiamata viene interrota in modo da liberare le risorse di rete, migliorando il flusso di navigazione e le prestazioni dell'applicativo.

in caso si volesse comunque eseguire na chiamata, anche se eventualmente viene cambiata la rotta, occorre chiamare le funzioni GETBG,POSTBG,PUTBG,DELETEBG,PATCHBG. Queste funzioni vengono eseguite senza interruzione di rotta, ma solo in caso di comando manuale.

è possibile anche lanciare piu chiamate contemporaneamente, grazie al forkjoin esposto.

ogni chiamata puo essere monitorata, in quanto la stessa lancia un evento di progressione

Esempio di chiamata ad un servizio

	  callMock(p1: any, p2: any): Observable<any> {
	    return new Observable<any>(obs => {
	      let plHttpRequest: PlHttpRequest = new PlHttpRequest(
	                                                          environment.http.api.mock,
	                                                          Object({ api: "api", files: "files" }),
	                                                          Object({ api: p1, files: p2 }),
	                                                          null);
	      this.httpService.GETFILE(plHttpRequest, RESPONSE_TYPE.ARRAYBUFFER,null, null).subscribe(sb => {
	        obs.next(sb);
	        obs.complete()
	      }, error => {
	        obs.error(error);
	      }, () => { })
	    })
	  }

il servizio httpservice, contiene codice gia impachettato per effettuare chiamate alla rete, passando dai servizi esposti dalla pl-core-utils-library. sotto si riporta il metodo di invocazione messo a disposizione dalla schematics. come si puo vedere,  il codice è gia impostato per l'interruzione di chiamata, e il tracciamento della sua progressione, tramite la funzionalita, logTraceHttp, anch'essa gia messa a disposizione dal sistema.

	   /**
	   * @author l.piciollo
	   * Servizio GET 
	   * @param url          :Url BE
	   * @param params       :params
	   * @param responseType :tipo di risposta RESPONSE_TYPE
	   * @param callBack     :funzione da lanciare al momento dell'avvio della richiesta, riceve l'id ajax per la progressbar
	   * @param contentType  :tipo di contenuto ricevuto
	   */
	  GET(plHttpRequest: PlHttpRequest, responseType?: RESPONSE_TYPE, callBack?: (id: any) => void, contentType?: CONTENT_TYPE | string): Observable<HttpResponse<any>> {
	    return new Observable<HttpResponse<any>>(observer => {
	      plHttpRequest.url = this.injector.get(BASE_URL_API).concat(plHttpRequest.url);
	      this.plHttpService.GET(plHttpRequest, responseType || RESPONSE_TYPE.JSON, PlCoreModule.Routing().getIinterrupt(), contentType || null, callBack || this.logTraceHttp.bind(this)).subscribe(res => {
	        observer.next(res)
	        observer.complete(); 
	      }, err => {
	        observer.error(this.checkError(err));
	      }, () => { });
	    });
	  }
>la console in questa occasione, tramite la funzione logTraceHttp, mostrerà come output l'oggetto di avanzamento della chiamata.
 


## Release

>Questa versione di pl-schematics, necessia della pl-core-utils-library con version ~1.2.0

  

## Author

  

Created by @l.piciollo