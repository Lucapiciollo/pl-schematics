
  
  

1.  <a  href="#presentazione">Pl-schematics presentation</a>

1.  <a  href="#applicazionenuova">Apply the library to a new project</a>

1.  <a  href="#applicazionenuova">Application of the library on an existing project </a>

1.  <a  href="#nuovaalberatura">New project tree</a>

1.  <a  href="#packagecore">Presentation of the core package</a>

1.  <a  href="#alberaturaclassi"> Trees and classes</a>

1.  <a  href="#packagebean"> Package bean</a>

1.  <a  href="#packageinitializer"> Package initializer</a>

1.  <a  href="#packageinterceptor"> Package interceptor</a>

1.  <a  href="#packagemodule"> Package module</a>

1.  <a  href="#packageservice"> Package service</a>

1.  <a  href="#packagetype"> Package type</a>

1.  <a  href="#packageutils"> Package utils</a>

1.  <a  href="#packageshare"> Package shared</a>

1.  <a  href="#packagejson"> package.json</a>

1.  <a  href="#sonar"> SONAR</a>

1.  <a  href="#tutorial">TUTORIAL</a>

1.  <a  href="#documentazione">Online documentation </a>

1.  <a  href="#author">Author</a>

---

  

# <p id="presentazione">Portable Library Schematics</p>

pl-schematics arises from the need to standardize the process of creating angular applications> 2, has the purpose of speeding up the implementation of the application core structure, providing a very precise and tested development pattern .. it also prepares a series of functions already ready to use that do not require configurations, such as network interceptors, routes, http services with process kill in case of change of route, download and uploadfile functionality and much more.

The goal of this library is to cut down the time needed to create an angular application of many man days, drastically reducing the system startup time, giving even the most junior the possibility to devote themselves to the development in a simplified way, using the resources made available. arrangement, leaving only the task of creating graphic components.

pl-schematics is the author of the manipulation of the angular package, both of new invoice and of an existing project .. but for a complete functioning it makes use of another library, <b> pl-core-utils <b> which takes care of preparing the true core functionalities.

---
 
# Technical Presentation

  
pl-schematics, as already mentioned, is proposed both in contexts where development has already started, and in those where we start from scratch, obviously in this case it is beneficial in its use
  
## <p id="applicazione"> Apply the library to a new project</p>

1. Creation of an uproject with standard angular commands

> ng new Project-Name

  

2. Library installation

  

> npm i pl-schematics@version

  

3. Application of the pattern

  

-Adaptation of the project to the patter

> schematics pl-schematics:pl-schematics --force

  

<br>

During installation, developer interaction is required for system initialization. Various information will be requested, such as:

  

