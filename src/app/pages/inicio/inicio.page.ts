import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';

import { ICONOS_SERVICIO } from '../../models/catalogo';
import type { AlertaMantenimiento, EstadoAlerta } from '../../models/motocheck.models';
import { ModalesService } from '../../services/modales.service';
import { StorageService } from '../../services/storage.service';
import { formatoPlaca, haceCuanto, miles } from '../../utils/formato';

const ETIQUETA_ESTADO: Record<EstadoAlerta, string> = {
  vencido: 'Vencido',
  proximo: 'Próximo',
  optimo: 'Al día',
};

/** Mockup 2 · Inicio / Dashboard (RF05, RF06). Pestaña 1. */
@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  imports: [IonContent, IonIcon, RouterLink],
})
export class InicioPage {
  private storage = inject(StorageService);
  private modales = inject(ModalesService);

  readonly iconos = ICONOS_SERVICIO;
  readonly etiquetaEstado = ETIQUETA_ESTADO;
  readonly miles = miles;
  readonly formatoPlaca = formatoPlaca;

  readonly perfil = this.storage.perfil;
  readonly alertas = this.storage.alertas;
  readonly actualizado = computed(() => {
    const p = this.perfil();
    return p ? haceCuanto(p.ultimaActualizacionKm) : '';
  });
  readonly totales = computed(() => {
    const t: Record<EstadoAlerta, number> = { vencido: 0, proximo: 0, optimo: 0 };
    this.alertas().forEach((a) => t[a.estado]++);
    return t;
  });

  detalle(a: AlertaMantenimiento): string {
    if (a.estado === 'vencido') return `${miles(a.kmRecorridos)} km de ${miles(a.intervaloKm)} km`;
    return `Faltan ${miles(a.kmRestantes)} km`;
  }

  actualizarKm(): void {
    void this.modales.actualizarKilometraje();
  }

  registrar(a: AlertaMantenimiento): void {
    void this.modales.nuevoServicio(a.tipo);
  }
}
