import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

import { StorageService } from './services/storage.service';

export const requierePerfil: CanActivateFn = async () => {
  const storage = inject(StorageService);
  const router = inject(Router);
  await storage.cargar();
  return storage.perfil() ? true : router.parseUrl('/registro');
};

export const sinPerfil: CanActivateFn = async () => {
  const storage = inject(StorageService);
  const router = inject(Router);
  await storage.cargar();
  return storage.perfil() ? router.parseUrl('/tabs/inicio') : true;
};
