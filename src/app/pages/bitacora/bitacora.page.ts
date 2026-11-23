import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonFab, IonFabButton, IonIcon } from '@ionic/angular';

import { ETIQUETAS_CORTAS, ICONOS_SERVICIO, NOMBRES_SERVICIO } from '../../models/catalogo';
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
  imports: [IonContent, IonFab, IonFabButton, IonIcon, RouterLink],
})
export class BitacoraPage {
  private storage = inject(StorageService);
  private modales = inject(ModalesService);

  readonly nombres = NOMBRES_SERVICIO;
  readonly iconos = ICONOS_SERVICIO;
  readonly miles = miles;
  readonly diaMes = diaMesCorto;

  readonly perfil = this.storage.perfil;
  readonly busqueda = signal('');
  readonly filtro = signal<Filtro>('todos');

  readonly chips = computed(() => {
    const usados = new Set(this.storage.mantenimientos().map((m) => m.tipo));
    const tipos = (Object.keys(ETIQUETAS_CORTAS) as TipoMantenimiento[]).filter((t) => usados.has(t));
    return [
      { id: 'todos' as Filtro, label: 'Todos' },
      ...tipos.map((t) => ({ id: t as Filtro, label: ETIQUETAS_CORTAS[t] })),
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
          (!q || normalizar(`${NOMBRES_SERVICIO[m.tipo]} ${m.insumosNotas}`).includes(q)),
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
