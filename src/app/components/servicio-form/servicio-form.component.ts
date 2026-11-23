import type { OnInit } from '@angular/core';
import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, ModalController } from '@ionic/angular';

import { ETIQUETAS_CORTAS, ICONOS_SERVICIO } from '../../models/catalogo';
import type { RegistroMantenimiento, TipoMantenimiento } from '../../models/motocheck.models';
import { StorageService } from '../../services/storage.service';
import { UiService } from '../../services/ui.service';
import { hoyISO } from '../../utils/formato';

const TIPOS: TipoMantenimiento[] = ['aceite', 'cadena', 'frenos', 'filtros', 'bujias', 'kit_arrastre', 'otro'];

@Component({
  selector: 'app-servicio-form',
  templateUrl: './servicio-form.component.html',
  styleUrls: ['./servicio-form.component.scss'],
  imports: [FormsModule, IonContent, IonIcon],
})
export class ServicioFormComponent implements OnInit {
  @Input() tipoInicial: TipoMantenimiento = 'aceite';
  @Input() registro?: RegistroMantenimiento;

  private storage = inject(StorageService);
  private modalCtrl = inject(ModalController);
  private ui = inject(UiService);

  readonly categorias = TIPOS.map((id) => ({ id, label: ETIQUETAS_CORTAS[id], icono: ICONOS_SERVICIO[id] }));
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
      return 'Escribe el kilometraje del servicio.';
    }
    return this.kilometraje < 0 ? 'El kilometraje no puede ser negativo.' : '';
  }

  get errorFecha(): string {
    if (!this.fecha) return 'Elige la fecha.';
    return this.fecha > this.hoy ? 'La fecha no puede ser futura.' : '';
  }

  get errorCosto(): string {
    return this.costo !== null && this.costo < 0 ? 'El costo no puede ser negativo.' : '';
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
    await this.ui.aviso(this.registro ? 'Servicio actualizado.' : 'Servicio guardado en la bitácora.');
    await this.modalCtrl.dismiss(guardado, 'saved');
  }
}
