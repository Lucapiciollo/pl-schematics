'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">pl-schematics - progetto generato</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AppModule-036b49958b184e0d935c9dca5c299eb68558950f6f0de891d35cf8d77c9d3013e6556a72bd166fa0e8eeafda6aa2b24a5d18688725c160d2ebf6a7895f9c5200"' : 'data-bs-target="#xs-components-links-module-AppModule-036b49958b184e0d935c9dca5c299eb68558950f6f0de891d35cf8d77c9d3013e6556a72bd166fa0e8eeafda6aa2b24a5d18688725c160d2ebf6a7895f9c5200"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-036b49958b184e0d935c9dca5c299eb68558950f6f0de891d35cf8d77c9d3013e6556a72bd166fa0e8eeafda6aa2b24a5d18688725c160d2ebf6a7895f9c5200"' :
                                            'id="xs-components-links-module-AppModule-036b49958b184e0d935c9dca5c299eb68558950f6f0de891d35cf8d77c9d3013e6556a72bd166fa0e8eeafda6aa2b24a5d18688725c160d2ebf6a7895f9c5200"' }>
                                            <li class="link">
                                                <a href="components/App.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >App</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-036b49958b184e0d935c9dca5c299eb68558950f6f0de891d35cf8d77c9d3013e6556a72bd166fa0e8eeafda6aa2b24a5d18688725c160d2ebf6a7895f9c5200"' : 'data-bs-target="#xs-injectables-links-module-AppModule-036b49958b184e0d935c9dca5c299eb68558950f6f0de891d35cf8d77c9d3013e6556a72bd166fa0e8eeafda6aa2b24a5d18688725c160d2ebf6a7895f9c5200"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-036b49958b184e0d935c9dca5c299eb68558950f6f0de891d35cf8d77c9d3013e6556a72bd166fa0e8eeafda6aa2b24a5d18688725c160d2ebf6a7895f9c5200"' :
                                        'id="xs-injectables-links-module-AppModule-036b49958b184e0d935c9dca5c299eb68558950f6f0de891d35cf8d77c9d3013e6556a72bd166fa0e8eeafda6aa2b24a5d18688725c160d2ebf6a7895f9c5200"' }>
                                        <li class="link">
                                            <a href="injectables/ErrorService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ErrorService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link" >AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/HomeModule.html" data-type="entity-link" >HomeModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-HomeModule-c9e1449e1e98fb51ea0d1ec94aff42054f00752bda53b4038da62486e098ac25e2d1bbce2dd637fde9277ad0bdf545b3f531b3f8b5fd2e2bd0233aed7657af21"' : 'data-bs-target="#xs-components-links-module-HomeModule-c9e1449e1e98fb51ea0d1ec94aff42054f00752bda53b4038da62486e098ac25e2d1bbce2dd637fde9277ad0bdf545b3f531b3f8b5fd2e2bd0233aed7657af21"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-HomeModule-c9e1449e1e98fb51ea0d1ec94aff42054f00752bda53b4038da62486e098ac25e2d1bbce2dd637fde9277ad0bdf545b3f531b3f8b5fd2e2bd0233aed7657af21"' :
                                            'id="xs-components-links-module-HomeModule-c9e1449e1e98fb51ea0d1ec94aff42054f00752bda53b4038da62486e098ac25e2d1bbce2dd637fde9277ad0bdf545b3f531b3f8b5fd2e2bd0233aed7657af21"' }>
                                            <li class="link">
                                                <a href="components/HomeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HomeComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/HomeRoutingModule.html" data-type="entity-link" >HomeRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/InitializerModule.html" data-type="entity-link" >InitializerModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/MaterialModule.html" data-type="entity-link" >MaterialModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/MsalAuthModule.html" data-type="entity-link" >MsalAuthModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/PipeModule.html" data-type="entity-link" >PipeModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#pipes-links-module-PipeModule-c83fc10623072e877c4ec4bea6a9469e7eef9501b33b7a2c1393bc62565261a4f68faca65e8744df7a99ddd22cfedc124742eb65698ab8ee61261a2d6df18fbf"' : 'data-bs-target="#xs-pipes-links-module-PipeModule-c83fc10623072e877c4ec4bea6a9469e7eef9501b33b7a2c1393bc62565261a4f68faca65e8744df7a99ddd22cfedc124742eb65698ab8ee61261a2d6df18fbf"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-PipeModule-c83fc10623072e877c4ec4bea6a9469e7eef9501b33b7a2c1393bc62565261a4f68faca65e8744df7a99ddd22cfedc124742eb65698ab8ee61261a2d6df18fbf"' :
                                            'id="xs-pipes-links-module-PipeModule-c83fc10623072e877c4ec4bea6a9469e7eef9501b33b7a2c1393bc62565261a4f68faca65e8744df7a99ddd22cfedc124742eb65698ab8ee61261a2d6df18fbf"' }>
                                            <li class="link">
                                                <a href="pipes/CommaDecimalPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CommaDecimalPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/ConvertMbPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ConvertMbPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/CountDayPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CountDayPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/CountYearsPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CountYearsPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/CurrencyFormatPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CurrencyFormatPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/DecimalFixPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DecimalFixPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/EnumToDescPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EnumToDescPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/ExpiredDatePipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExpiredDatePipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/FirstCharPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FirstCharPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/LocalizedDatePipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LocalizedDatePipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/NormalizePipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NormalizePipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/RemoveLeadingZerosPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RemoveLeadingZerosPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/RoundPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RoundPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/SafePipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SafePipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/SortPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SortPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/TranslateAsyncPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TranslateAsyncPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/TruncateNameFilePipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TruncateNameFilePipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/TruncatePipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TruncatePipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/PlLoadingModule.html" data-type="entity-link" >PlLoadingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/SharedModule.html" data-type="entity-link" >SharedModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/StateModule.html" data-type="entity-link" >StateModule</a>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AuthStateAdapter.html" data-type="entity-link" >AuthStateAdapter</a>
                            </li>
                            <li class="link">
                                <a href="classes/ErrorBean.html" data-type="entity-link" >ErrorBean</a>
                            </li>
                            <li class="link">
                                <a href="classes/Utils.html" data-type="entity-link" >Utils</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AppEffects.html" data-type="entity-link" >AppEffects</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ConsoleLoggerService.html" data-type="entity-link" >ConsoleLoggerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ErrorService.html" data-type="entity-link" >ErrorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GlobalService.html" data-type="entity-link" >GlobalService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HomeService.html" data-type="entity-link" >HomeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HttpService.html" data-type="entity-link" >HttpService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LocalStorageAuthAdapterService.html" data-type="entity-link" >LocalStorageAuthAdapterService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LoggerService.html" data-type="entity-link" >LoggerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StorageEffects.html" data-type="entity-link" >StorageEffects</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StorageService.html" data-type="entity-link" >StorageService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interceptors-links"' :
                            'data-bs-target="#xs-interceptors-links"' }>
                            <span class="icon ion-ios-swap"></span>
                            <span>Interceptors</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="interceptors-links"' : 'id="xs-interceptors-links"' }>
                            <li class="link">
                                <a href="interceptors/HttpInterceptorFakeService.html" data-type="entity-link" >HttpInterceptorFakeService</a>
                            </li>
                            <li class="link">
                                <a href="interceptors/HttpInterceptorService.html" data-type="entity-link" >HttpInterceptorService</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/RouteFakeGuard.html" data-type="entity-link" >RouteFakeGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AppState.html" data-type="entity-link" >AppState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceInfo.html" data-type="entity-link" >DeviceInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EnumDescriptionItem.html" data-type="entity-link" >EnumDescriptionItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HttpAuthAdapter.html" data-type="entity-link" >HttpAuthAdapter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HttpInterceptorConfig.html" data-type="entity-link" >HttpInterceptorConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HttpRefreshTokenResponse.html" data-type="entity-link" >HttpRefreshTokenResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoggerConfig.html" data-type="entity-link" >LoggerConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoggerEntry.html" data-type="entity-link" >LoggerEntry</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoggerPort.html" data-type="entity-link" >LoggerPort</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MsalAuthConfig.html" data-type="entity-link" >MsalAuthConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RootState.html" data-type="entity-link" >RootState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SharedLibConfig.html" data-type="entity-link" >SharedLibConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StorageState.html" data-type="entity-link" >StorageState</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});