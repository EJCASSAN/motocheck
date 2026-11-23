import { Injectable, inject } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { KilometrajeModalComponent } from '../components/kilometraje-modal/kilometraje-modal.component';
import { ServicioFormComponent } from '../components/servicio-form/servicio-form.component';
import type { RegistroMantenimiento, TipoMantenimiento } from '../models/motocheck.models';

@Injectable({ providedIn: 'root' })
export class ModalesService {
  private modales = inject(ModalController);

  async nuevoServicio(tipoInicial: TipoMantenimiento = 'aceite'): Promise<RegistroMantenimiento | null> {
    return this.abrir(ServicioFormComponent, { tipoInicial });
  }

  async editarServicio(registro: RegistroMantenimiento): Promise<RegistroMantenimiento | null> {
    return this.abrir(ServicioFormComponent, { registro });
  }

  async actualizarKilometraje(): Promise<number | null> {
    return this.abrir(KilometrajeModalComponent, {});
  }

  private async abrir<T>(component: unknown, componentProps: Record<string, unknown>): Promise<T | null> {
    const modal = await this.modales.create({
      component: component as never,
      componentProps,
      cssClass: 'mc-sheet',
      breakpoints: [0, 1],
      initialBreakpoint: 1,
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss<T>();
    return role === 'saved' ? (data ?? null) : null;
  }
}
