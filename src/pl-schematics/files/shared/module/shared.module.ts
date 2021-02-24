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
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { <%=classify(prefixClass)%>GlobalService } from 'src/app/<%=namePackage%>/shared/service/global.service';
import { CommonModule } from '@angular/common';
/**
 *  @author @l.piciollo
 *  modulo comune a tutto l'applicativo, si occupa di condividere altri moduli e funzionalita con il sistema. 
 *  tutti i componenti o moduli che dovranno essere condivisi con il resto dell'applicazione devono essere posti in 
 *  impport ed in export
 */
@NgModule({
  declarations: [ ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    TranslateModule
  ],
  providers: [<%=classify(prefixClass)%>GlobalService],
  exports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    TranslateModule
  ]
})
export class SharedModule {

  constructor(private globalService: <%=classify(prefixClass)%>GlobalService) { /**inizializzazione del servizio per la creazione dei listener */}
  
  static forRoot() {
    return {
      ngModule: SharedModule,
      providers: [],
      import: []
    }
  }
}
