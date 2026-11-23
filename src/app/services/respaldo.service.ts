import { Injectable, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

import { t } from '../i18n/idioma';

import { StorageService } from './storage.service';
import { LIMITES_RESPALDO } from './validacion-datos';

@Injectable({ providedIn: 'root' })
export class RespaldoService {
  private storage = inject(StorageService);

  async exportar(): Promise<void> {
    const json = JSON.stringify(this.storage.crearRespaldo(), null, 2);
    const nombre = `motocheck-respaldo-${new Date().toISOString().slice(0, 10)}.json`;

    if (Capacitor.isNativePlatform()) {
      const archivo = await Filesystem.writeFile({
        path: nombre,
        data: json,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });
      await Share.share({ title: t('ajustes.compartirTitulo'), files: [archivo.uri] });
    } else {
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = nombre;
      enlace.click();
      URL.revokeObjectURL(url);
    }
    await this.storage.guardarPreferencias({ ultimoRespaldo: new Date().toISOString() });
  }

  async importar(archivo: File): Promise<boolean> {
    if (archivo.size > LIMITES_RESPALDO.bytesArchivo) return false;
    try {
      return await this.storage.restaurarRespaldo(await archivo.text());
    } catch {
      return false;
    }
  }
}
