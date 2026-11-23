import { Component, Input, computed, inject, signal } from '@angular/core';
import { IonContent, IonIcon, NavController } from '@ionic/angular';

import { ICONOS_SERVICIO, NOMBRES_SERVICIO } from '../../models/catalogo';
import { ModalesService } from '../../services/modales.service';
import { StorageService } from '../../services/storage.service';
import { UiService } from '../../services/ui.service';
import { fechaLocal, miles } from '../../utils/formato';

/** Mockup 7 · Detalle de servicio (RF11 ver, RF12 editar, RF13 eliminar). */
@Component({
  selector: 'app-detalle-servicio',
  templateUrl: './detalle-servicio.page.html',
  styleUrls: ['./detalle-servicio.page.scss'],
  imports: [IonContent, IonIcon],
})
export class DetalleServicioPage {
  private storage = inject(StorageService);
  private modales = inject(ModalesService);
  private nav = inject(NavController);
  private ui = inject(UiService);

  private readonly id = signal('');

  /** Parámetro :id de la ruta /servicio/:id. */
  @Input() set servicioId(valor: string) {
    this.id.set(valor);
  }

  readonly nombres = NOMBRES_SERVICIO;
  readonly iconos = ICONOS_SERVICIO;
  readonly miles = miles;

  readonly registro = computed(() => this.storage.mantenimientos().find((m) => m.id === this.id()));

  readonly fechaLarga = computed(() => {
    const r = this.registro();
    if (!r) return '';
    const texto = fechaLocal(r.fecha).toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return texto[0].toUpperCase() + texto.slice(1);
  });

  readonly intervalo = computed(() => {
    const r = this.registro();
    return r && r.tipo !== 'otro' ? this.storage.intervalos().intervalosKm[r.tipo] : null;
  });

  volver(): void {
    this.nav.back();
  }

  editar(): void {
    const r = this.registro();
    if (r) void this.modales.editarServicio(r);
  }

  async eliminar(): Promise<void> {
    const r = this.registro();
    if (!r) return;
    const ok = await this.ui.confirmar(
      'Eliminar registro',
      `Se borrará "${NOMBRES_SERVICIO[r.tipo]}" del ${r.fecha}. Esta acción no se puede deshacer.`,
      'Eliminar',
    );
    if (!ok) return;
    await this.storage.eliminarMantenimiento(r.id);
    await this.ui.aviso('Registro eliminado.');
    this.nav.navigateBack('/tabs/bitacora');
  }
}
