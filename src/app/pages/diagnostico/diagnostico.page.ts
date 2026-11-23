import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon, NavController } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

import { t, tPlural } from '../../i18n/idioma';
import { CHECKLIST, nombreServicio, textoPunto } from '../../models/catalogo';
import type { ItemChecklist } from '../../models/motocheck.models';
import { ModalesService } from '../../services/modales.service';
import { StorageService } from '../../services/storage.service';
import { capitalizar, haceCuanto, hora, miles } from '../../utils/formato';

interface Falla {
  item: ItemChecklist;
  nombre: string;
  ultimoServicio: string;
}

@Component({
  selector: 'app-diagnostico',
  templateUrl: './diagnostico.page.html',
  styleUrls: ['./diagnostico.page.scss'],
  imports: [IonContent, IonIcon, TranslocoPipe],
})
export class DiagnosticoPage {
  private storage = inject(StorageService);
  private modales = inject(ModalesService);
  private nav = inject(NavController);
  private router = inject(Router);

  readonly nombreServicio = nombreServicio;
  readonly textoPunto = textoPunto;
  readonly inspeccion = this.storage.ultimaInspeccion;

  readonly puntos = computed(() => {
    const r = this.inspeccion()?.resultados;
    return CHECKLIST.map((item) => ({ item, nombre: textoPunto(item.id, 'nombre'), resultado: r?.[item.id] ?? null }));
  });
  readonly aprobados = computed(() => this.puntos().filter((p) => p.resultado === 'aprobado').length);
  readonly resumen = computed(() => {
    const n = this.fallas().length;
    return n > 0 ? tPlural(n, 'diagnostico.sinAprobar') : t('diagnostico.todosAprobados');
  });
  readonly revisados = computed(() => this.puntos().filter((p) => p.resultado !== null).length);

  readonly fallas = computed<Falla[]>(() =>
    this.puntos()
      .filter((p) => p.resultado === 'no_aprobado')
      .map(({ item, nombre }) => {
        const ultimo = this.storage.mantenimientos().find((m) => m.tipo === item.servicioRelacionado);
        return {
          item,
          nombre,
          ultimoServicio:
            item.servicioRelacionado !== 'otro' && ultimo
              ? t('diagnostico.ultimoServicio', {
                  servicio: nombreServicio(item.servicioRelacionado).toLowerCase(),
                  km: miles(ultimo.kilometraje),
                })
              : '',
        };
      }),
  );

  readonly cuando = computed(() => {
    const i = this.inspeccion();
    if (!i) return '';
    const dia = haceCuanto(i.fecha);
    return t('diagnostico.cuando', { dia: capitalizar(dia), hora: hora(i.fecha) });
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
