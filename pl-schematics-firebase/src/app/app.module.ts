import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SharedModule } from './home/configuration/shared/module/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { InitializerModule } from './home/configuration/core/module/initializer.module';

 

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SharedModule,
    AppRoutingModule,
    InitializerModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
