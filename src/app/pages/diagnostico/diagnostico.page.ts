import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon, NavController } from '@ionic/angular';

import { CHECKLIST, NOMBRES_SERVICIO } from '../../models/catalogo';
import type { ItemChecklist } from '../../models/motocheck.models';
import { ModalesService } from '../../services/modales.service';
import { StorageService } from '../../services/storage.service';
import { haceCuanto, miles } from '../../utils/formato';

interface Falla {
  item: ItemChecklist;
  ultimoServicio: string;
}

@Component({
  selector: 'app-diagnostico',
  templateUrl: './diagnostico.page.html',
  styleUrls: ['./diagnostico.page.scss'],
  imports: [IonContent, IonIcon],
})
export class DiagnosticoPage {
  private storage = inject(StorageService);
  private modales = inject(ModalesService);
  private nav = inject(NavController);
  private router = inject(Router);

  readonly nombresServicio = NOMBRES_SERVICIO;
  readonly inspeccion = this.storage.ultimaInspeccion;

  readonly puntos = computed(() => {
    const r = this.inspeccion()?.resultados;
    return CHECKLIST.map((item) => ({ item, resultado: r?.[item.id] ?? null }));
  });
  readonly aprobados = computed(() => this.puntos().filter((p) => p.resultado === 'aprobado').length);
  readonly revisados = computed(() => this.puntos().filter((p) => p.resultado !== null).length);

  readonly fallas = computed<Falla[]>(() =>
    this.puntos()
      .filter((p) => p.resultado === 'no_aprobado')
      .map(({ item }) => {
        const ultimo = this.storage.mantenimientos().find((m) => m.tipo === item.servicioRelacionado);
        return {
          item,
          ultimoServicio:
            item.servicioRelacionado !== 'otro' && ultimo
              ? `Último servicio de ${NOMBRES_SERVICIO[item.servicioRelacionado].toLowerCase()}: ${miles(ultimo.kilometraje)} km.`
              : '',
        };
      }),
  );

  readonly cuando = computed(() => {
    const i = this.inspeccion();
    if (!i) return '';
    const hora = new Date(i.fecha).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
    const dia = haceCuanto(i.fecha);
    return `${dia[0].toUpperCase()}${dia.slice(1)}, ${hora}`;
  });

  volver(): void {
    this.nav.back();
  }

  registrarArreglo(f: Falla): void {
    void this.modales.nuevoServicio(f.item.servicioRelacionado);
  }

  irAInicio(): void {
    void this.router.navigateByUrl('/tabs/inicio');
  }
}
