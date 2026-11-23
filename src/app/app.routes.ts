import type { Routes } from '@angular/router';

import { requierePerfil, sinPerfil } from './guards';

export const routes: Routes = [
  { path: '', redirectTo: 'tabs/inicio', pathMatch: 'full' },
  {
    path: 'registro',
    canActivate: [sinPerfil],
    loadComponent: () => import('./pages/registro/registro.page').then((m) => m.RegistroPage),
  },
  {
    path: 'tabs',
    canActivate: [requierePerfil],
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'servicio/:servicioId',
    canActivate: [requierePerfil],
    loadComponent: () => import('./pages/detalle-servicio/detalle-servicio.page').then((m) => m.DetalleServicioPage),
  },
  {
    path: 'diagnostico',
    canActivate: [requierePerfil],
    loadComponent: () => import('./pages/diagnostico/diagnostico.page').then((m) => m.DiagnosticoPage),
  },
  {
    path: 'ajustes',
    canActivate: [requierePerfil],
    loadComponent: () => import('./pages/ajustes/ajustes.page').then((m) => m.AjustesPage),
  },
  {
    path: 'editar-moto',
    canActivate: [requierePerfil],
    data: { modo: 'editar' },
    loadComponent: () => import('./pages/registro/registro.page').then((m) => m.RegistroPage),
  },
  {
    path: 'intervalos',
    canActivate: [requierePerfil],
    loadComponent: () => import('./pages/intervalos/intervalos.page').then((m) => m.IntervalosPage),
  },
  { path: '**', redirectTo: 'tabs/inicio' },
];
