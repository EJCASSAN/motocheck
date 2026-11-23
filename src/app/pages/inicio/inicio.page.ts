import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

import { t } from '../../i18n/idioma';
import { ICONOS_SERVICIO, nombreServicio } from '../../models/catalogo';
import type { AlertaMantenimiento, EstadoAlerta } from '../../models/motocheck.models';
import { ModalesService } from '../../services/modales.service';
import { StorageService } from '../../services/storage.service';
import { formatoPlaca, haceCuanto, miles } from '../../utils/formato';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  imports: [IonContent, IonIcon, RouterLink, TranslocoPipe],
})
export class InicioPage {
  private storage = inject(StorageService);
  private modales = inject(ModalesService);

  readonly iconos = ICONOS_SERVICIO;
  readonly nombreServicio = nombreServicio;
  readonly miles = miles;
  readonly formatoPlaca = formatoPlaca;

  readonly perfil = this.storage.perfil;
  readonly alertas = this.storage.alertas;
  readonly actualizado = computed(() => {
    const p = this.perfil();
    return p ? haceCuanto(p.ultimaActualizacionKm) : '';
  });
  readonly totales = computed(() => {
    const conteo: Record<EstadoAlerta, number> = { vencido: 0, proximo: 0, optimo: 0 };
    this.alertas().forEach((a) => conteo[a.estado]++);
    return conteo;
  });

  detalle(a: AlertaMantenimiento): string {
    if (a.estado === 'vencido') {
      return t('inicio.kmDeIntervalo', { recorridos: miles(a.kmRecorridos), intervalo: miles(a.intervaloKm) });
    }
    return t('inicio.faltanKm', { km: miles(a.kmRestantes) });
  }

  actualizarKm(): void {
    void this.modales.actualizarKilometraje();
  }

  registrar(a: AlertaMantenimiento): void {
    void this.modales.nuevoServicio(a.tipo);
  }
}
