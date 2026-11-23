import type { Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('../pages/inicio/inicio.page').then((m) => m.InicioPage),
      },
      {
        path: 'bitacora',
        loadComponent: () => import('../pages/bitacora/bitacora.page').then((m) => m.BitacoraPage),
      },
      {
        path: 'checklist',
        loadComponent: () => import('../pages/checklist/checklist.page').then((m) => m.ChecklistPage),
      },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    ],
  },
];
