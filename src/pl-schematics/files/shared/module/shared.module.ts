/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-21 12:30:36
 * @modify date 2019-12-21 12:30:36
 * @desc [ modulo comune a tutto l'applicativo, si occupa di condividere altri moduli e funzionalita con il sistema. 
 * tutti i componenti o moduli che dovranno essere condivisi con il resto dell'applicazione devono essere posti in 
 * import ed in export
 * ]
 */
import { HttpClientModule ,HttpClient} from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { <%=classify(prefixClass)%>GlobalService } from '../service/global.service';
import { CommonModule } from '@angular/common';
import { TranslateLoader,   TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SortPipe } from '../pipe/SortPipe.pipe';
import { FeaturegModule } from '../features/feature.module';
/**import { MAT_DATE_LOCALE } from '@angular/material/core';*/



export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

/**
 *  @author @l.piciollo
 *  modulo comune a tutto l'applicativo, si occupa di condividere altri moduli e funzionalita con il sistema. 
 *  tutti i componenti o moduli che dovranno essere condivisi con il resto dell'applicazione devono essere posti in 
 *  impport ed in export
 */
@NgModule({
  declarations: [ SortPipe],
  imports: [
    FeaturegModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [/**{provide: MAT_DATE_LOCALE, useValue: 'it-IT' }*/ ],
  exports: [
    FeaturegModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    TranslateModule ,
  ]
})
export class SharedModule {

  constructor(private globalService: <%=classify(prefixClass)%>GlobalService,public translate: TranslateService) { 
      /**inizializzazione del servizio per la creazione dei listener */
      translate.setDefaultLang('it');
   }
  
  static forRoot() {
    return {
      ngModule: SharedModule,
      providers: [],
      import: []
    }
  }
}
