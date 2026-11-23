import { Injectable, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

import { StorageService } from './storage.service';

/** RF18 / RF19: respaldo de los datos en un archivo .json. */
@Injectable({ providedIn: 'root' })
export class RespaldoService {
  private storage = inject(StorageService);

  async exportar(): Promise<void> {
    const json = JSON.stringify(this.storage.crearRespaldo(), null, 2);
    const nombre = `motocheck-respaldo-${new Date().toISOString().slice(0, 10)}.json`;

    if (Capacitor.isNativePlatform()) {
      // En el teléfono se escribe en caché y se abre el menú "Compartir" (Drive, WhatsApp, Archivos...).
      const archivo = await Filesystem.writeFile({
        path: nombre,
        data: json,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });
      await Share.share({ title: 'Respaldo MotoCheck', files: [archivo.uri] });
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
    return this.storage.restaurarRespaldo(await archivo.text());
  }
}
