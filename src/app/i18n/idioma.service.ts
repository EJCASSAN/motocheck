import { Injectable, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import { StorageService } from '../services/storage.service';

import { detectarIdioma, esIdioma, idiomaActual } from './idioma';
import type { Idioma } from './idioma';

@Injectable({ providedIn: 'root' })
export class IdiomaService {
  private transloco = inject(TranslocoService);
  private storage = inject(StorageService);

  async iniciar(idiomaTelefono = globalThis.navigator?.language): Promise<void> {
    await this.storage.cargar().catch(() => undefined);
    await this.aplicarGuardado(idiomaTelefono);
  }

  async aplicarGuardado(idiomaTelefono = globalThis.navigator?.language): Promise<void> {
    const guardado = this.storage.preferencias().idioma;
    await this.activar(esIdioma(guardado) ? guardado : detectarIdioma(idiomaTelefono));
  }

  async cambiar(idioma: Idioma): Promise<void> {
    await this.storage.guardarPreferencias({ idioma });
    await this.activar(idioma);
  }

  private async activar(idioma: Idioma): Promise<void> {
    await firstValueFrom(this.transloco.load(idioma));
    this.transloco.setActiveLang(idioma);
    idiomaActual.set(idioma);
    if (globalThis.document) globalThis.document.documentElement.lang = idioma;
  }
}
