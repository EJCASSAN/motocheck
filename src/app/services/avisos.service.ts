import { Injectable, effect, inject } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

import { t } from '../i18n/idioma';
import { nombreServicio } from '../models/catalogo';
import type { AlertaMantenimiento, EstadoAlerta, TipoServicioPeriodico } from '../models/motocheck.models';
import { miles } from '../utils/formato';

import { StorageService } from './storage.service';

export function textoAviso(a: AlertaMantenimiento): { title: string; body: string } {
  const nombre = nombreServicio(a.tipo);
  const km = miles(Math.abs(a.kmRestantes));
  return {
    title: t(a.estado === 'vencido' ? 'avisos.tituloVencido' : 'avisos.tituloProximo', { nombre }),
    body: t(a.kmRestantes < 0 ? 'avisos.cuerpoPasado' : 'avisos.cuerpoFaltan', { km }),
  };
}

const GRAVEDAD: Record<EstadoAlerta, number> = { optimo: 0, proximo: 1, vencido: 2 };

@Injectable({ providedIn: 'root' })
export class AvisosService {
  private storage = inject(StorageService);
  private anteriores: Map<TipoServicioPeriodico, EstadoAlerta> | null = null;

  constructor() {
    effect(() => {
      const alertas = this.storage.alertas();
      if (alertas.length === 0) {
        this.anteriores = null;
        return;
      }
      const empeoraron = this.anteriores
        ? alertas.filter((a) => GRAVEDAD[a.estado] > GRAVEDAD[this.anteriores!.get(a.tipo) ?? 'optimo'])
        : [];
      this.anteriores = new Map(alertas.map((a) => [a.tipo, a.estado]));

      if (empeoraron.length > 0 && this.storage.preferencias().avisosActivos) {
        void this.notificar(empeoraron);
      }
    });
  }

  async solicitarPermiso(): Promise<boolean> {
    try {
      const estado = await LocalNotifications.requestPermissions();
      return estado.display === 'granted';
    } catch {
      return false;
    }
  }

  private async notificar(alertas: AlertaMantenimiento[]): Promise<void> {
    try {
      const permiso = await LocalNotifications.checkPermissions();
      if (permiso.display !== 'granted' && !(await this.solicitarPermiso())) return;

      await LocalNotifications.schedule({
        notifications: alertas.map((a, i) => ({
          id: (Math.floor(Date.now() / 1000) % 100000) + i,
          ...textoAviso(a),
        })),
      });
    } catch {
      return;
    }
  }
}
