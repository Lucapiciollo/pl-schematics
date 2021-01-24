/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-23 17:33:52
 * @modify date 2019-12-23 17:33:52
 * @desc [Modulo di navigazione, eventualmente il modulo home ha dei componenti al suo interno da raggiungerli trami rotta
 * per definizione al momento dell'atterraggio nella rotta principale del componente, si avvia la creazione del componene home]
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';

const routes: Routes = [{
  path: "",
  data: { breadcrumb: 'Home'},
  component: HomeComponent,
  canActivate: []
}];

/**
 * @author l.piciollo
 * Modulo di navigazione, eventualmente il modulo home ha dei componenti al suo interno da raggiungerli trami rotta
 * per definizione al momento dell'atterraggio nella rotta principale del componente, si avvia la creazione del componene home
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
