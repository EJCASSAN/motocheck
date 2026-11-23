import { Injectable, effect, inject } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

import type { AlertaMantenimiento, EstadoAlerta, TipoServicioPeriodico } from '../models/motocheck.models';

import { StorageService } from './storage.service';

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
          title: a.estado === 'vencido' ? `${a.nombre}: vencido` : `${a.nombre}: se acerca`,
          body:
            a.kmRestantes < 0
              ? `Te pasaste ${Math.abs(a.kmRestantes).toLocaleString('es-CO')} km del intervalo.`
              : `Faltan ${a.kmRestantes.toLocaleString('es-CO')} km para el próximo servicio.`,
        })),
      });
    } catch {
      return;
    }
  }
}
