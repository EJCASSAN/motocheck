import { Injectable, inject } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

/** RNF07: mensajes de confirmación y diálogos antes de borrar. */
@Injectable({ providedIn: 'root' })
export class UiService {
  private toasts = inject(ToastController);
  private alerts = inject(AlertController);

  async aviso(mensaje: string, tipo: 'success' | 'danger' | 'warning' = 'success'): Promise<void> {
    const toast = await this.toasts.create({
      message: mensaje,
      color: tipo,
      duration: 2200,
      position: 'top',
      cssClass: 'mc-toast',
    });
    await toast.present();
  }

  async confirmar(titulo: string, mensaje: string, textoAccion: string): Promise<boolean> {
    const alerta = await this.alerts.create({
      header: titulo,
      message: mensaje,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: textoAccion, role: 'destructive' },
      ],
    });
    await alerta.present();
    const { role } = await alerta.onDidDismiss();
    return role === 'destructive';
  }
}
