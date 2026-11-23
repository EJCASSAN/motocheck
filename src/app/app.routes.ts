import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'registro',
    pathMatch: 'full',
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/registro/registro.page').then((m) => m.RegistroPage),
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'detalle-servicio/:id',
    loadComponent: () =>
      import('./pages/detalle-servicio/detalle-servicio.page').then(
        (m) => m.DetalleServicioPage
      ),
  },
  {
    path: 'diagnostico',
    loadComponent: () =>
      import('./pages/diagnostico/diagnostico.page').then(
        (m) => m.DiagnosticoPage
      ),
  },
  {
    path: 'ajustes',
    loadComponent: () =>
      import('./pages/ajustes/ajustes.page').then((m) => m.AjustesPage),
  },
  {
    path: 'intervalos',
    loadComponent: () =>
      import('./pages/intervalos/intervalos.page').then(
        (m) => m.IntervalosPage
      ),
  },
];