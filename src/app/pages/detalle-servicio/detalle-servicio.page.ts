import { Component, Input, computed, inject, signal } from '@angular/core';
import { IonContent, IonIcon, NavController } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

import { t } from '../../i18n/idioma';
import { ICONOS_SERVICIO, nombreServicio } from '../../models/catalogo';
import { ModalesService } from '../../services/modales.service';
import { StorageService } from '../../services/storage.service';
import { UiService } from '../../services/ui.service';
import { fechaLarga, miles } from '../../utils/formato';

@Component({
  selector: 'app-detalle-servicio',
  templateUrl: './detalle-servicio.page.html',
  styleUrls: ['./detalle-servicio.page.scss'],
  imports: [IonContent, IonIcon, TranslocoPipe],
})
export class DetalleServicioPage {
  private storage = inject(StorageService);
  private modales = inject(ModalesService);
  private nav = inject(NavController);
  private ui = inject(UiService);

  private readonly id = signal('');

  @Input() set servicioId(valor: string) {
    this.id.set(valor);
  }

  readonly nombreServicio = nombreServicio;
  readonly iconos = ICONOS_SERVICIO;
  readonly miles = miles;

  readonly registro = computed(() => this.storage.mantenimientos().find((m) => m.id === this.id()));

  readonly fechaLarga = computed(() => {
    const r = this.registro();
    return r ? fechaLarga(r.fecha) : '';
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
      t('detalle.eliminarTitulo'),
      t('detalle.eliminarMensaje', { nombre: nombreServicio(r.tipo), fecha: r.fecha }),
      t('detalle.eliminar'),
    );
    if (!ok) return;
    await this.storage.eliminarMantenimiento(r.id);
    await this.ui.aviso(t('detalle.eliminado'));
    this.nav.navigateBack('/tabs/bitacora');
  }
}
