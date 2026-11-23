import type { ElementRef } from '@angular/core';
import { Component, computed, inject, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonToggle, NavController } from '@ionic/angular';

import { AvisosService } from '../../services/avisos.service';
import { RespaldoService } from '../../services/respaldo.service';
import { StorageService } from '../../services/storage.service';
import { UiService } from '../../services/ui.service';
import { fechaLocal, formatoPlaca, miles } from '../../utils/formato';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.page.html',
  styleUrls: ['./ajustes.page.scss'],
  imports: [IonContent, IonIcon, IonToggle, RouterLink],
})
export class AjustesPage {
  private storage = inject(StorageService);
  private respaldo = inject(RespaldoService);
  private avisos = inject(AvisosService);
  private ui = inject(UiService);
  private nav = inject(NavController);
  private router = inject(Router);

  private readonly archivo = viewChild.required<ElementRef<HTMLInputElement>>('archivo');

  readonly miles = miles;
  readonly formatoPlaca = formatoPlaca;
  readonly perfil = this.storage.perfil;
  readonly preferencias = this.storage.preferencias;

  readonly ultimoRespaldo = computed(() => {
    const f = this.preferencias().ultimoRespaldo;
    return f ? fechaLocal(f).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : 'nunca';
  });

  readonly espacio = computed(() => {
    this.storage.mantenimientos();
    this.perfil();
    return Math.max(1, Math.round(this.storage.tamanoDatos() / 1024));
  });

  volver(): void {
    this.nav.back();
  }

  async cambiarAvisos(evento: CustomEvent<{ checked: boolean }>): Promise<void> {
    const activar = evento.detail.checked;
    if (activar && !(await this.avisos.solicitarPermiso())) {
      await this.ui.aviso('Activa las notificaciones de MotoCheck en los ajustes del teléfono.', 'warning');
    }
    await this.storage.guardarPreferencias({ avisosActivos: activar });
    await this.ui.aviso(activar ? 'Avisos activados.' : 'Avisos desactivados.');
  }

  async cambiarRespaldoAutomatico(evento: CustomEvent<{ checked: boolean }>): Promise<void> {
    await this.storage.guardarPreferencias({ respaldoAutomatico: evento.detail.checked });
    await this.ui.aviso('El respaldo automático estará disponible en la versión final.', 'warning');
  }

  async exportar(): Promise<void> {
    try {
      await this.respaldo.exportar();
      await this.ui.aviso('Respaldo exportado.');
    } catch {
      await this.ui.aviso('No se exportó el respaldo.', 'warning');
    }
  }

  elegirArchivo(): void {
    this.archivo().nativeElement.click();
  }

  async importar(evento: Event): Promise<void> {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) return;

    const ok = await this.ui.confirmar(
      'Importar respaldo',
      'Los datos actuales se reemplazarán por los del archivo.',
      'Importar',
    );
    if (!ok) return;

    const valido = await this.respaldo.importar(archivo);
    await this.ui.aviso(
      valido ? 'Respaldo restaurado correctamente.' : 'El archivo no es un respaldo válido de MotoCheck.',
      valido ? 'success' : 'danger',
    );
  }

  async borrarTodo(): Promise<void> {
    const ok = await this.ui.confirmar(
      'Borrar todos los datos',
      'Se eliminarán la moto, la bitácora y los ajustes de este teléfono. Exporta un respaldo antes si lo necesitas.',
      'Borrar todo',
    );
    if (!ok) return;
    await this.storage.borrarTodosLosDatos();
    await this.ui.aviso('Datos borrados.');
    await this.router.navigateByUrl('/registro', { replaceUrl: true });
  }
}
