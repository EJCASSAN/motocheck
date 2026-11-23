import type { OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { IonContent, IonIcon, ModalController } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

import { t } from '../../i18n/idioma';
import { StorageService } from '../../services/storage.service';
import { UiService } from '../../services/ui.service';
import { haceCuanto, miles } from '../../utils/formato';

const MAX_DIGITOS = 7;

@Component({
  selector: 'app-kilometraje-modal',
  templateUrl: './kilometraje-modal.component.html',
  styleUrls: ['./kilometraje-modal.component.scss'],
  imports: [IonContent, IonIcon, TranslocoPipe],
})
export class KilometrajeModalComponent implements OnInit {
  private storage = inject(StorageService);
  private modalCtrl = inject(ModalController);
  private ui = inject(UiService);

  readonly teclas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];
  readonly miles = miles;

  anterior = 0;
  private ultimaActualizacion = '';
  valor = '';

  get actualizado(): string {
    return this.ultimaActualizacion ? haceCuanto(this.ultimaActualizacion) : '';
  }

  get numero(): number {
    return parseInt(this.valor || '0', 10);
  }

  get diferencia(): number {
    return this.numero - this.anterior;
  }

  get valido(): boolean {
    return this.valor !== '' && this.diferencia >= 0;
  }

  ngOnInit(): void {
    const perfil = this.storage.perfil();
    this.anterior = perfil?.kilometrajeActual ?? 0;
    this.ultimaActualizacion = perfil?.ultimaActualizacionKm ?? '';
    this.valor = String(this.anterior);
  }

  presionar(tecla: string): void {
    if (tecla === '⌫') this.valor = this.valor.slice(0, -1);
    else if (tecla === 'C') this.valor = '';
    else if (this.valor.length < MAX_DIGITOS) this.valor = (this.valor === '0' ? '' : this.valor) + tecla;
  }

  etiqueta(tecla: string): string {
    if (tecla === '⌫') return t('km.borrarDigito');
    if (tecla === 'C') return t('km.borrarTodo');
    return tecla;
  }

  cancelar(): void {
    void this.modalCtrl.dismiss(null, 'cancel');
  }

  async guardar(): Promise<void> {
    if (!this.valido) return;
    const ok = await this.storage.actualizarKilometraje(this.numero);
    if (!ok) {
      await this.ui.aviso(t('km.errorGuardar'), 'danger');
      return;
    }
    await this.ui.aviso(t('km.actualizado'));
    await this.modalCtrl.dismiss(this.numero, 'saved');
  }
}
