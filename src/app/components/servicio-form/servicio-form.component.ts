import type { OnInit } from '@angular/core';
import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, ModalController } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

import { t } from '../../i18n/idioma';
import { ICONOS_SERVICIO, TIPOS_SERVICIO, etiquetaCorta } from '../../models/catalogo';
import type { RegistroMantenimiento, TipoMantenimiento } from '../../models/motocheck.models';
import { StorageService } from '../../services/storage.service';
import { UiService } from '../../services/ui.service';
import { hoyISO } from '../../utils/formato';

@Component({
  selector: 'app-servicio-form',
  templateUrl: './servicio-form.component.html',
  styleUrls: ['./servicio-form.component.scss'],
  imports: [FormsModule, IonContent, IonIcon, TranslocoPipe],
})
export class ServicioFormComponent implements OnInit {
  @Input() tipoInicial: TipoMantenimiento = 'aceite';
  @Input() registro?: RegistroMantenimiento;

  private storage = inject(StorageService);
  private modalCtrl = inject(ModalController);
  private ui = inject(UiService);

  readonly categorias = TIPOS_SERVICIO.map((id) => ({ id, icono: ICONOS_SERVICIO[id] }));
  readonly etiquetaCorta = etiquetaCorta;
  readonly hoy = hoyISO();

  tipo: TipoMantenimiento = 'aceite';
  kilometraje: number | null = null;
  fecha = this.hoy;
  costo: number | null = null;
  notas = '';
  intentoGuardar = false;
  guardando = false;

  get errorKm(): string {
    if (this.kilometraje === null || this.kilometraje === undefined || `${this.kilometraje}` === '') {
      return t('servicioForm.errores.kmVacio');
    }
    return this.kilometraje < 0 ? t('servicioForm.errores.kmNegativo') : '';
  }

  get errorFecha(): string {
    if (!this.fecha) return t('servicioForm.errores.fechaVacia');
    return this.fecha > this.hoy ? t('servicioForm.errores.fechaFutura') : '';
  }

  get errorCosto(): string {
    return this.costo !== null && this.costo < 0 ? t('servicioForm.errores.costoNegativo') : '';
  }

  ngOnInit(): void {
    if (this.registro) {
      this.tipo = this.registro.tipo;
      this.kilometraje = this.registro.kilometraje;
      this.fecha = this.registro.fecha;
      this.costo = this.registro.costo || null;
      this.notas = this.registro.insumosNotas;
    } else {
      this.tipo = this.tipoInicial;
      this.kilometraje = this.storage.perfil()?.kilometrajeActual ?? null;
    }
  }

  cancelar(): void {
    void this.modalCtrl.dismiss(null, 'cancel');
  }

  async guardar(): Promise<void> {
    this.intentoGuardar = true;
    if (this.errorKm || this.errorFecha || this.errorCosto || this.guardando) return;

    this.guardando = true;
    const guardado = await this.storage.guardarMantenimiento(
      {
        tipo: this.tipo,
        kilometraje: Number(this.kilometraje),
        fecha: this.fecha,
        costo: Number(this.costo || 0),
        insumosNotas: this.notas.trim(),
      },
      this.registro?.id,
    );
    await this.ui.aviso(t(this.registro ? 'servicioForm.actualizado' : 'servicioForm.guardado'));
    await this.modalCtrl.dismiss(guardado, 'saved');
  }
}
