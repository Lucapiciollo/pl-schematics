
# Portable Library Schematics

  

Portable Library Schematics *pl-schematics è una libreria nata allo scopo di velocizzare e standardizzare il processo di startup di un progetto angular > 2 imponendo un patter di sviluppo ottimizzato e facilmente comprensibile.

i progetti angular sono suddivisi, se vogliamo in 2 macro categorie.. parte core e parte grafica

entrambe da non sottovalutare in termini di complessità e di progettualità.. non è possibile o consigliabile iniziare con gli sviluppi grafici se non si è prima pianificata la parte core, che si occupa poi di far girare tutto il sistema, quindi gia questo aspetto rende costretti un team di sviluppatori ad attendere che almeno il 90% del lavoro del core sia pronto e potrebbero volerci divese settimane, tra studio , pianificazione e messa in opera e testing. Questo template, appunto riesce a garantire uno startup immediato del progetto e mettendo a disposizione classi o servizi gia consolidati nel tempo e quindi di preoccuparsi da subito alla creazione dei moduli grafici.

Il risparmio di tempo è subito evidente.

  

## Uso

 
Creazione di un nuovo progetto
>ng new ProjectName
>
 installaione del pattern
>npm i pl-schematics

  
adattamento del nuovo progetto al patter

>schematics pl-schematics:pl-schematics --force
 

I passi descritti sono specifici per adattare un nuovo progetto al template pattern. Per adattare un progetto gia esistente, occorre prestare attenzione a clonare i seguenti file
 
 >app.component.html
environment.ts e environment.prod.ts
sonar-project.properties
app-routing.module.ts

## Descrizione

  

pl-schematics nasce da un esperienza pluriennale dove si è posta molta attenzione alle performance applicative e strategie di riusabiltà.

  

Verra creata un'alberatura predisposta ad accogliere classi e oggetti, viene creata una sezione shared dove è possibile introdurre e condividere con tutto il resto del progetto nuove funzionalita custom non previste dal core, come componenti grafici utilità ed altro.

Questo garantisce di scandire per bene il compito di ogni sezione. La parte core non deve essere manutenuta, in quanto autonoma.. per interaggire con le utiità da lei esposte, è possibile restare in ascolto di eventi da lei lanciati e registrati di default nella global.service.ts, che è una classe di servizio globale all'aplicazione e viene creata ed inizializzata dal templmate.

  

In questo modo si evita di dover modificare la servizi o classi core.

  

L'installazione del template, prevede l'aggiunta di lib di supporto, viene installata ad esempio la pl-core-library che è una raccolta di funzionalità che automatizzano alcuni processi e aggiungono delle nuove funzionalità come ad esempio la gestione delle stringhe degli array dei json e funzionalità come intercettazione del browser e funzionalita di rete per la gestione file e tanto altro.

  

Per installare il template, occorre rispondere a delle domande guida, ed in base alle risposte si avra un tipo di configurazione piuttosto che un altra

  

È possibile sceglire ad esempio se abilitare scanner sonar, bootstrap 4 o il supporto per l'autenticazione ad azure, al momento.

  

La sua esecuzione in un progetto nuovo, implica la creazione di diverse classi e la modifica di alcune gia presenti per garantire una corretta configurazione.

  

Ad un progetto gia esistente, è possibile comunque eseguire l'installazione della lib, ma occorre sapere che app.module, app.component.html file di properties, configurazione di sonar vengono sostituiti co i nuovi file.

  

Il sistema è alle prime versioni ne seguiranno degli aggiornamenti futuri

  

## Documentazione

  

È possibile risalire alla documentazione di supporto presente all'interno del pacchetto. al momento dell'installazione, oltre ad adattare il progetto ospitante, verranno create alcune folder di documentazione.

  
## Release
>Questa versione di pl-schematics, necessia della pl-core-utils-library con version ~1.2.0

## Author

Created by @l.piciollo