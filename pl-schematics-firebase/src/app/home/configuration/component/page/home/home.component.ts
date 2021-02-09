/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-23 17:31:13
 * @modify date 2019-12-23 17:31:13
 * @desc [componente pagina home template.. qui viene la creazione del servizio del modulo HomeService.. questo garantisce che 
 * il servizio poi viene killato al momento dell' onDestroy del modulo.
 * attenzione, ci deve essere solo una istanza del componente home, altrimenti il servizio viene ricreato. in caso di necessita
 * di piu componenti home, eliminare la riga  providers:[HomeService] .
 * ]
 */
import { Component, OnInit ,Injector} from '@angular/core';
import { HomeService } from './home.service';
import { PlBaseComponent } from 'pl-core-utils-library';
/**
 * @author l.piciollo
 * componente pagina home template.. qui viene la creazione del servizio del modulo HomeService.. questo garantisce che 
 * il servizio poi viene killato al momento dell' onDestroy del modulo.
 * attenzione, ci deve essere solo una istanza del componente home, altrimenti il servizio viene ricreato. in caso di necessita
 * di piu componenti home, eliminare la riga  providers:[HomeService] .
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers:[HomeService]
})
export class HomeComponent  extends PlBaseComponent implements OnInit {

  constructor( protected injector: Injector  ) {
    super(injector)
  }

  ngOnInit() {
  }

}
