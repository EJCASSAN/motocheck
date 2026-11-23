import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

import { StorageService } from './services/storage.service';

// inject() solo funciona antes del primer await, por eso se llama al inicio.

/** Las pantallas de la app requieren una moto registrada. */
export const requierePerfil: CanActivateFn = async () => {
  const storage = inject(StorageService);
  const router = inject(Router);
  await storage.cargar();
  return storage.perfil() ? true : router.parseUrl('/registro');
};

/** El registro inicial solo se muestra la primera vez. */
export const sinPerfil: CanActivateFn = async () => {
  const storage = inject(StorageService);
  const router = inject(Router);
  await storage.cargar();
  return storage.perfil() ? router.parseUrl('/tabs/inicio') : true;
};
