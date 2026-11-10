/**
 * @author @l.piciollo
 * @desc [rotte applicative (architettura standalone). Prototipo di rotta con caricamento lazy del componente;
 * si raccomanda di caricare in modo lazy i componenti/le rotte di feature.
 * Le rotte vengono controllate dall'autenticazione in caso questa fosse abilitata.]
 */
import { Routes } from '@angular/router';
import { RouteFakeGuard } from './<%= namePackage %>/core/service/router.fake.guard';

/**
 * @author l.piciollo
 * Rotte applicative dell'architettura standalone: la rotta 'home' carica in modo lazy HomeComponent
 * (breadcrumb 'Home') ed e' protetta da RouteFakeGuard. Va passata al router in app.config.ts.
 */
export const routes: Routes = [
  {
    path: 'home',
    data: { breadcrumb: 'Home' },
    loadComponent: () =>
      import('./<%= namePackage %>/component/page/home/home.component').then((module) => module.HomeComponent),
    canActivate: [RouteFakeGuard],
  },
];
