import type { OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { IonContent, IonIcon, NavController } from '@ionic/angular';

import {
  INTERVALOS_DEFAULT,
  INTERVALO_MINIMO_KM,
  NOMBRES_SERVICIO,
  PASO_INTERVALO,
  TIPOS_PERIODICOS,
} from '../../models/catalogo';
import type { ConfiguracionIntervalos, TipoServicioPeriodico, UmbralAviso } from '../../models/motocheck.models';
import { StorageService } from '../../services/storage.service';
import { UiService } from '../../services/ui.service';
import { miles } from '../../utils/formato';

const INTERVALO_MAXIMO_KM = 100_000;

@Component({
  selector: 'app-intervalos',
  templateUrl: './intervalos.page.html',
  styleUrls: ['./intervalos.page.scss'],
  imports: [IonContent, IonIcon],
})
export class IntervalosPage implements OnInit {
  private storage = inject(StorageService);
  private ui = inject(UiService);
  private nav = inject(NavController);

  readonly tipos = TIPOS_PERIODICOS;
  readonly nombres = NOMBRES_SERVICIO;
  readonly umbrales: UmbralAviso[] = [70, 80, 90];
  readonly minimo = INTERVALO_MINIMO_KM;
  readonly miles = miles;

  config: ConfiguracionIntervalos = structuredClone(INTERVALOS_DEFAULT);

  ngOnInit(): void {
    this.config = structuredClone(this.storage.intervalos());
  }

  cambiar(tipo: TipoServicioPeriodico, direccion: 1 | -1): void {
    const nuevo = this.config.intervalosKm[tipo] + direccion * PASO_INTERVALO[tipo];
    this.config.intervalosKm[tipo] = Math.min(INTERVALO_MAXIMO_KM, Math.max(INTERVALO_MINIMO_KM, nuevo));
  }

  restaurar(): void {
    this.config = structuredClone(INTERVALOS_DEFAULT);
  }

  volver(): void {
    this.nav.back();
  }

  async guardar(): Promise<void> {
    await this.storage.guardarIntervalos(structuredClone(this.config));
    await this.ui.aviso('Intervalos guardados. Las alertas se recalcularon.');
    this.nav.back();
  }
}
