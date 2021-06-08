/**
 * @author @l.piciollo
 * @email lucapiciolo@gmail.com
 * @create date 2019-12-23 16:47:10
 * @modify date 2019-12-23 16:47:10
 * @desc [prototipo di inizializzazione di una rotta.. è possibile aggiungere ulteriori rotte sotto nella configurazione
 * si raccomanda di effettuare il caricamento lazly dei moduli e non agire per componenti.. 
 * le rotte vengono controllate dall'autenticazione in caso questa fosse abilitata.]
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
  <% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") {%>
import { MsalGuard } from '@azure/msal-angular';
 <% } %>  

/**
 * @author l.piciollo
 * prototipo di rotta con il caricameno lento
 */
const routes: Routes = [{
  path: "home",
  loadChildren: ()=> import('./<%=namePackage%>/component/page/home/home.module').then(module => module.HomeModule),
  canActivate: [<% if (loginSupportConfiguration == "AZURE-ACTIVE-DIRECT") {%>MsalGuard <% } %>  ],
}];
 /**
 * @author l.piciollo
 */
@NgModule({
  imports: [RouterModule.forRoot(routes,{ useHash: true }) ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
