import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';

import { CHECKLIST } from '../../models/catalogo';
import type { PuntoChecklist, ResultadoPunto } from '../../models/motocheck.models';
import { StorageService } from '../../services/storage.service';
import { UiService } from '../../services/ui.service';

type Resultados = Record<PuntoChecklist, ResultadoPunto>;

const VACIO: Resultados = { llantas: null, aceite: null, cadena: null, frenos: null, luces: null };

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.page.html',
  styleUrls: ['./checklist.page.scss'],
  imports: [IonContent, IonIcon, RouterLink],
})
export class ChecklistPage {
  private storage = inject(StorageService);
  private router = inject(Router);
  private ui = inject(UiService);

  readonly items = CHECKLIST;
  readonly resultados = signal<Resultados>({ ...VACIO });

  readonly revisados = computed(() => Object.values(this.resultados()).filter((r) => r !== null).length);
  readonly porcentaje = computed(() => Math.round((this.revisados() / this.items.length) * 100));
  readonly pendientes = computed(() => this.items.length - this.revisados());
  readonly fallas = computed(() => this.items.filter((i) => this.resultados()[i.id] === 'no_aprobado'));
  readonly nombresFallas = computed(() =>
    this.fallas()
      .map((f) => f.nombre.toLowerCase())
      .join(', '),
  );

  marcar(id: PuntoChecklist, valor: Exclude<ResultadoPunto, null>): void {
    this.resultados.update((r) => ({ ...r, [id]: r[id] === valor ? null : valor }));
  }

  reiniciar(): void {
    this.resultados.set({ ...VACIO });
  }

  async finalizar(): Promise<void> {
    if (this.pendientes() > 0) {
      await this.ui.aviso(`Revisa los ${this.pendientes()} puntos pendientes antes de finalizar.`, 'warning');
      return;
    }
    await this.storage.guardarInspeccion({ fecha: new Date().toISOString(), resultados: this.resultados() });
    await this.router.navigateByUrl('/diagnostico');
    this.reiniciar();
  }
}