![alt text](https://firebasestorage.googleapis.com/v0/b/workspace-pl.appspot.com/o/img%2Fschematics%2Fapplicazione-pattern.PNG?alt=media&token=62b982f0-b06d-46a2-bd06-942d6b604a4a)

  

With the above configuration, we are asking the library to initialize for us the whole login process with the AZURE system, to make the web-app available to work with the chrome system and to initialize SONAR and Bootstrap 4. As you can see it is The name of a package has also been specified where the entire hierarchy of classes generated by it will be placed.

 With the request to configure the package for AZURE authentication, the project is subjected to particular configurations, Microsoft MSAL libraries are installed. All network calls are intercepted, and are accompanied by a detached tokenId at the time of login, all routes are intercepted to check if the token is still valid, in case a new one will be taken. 

When the web app is opened, the login screen is presented for authentication in the event of the first access to the portal. Failure to authenticate forces you to exit the portal. A self-configuration mechanism has been introduced in case the application is destined for a Microsoft Teams app context, in this case the login system is configured with the SSO of temas itself.

  
  
  

## <p id="applicazionevecchia">Application of the library on an existing project </p>

  

If you want to take advantage of the core features of pl-schematics in a new project, you should know that the library will overwrite the following files:

| File | Description |
| -| -|
| app.component.html | the file is overwritten to introduce new components such as page change load bars or rest calls. |
| app.module.ts | the original file is overwritten, introducing other links to modules such as routin, shared, and core module of the pl-core-utils-library to invoke all core functionality |
| environment.ts | is modified, inserting the initial pattern for declaring pointers to rest services and configurations for AZURE login for development |
| environment.prod.ts | is modified, inserting the initial pattern for declaring pointers to rest services and configurations for AZURE login for production |
| sonar-project.properties | configuration file for SONAR system initialization |
| app-routing.module.ts | file created or modified in case of already existing, for the introduction of lazy load |

<br>

At the end of the installation, you can see the list of files that will be created for us, and those that the pattern has modified ..

  

<p><i>P.S it may be necessary to manually delete the files listed above before launching pl-schematics, as execution may fail..</i></p>

  

![alt text](https://firebasestorage.googleapis.com/v0/b/workspace-pl.appspot.com/o/img%2Fschematics%2Fcompletamento-pattern.PNG?alt=media&token=fd455bc1-7956-4ebd-b257-25d899830fc3)

  
  

> It is therefore necessary to take note of this by cloning these files and then take the essential parts and put them back in the new files.

  

# <p id="nuovaalberatura">New project tree</p>

  

The application of the library forces a re-adaptation of the package in terms of package and new files that introduce new wrapper classes for immediate use of the core application part and other features.

  

## General package tree

  

Opening the package, it is possible to notice at first sight that there is a new package .. with the name set at the time of the request for its insertion.

> com\mycompany\normalize

  

![](https://firebasestorage.googleapis.com/v0/b/workspace-pl.appspot.com/o/img%2Fschematics%2Falberatura-generale.PNG?alt=media&token=1606f186-6c70-476f-a98a-1ff9ac937044)

  

Inside there are three other packages

  

> component

  

> core

  

> shared

  

<br>

These packages have specific functionality.

<br><br>

  

| Package |Descrizione
| -- | -- |
|component|in this path, there are all the macro components such as the pages of a portal and the various sections, therefore any complex objects such as filters for tables or tabs for viewing certain parts of the page|
|core | this folder contains all the classes for the initialization of the application core part, then network interceptors, route, configuration of progressive bars, login initialization, AZURE or other are created. And so much more|
|shared |folder containing all the objects that must be shared with the rest of the system, such as graphical components, routing utility modules, pipes, directives, beans and much more |

<br><br>

  

## The internal tree of the created folders is shown graphically

  

  

> Package component .. all navigation components will go here.

  

<br>

  
  

![](https://firebasestorage.googleapis.com/v0/b/workspace-pl.appspot.com/o/img%2Fschematics%2Falberatura-component.PNG?alt=media&token=337a3e60-45df-4d09-99e3-34593557df10)

  

<br>

  

> Package core, in this section there is all the application part that deals with running control management, http initialization of the environment, login, interception of errors and much more.

  

<br>

  

![](https://firebasestorage.googleapis.com/v0/b/workspace-pl.appspot.com/o/img%2Fschematics%2Falberatura-core.PNG?alt=media&token=a53a4178-7ca8-43ef-97b6-f8ed86a471c6)

  

<br>

  

> Package shared, used to contain graphic elements, to be shared with the rest of the system, so you will have combobox buttons, utility classes, servicem bean of transport for rest calls, pipes, directives and much more.

  

<br>

  
  

![](https://firebasestorage.googleapis.com/v0/b/workspace-pl.appspot.com/o/img%2Fschematics%2Falberatura-shared.PNG?alt=media&token=3d6508c6-89ea-44c6-8602-1b5257963350)

  
  
  
  

# <p id="packagecore">Presentazione del package core</p>

  
  

pl-schematics, as already mentioned, takes care not only of standardizing a development pattern .. also of making ready-to-use resources available to the developer, thanks to the support of pl-core-utils-libray.

  
  

## <p id="alberaturaclassi"> Alberatura e classi</p>

  

  

![](https://firebasestorage.googleapis.com/v0/b/workspace-pl.appspot.com/o/img%2Fschematics%2Fdettaglio-core.PNG?alt=media&token=95344798-dadc-4e81-857c-4031a4853b6a)

  

<br>

  

As you can see, there are different packages, each one with its own task.

  

## <p id="packagebean"> Package <strong>bean</strong></p>

  

Here all the beans used by the core must be inserted, in this case there is the ErrorBean class that deals with wrpapping the exceptions encountered during operation or throwing its own.

All exceptions are captured by the ErrorService service which then takes care of managing the error by releasing broadcast events to listeners

  

throw new ErrorBean(err.message, ErrorCode.NETWORKERROR, false, true)

the manufacturer provides 4 parameters

  

| parametro|descrizione|
|--|--|
|messaggio|string describing the error encountered|
|tipo|Type of error found, different types of errors are already packaged in the ErrorCode enumeration, but it is possible to insert others, in this case it is advisable to modify the ErrorCode class, inserting the custom errors|
|redirect|Boolean value, it indicates to the ErrorService service that you intend to have an application redirect in case the value is positive, for example to an error page .. this mechanism must be configured by creating a broadcast event listener which then manages the redirect , the ErrorService will then take care of launching the redirect request thanks to the configuration of this parameter|
|dialog|indicates to the ErrorService service that you want a modal that displays the error message found inside it, also in this case the process is the same as the redirect|


> All the events that are launched by the ErrorBean are recorded in the GlobaService, always made available by pl-schematics.

  

The events relaunched by the ErrorService, therefore, are:

  

1. For how to open the dialogue

-  > PlCoreUtils.Broadcast().execEvent(<strong>CORE_TYPE_EVENT.CORE_ERROR_SERVICE_DIALOG</strong>, errorBean)

  

2. Per la richiesta di redirect:

  

-  > PlCoreUtils.Broadcast().execEvent(<strong>CORE_TYPE_EVENT.CORE_ERROR_SERVICE_REDIRECT</strong>, errorBean);

  

3. per tutti gli altri errori:

  

-  > PlCoreUtils.Broadcast().execEvent(<strong>CORE_TYPE_EVENT.CORE_ERROR_SERVICE</strong> , errorBean);

  
  

  

## <p id="packageinitializer"> Package <strong>initializer</strong></p>

  

The classes made available by the system, in this package, deal with the initial configuration of the whole system, there are two classes.

  

|classe|descrizione|
|--|--|
|AmbientModeLoader|The execution of this class is determined in the application startup phase, it precedes the loadin system of the angular bootstrap and takes care of identifying the system in which the program is running. Then you identify the browser you are using and specialize new features for the browser. running this initializer triggers a pl-core-utils.library routin, namely PlAmbientModeLoaderService. This service, therefore, takes care of overwriting functions such as downloading a file, making it compatible with IE, it also adds functionality to strings, json, arrays and observer.|
|AutenticationLoader|The execution of this function is determined in the application startup phase, more precisely in the loading phase of the angular modules, by asking the user for authentication, in case it is delegated to the user via a login mask, or automatic authentication. with some providers like AZURE. This class must be specialized according to your needs, in case of login other than AZURE.|

  
<br>

  
> Both the functions listed above inhibit the loading of the program, in the event of a login failure, or in the event of an error in identifying the system in use. This mechanism avoids the unauthorized loading of the application and therefore its navigation.


<br>
  
The authentication class handles the following broadcast events

  

  
  
 
> /**registration to events launched by the azure library for the
this.broadcastService.subscribe("msal:acquireTokenFailure", (error) => {
 this.logout();
})
/**logging to events launched by the azure library for login control */
this.broadcastService.subscribe("msal:loginFailure", (error) => {
this.logout();
})
/**logging to events launched by the azure library for login control */
this.broadcastService.subscribe("msal:stateMismatch", (error) => {
this.logout();
})
/**logging to events launched by the azure library for login control */
this.broadcastService.subscribe("msal:acquireTokenSucces", (OK) => {
PlCoreUtils.Broadcast().execEvent(CORE_TYPE_EVENT.CORE_ACQUIRE_TOKEN_SUCCESS, OK);
})
/**logging to events launched by the azure library for login control */
this.broadcastService.subscribe("msal:loginSucces", (OK) => {
PlCoreUtils.Broadcast().execEvent(CORE_TYPE_EVENT.CORE_LOGIN_SUCCESS, OK);
})

  
  

  

## <p id="packageinterceptor"> Package <strong>interceptor</strong></p>

a network interceptor is provided in this package, where all the calls to the BE that are made during the life cycle of the application are intercepted.

All the get, post, delete, pathc, put calls are centralized and analyzed by this interceptor, here it is therefore possible to add, modify or subtract information from the header of the chianate, or to convey the calls to other targeting, to manage the response errors. services and much more.

In this case, the interceptor is used to give an analysis on the execution times of each API, and to provide the header with a possible AZURE authentication token or another system, in this case the interceptor must be modified. specializing it with the chosen login system.

Furthermore, the interceptor manages the cache of API calls, takes care of fetching any requests already made from the cache, or invoking the BE and then caching the response to fetch it at a subsequent call, obviously the cache has a duration of time configurable in the core init module and the api can be configured to enable cache or not.

  

If there are exceptions in the API call, the following event is released:

  

> PlCoreUtils.Broadcast().execEvent(CORE_TYPE_EVENT.CORE_HTTP_AJAX_ERROR, err);

  

  

## <p id="packagemodule"> Package <strong>module</strong></p>

loading the core part requires an initial configuration, where it is possible to specify various start parameters.

For this purpose the class Initializer.module is created, here as already mentioned there is a pre-configuration of the environment, but it is possible to modify the parameters at your discretion.

  

This module is loaded from the main module app.module.ts, or from the shared.module.ts

  

the configuration parameters are:

  

|parametro|descrizione|
|--|--|
|BASE_URL_API| This provider specifies the url base to use for http calls. its initial value is <b> environment.baseUrlRemoteApi </b> which property is set with localhost: XXXX, where XXXX is the listening port of the BE. therefore, all calls will be made according to the domain set in that property.|
|BROWSER_VALID|This property indicates the browser enabled for the presentation of the program, it is initially valued with the choice made at the time of installation of the library, but it is possible to modify it later, by changing this value. The property accepts a list of browsers appure ALL, to indicate that all browsers are enabled to present the program.|
|DISABLE_LOG|this variable is very useful in a production context, as for security policies, a web application must not have any kind of console log, so this variable can contain true or false. by default it is set with <b> environment.production </b> which, based on the compilation of the package, if for prod or for deve, will take on the value true or false and then inhibit the console logs.|
|MAX_CACHE_AGE|This value, which by default is set to 300000ms, indicates the validity time of the cache for the rest calls, after this time, for a given call, the BE is invoked again at the next call, and not the cache system. be's response, the historicization cycle is restarted and so on |
|CACHE_TAG|Here you can tell the caching system how to identify the API you enable to cache. By default the value is <b> @ cachable @ </b> so, the http interceptor, checks the url to be invoked, and searches for this value inside it .. if the same is found, it means that the url must be submitted to the cache system, otherwise the BE is always invoked.|
|DEFAULT_TIMEOUT|This value, which is initially set to 300000ms, indicates the waiting time before sending the REST API calls to time out
|DEFAULT_PATH_MOCK|This provider specifies the path where to read the files for the mock system .. pl-schematics provides the system with a mock engine that helps the developer to proceed with his work even if the BE does not yet expose the own services. indicating a url as mocked: true, at the time of the rest call, this is intercepted by the engine and an http call is not made, but the file corresponding to the invoked method is fetched, at the path specified in this variable. The same path must be present under the assets folder and a get.json file must be present in case of get calls, post.json in case of post and so on. It is also possible to mock download file calls.|MSAL_CONFIG|In case of login with the AZURE system, this variable points to the configuration for the connection of the application, by default the configuration is preset in <b> environment.azure </b> |

  

>In this module there are other initializations, such as configuration of the centralization of errors, interceptors and more .. but it has no modifiable meaning as they are ready-to-use structures that do not require configuration by the developer.

  

  

## <p id="packageservice"> Package <strong>service</strong></p>

Here are the services for the core system, such as the service for authentication, for the centralization of errors, and the preconfigured service for REST calls. these are preconfigured and do not require maintenance by the developer, but should simply be used .. especially the http service.

  

  

### <b>Importante</b>

As for the HTTP service .. this provides a series of methods to invoke the BE both in back ground mode and in realtime mode.

pl-schematics, among many things, aims to optimize the data flow, avoiding unnecessary network burdens, so every call rest is subjected to flow interruption control. This means that the variation of a navigation route involves the interruption of the call rest just started. This does not apply to methods ending in BG, such as GETBG, POSTBG etc .., and methods of downloading or uploading files. In addition to this, it is possible to monitor the progress of any call rest, as the system creates a call queue with its own identifier at the time of invocation. With specific methods it is possible to listen to the percentile progress of a given rest call. or stop its flow manually, perhaps when some control occurs.

  

  

## <p id="packagetype"> Package <strong>type</strong></p>

Insert here files that contain type declaration, at the moment there is the file type.events which contains some types of events that are broadcast by the core system. such as:

  

CORE_HTTP_AJAX_ERROR = "CORE:HTTP-AJAX-ERROR",

CORE_HTTP_AJAX_CACHE="CORE:HTTP_AJAX_CACHE",

CORE_HTTP_AJAX_AUTENTICATE_KO = "CORE:HTTP-AJAX-AUTENTICATE-KO",

CORE_ERROR_SERVICE_REDIRECT = "CORE:ERROR_SERVICE_REDIRECT",

CORE_ERROR_SERVICE_DIALOG = "CORE:ERROR_SERVICE_DIALOG",

CORE_ACQUIRE_TOKEN_SUCCESS = "CORE:ACQUIRE_TOKEN_SUCCESS",

CORE_LOGIN_SUCCESS= "CORE:LOGIN_SUCCESS",

CORE_ERROR_SERVICE="CORE:ERROR_SERVICE"

  
  

  

## <p id="packageutils"> Package <strong>utils</strong></p>

  
  

This package contains the initial configuration for the loading or waiting bars, for a possible change of route or network calls. therefore, upon the occurrence of a change of route or the invocation of any API, a component will be shown that indicates, in an animated manner, to the user that there is an operation in progress and that he must wait for it to be completed, in fact at the end the animation stops automatically. In these files it is possible to vary some configurations, such as the color of the animation, the type, the duration, the position .. and much more.

  

# <p id="packageshare"> Presentazione del pacchetto shared</p>

As already mentioned, this package contains several types of files, but they share the fact that they must be seen by the whole system. There will be components such as buttons, lists etc .. which will then be imported into different pages. Here the developer comes into play, who will have to manage the creation of the graphics and the import of any modules

  

The pl-schematics system creates a utility service, called GlobalService. This service has the function of being called, if necessary, from any part of the application .. therefore from components, from pages, from directives and more .. it also has template methods for the configuration and invocation of BE systems.

  

In this service, there are all the listeners to events launched by the CORE, such as the redirect page for errors that require redirects, or the opening event of a modal or login carried out correctly .. and more, it is possible then specialize the code to execute when these events occur.

  
  

# <p id="packagejson">Modifica al package.json</p>

  

This file is also modified, new scripts are inserted for compiling the code, both in production mode and in development mode. moreover a script is inserted for the launch of the SONAR command for the control of the quality of the code and for the generation of the documentation with the typedoc system.

  

"sonar": "sonar-scanner",

"build-dev": "ng build",

"build-prod": "ng build --lazyModules --aot --prod --source-map=false",

"typedoc": "compodoc -d pl-schematics/document/schematics -p tsconfig.json -s -n Portable-Schematics --theme Postmark --disablePrivate --disableCoverage"

  
  
  

# <p id="sonar"> Introduction to SONAR</p>

At the time of the installation of the pattern, in addition to enabling support for login azure, and bootstrap 4, you are also asked to configure the package to be subjected to SONAR checks. In this regard, all the relevant libraries are installed, a file is created that must be configured with its own information, and the startup script is also made available in the JSON package.

  

> "sonar": "sonar-scanner"

  

so you can run it from the command line with:

- npm run sonar

  
  

the <strong> sonar-project.properties </strong> file is created for the configuration, which requires you to configure the following information

  

>sonar.host.url=http://localhost:9000
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

Then when the command is launched, the package is subjected to a sonar scanner and the result is published on the appropriate server.

  
  

# <p id="tutorial">Tutorial on some features</p>

To fully understand the functions provided by pl-schematics refer to this library. <a  href="https://www.npmjs.com/package/pl-core-utils-library"> pl-core-utils-library </a>

The pl-schematics provides practical utility classes to be able to interface with the methods provided by the pl-core-utils-library

  
  
  

## <p id="author">Author</p>

Created by @l.piciollo

E-Mail: lucapiciollo@gmail.com