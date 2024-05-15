import { BrowserModule } from '@angular/platform-browser';
import { NgModule,ErrorHandler } from '@angular/core';
import {ErrorService } from './<%=namePackage%>/core/service/error.service';
import { AppComponent } from './app.component';
import { SharedModule } from './<%=namePackage%>/shared/module/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { InitializerModule } from './<%=namePackage%>/core/module/initializer.module';

 

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    AppRoutingModule,
    InitializerModule 
  ],
  providers: [
    /**
     * @author l.piciollo
     * vengono intercettati tutti gli errori applicativi e rediretti al servizio predisposto alla loro lavorazione,
     * è possibile specializzare il servizio per ogni eventualità di errore.    
     */
    { provide: ErrorHandler, useClass: ErrorService }   
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
