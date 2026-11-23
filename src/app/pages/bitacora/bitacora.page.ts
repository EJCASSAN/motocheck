import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonFab, IonFabButton, IonIcon } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

import { t, tPlural } from '../../i18n/idioma';
import { ICONOS_SERVICIO, TIPOS_SERVICIO, etiquetaCorta, nombreServicio } from '../../models/catalogo';
import type { RegistroMantenimiento, TipoMantenimiento } from '../../models/motocheck.models';
import { ModalesService } from '../../services/modales.service';
import { StorageService } from '../../services/storage.service';
import { diaMesCorto, mesAnio, miles } from '../../utils/formato';

type Filtro = TipoMantenimiento | 'todos';

interface GrupoMes {
  mes: string;
  items: RegistroMantenimiento[];
}

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

@Component({
  selector: 'app-bitacora',
  templateUrl: './bitacora.page.html',
  styleUrls: ['./bitacora.page.scss'],
  imports: [IonContent, IonFab, IonFabButton, IonIcon, RouterLink, TranslocoPipe],
})
export class BitacoraPage {
  private storage = inject(StorageService);
  private modales = inject(ModalesService);

  readonly nombreServicio = nombreServicio;
  readonly iconos = ICONOS_SERVICIO;
  readonly miles = miles;
  readonly diaMes = diaMesCorto;

  readonly perfil = this.storage.perfil;
  readonly busqueda = signal('');
  readonly filtro = signal<Filtro>('todos');

  readonly chips = computed(() => {
    const usados = new Set(this.storage.mantenimientos().map((m) => m.tipo));
    const tipos = TIPOS_SERVICIO.filter((tipo) => usados.has(tipo));
    return [
      { id: 'todos' as Filtro, label: t('bitacora.todos') },
      ...tipos.map((tipo) => ({ id: tipo as Filtro, label: etiquetaCorta(tipo) })),
    ];
  });

  readonly filtrados = computed(() => {
    const f = this.filtro();
    const q = normalizar(this.busqueda().trim());
    return this.storage
      .mantenimientos()
      .filter(
        (m) =>
          (f === 'todos' || m.tipo === f) &&
          (!q || normalizar(`${nombreServicio(m.tipo)} ${m.insumosNotas}`).includes(q)),
      );
  });

  readonly grupos = computed<GrupoMes[]>(() => {
    const grupos: GrupoMes[] = [];
    for (const m of this.filtrados()) {
      const mes = mesAnio(m.fecha);
      const g = grupos.at(-1);
      if (g?.mes === mes) g.items.push(m);
      else grupos.push({ mes, items: [m] });
    }
    return grupos;
  });

  readonly resumen = computed(() => tPlural(this.filtrados().length, 'bitacora.invertido'));
  readonly total = computed(() => this.filtrados().reduce((s, m) => s + (m.costo || 0), 0));
  readonly hayRegistros = computed(() => this.storage.mantenimientos().length > 0);

  elegirFiltro(id: Filtro): void {
    this.filtro.set(id);
  }

  buscar(evento: Event): void {
    this.busqueda.set((evento.target as HTMLInputElement).value);
  }

  nuevo(): void {
    const f = this.filtro();
    void this.modales.nuevoServicio(f === 'todos' ? 'aceite' : f);
  }
}
