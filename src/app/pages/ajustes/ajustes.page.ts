import type { ElementRef } from '@angular/core';
import { Component, computed, inject, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonToggle, NavController } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

import { IDIOMAS, idiomaActual, t } from '../../i18n/idioma';
import type { Idioma } from '../../i18n/idioma';
import { IdiomaService } from '../../i18n/idioma.service';
import { AvisosService } from '../../services/avisos.service';
import { RespaldoService } from '../../services/respaldo.service';
import { StorageService } from '../../services/storage.service';
import { UiService } from '../../services/ui.service';
import { fechaCorta, formatoPlaca, miles } from '../../utils/formato';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.page.html',
  styleUrls: ['./ajustes.page.scss'],
  imports: [IonContent, IonIcon, IonToggle, RouterLink, TranslocoPipe],
})
export class AjustesPage {
  private storage = inject(StorageService);
  private respaldo = inject(RespaldoService);
  private avisos = inject(AvisosService);
  private idiomas = inject(IdiomaService);
  private ui = inject(UiService);
  private nav = inject(NavController);
  private router = inject(Router);

  private readonly archivo = viewChild.required<ElementRef<HTMLInputElement>>('archivo');

  readonly miles = miles;
  readonly formatoPlaca = formatoPlaca;
  readonly perfil = this.storage.perfil;
  readonly preferencias = this.storage.preferencias;
  readonly idioma = idiomaActual.asReadonly();
  readonly opcionesIdioma = IDIOMAS;

  readonly ultimoRespaldo = computed(() => {
    const f = this.preferencias().ultimoRespaldo;
    return f ? fechaCorta(f) : t('ajustes.nunca');
  });

  readonly espacio = computed(() => {
    this.storage.mantenimientos();
    this.perfil();
    return Math.max(1, Math.round(this.storage.tamanoDatos() / 1024));
  });

  volver(): void {
    this.nav.back();
  }

  async cambiarIdioma(idioma: Idioma): Promise<void> {
    if (idioma === this.idioma()) return;
    try {
      await this.idiomas.cambiar(idioma);
      await this.ui.aviso(t('ajustes.idiomaCambiado'));
    } catch {
      await this.ui.aviso(t('ajustes.idiomaError'), 'danger');
    }
  }

  async cambiarAvisos(evento: CustomEvent<{ checked: boolean }>): Promise<void> {
    const activar = evento.detail.checked;
    if (activar && !(await this.avisos.solicitarPermiso())) {
      await this.ui.aviso(t('ajustes.permisoAvisos'), 'warning');
    }
    await this.storage.guardarPreferencias({ avisosActivos: activar });
    await this.ui.aviso(t(activar ? 'ajustes.avisosActivados' : 'ajustes.avisosDesactivados'));
  }

  async cambiarRespaldoAutomatico(evento: CustomEvent<{ checked: boolean }>): Promise<void> {
    await this.storage.guardarPreferencias({ respaldoAutomatico: evento.detail.checked });
    await this.ui.aviso(t('ajustes.respaldoAutoPendiente'), 'warning');
  }

  async exportar(): Promise<void> {
    try {
      await this.respaldo.exportar();
      await this.ui.aviso(t('ajustes.exportado'));
    } catch {
      await this.ui.aviso(t('ajustes.noExportado'), 'warning');
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

    const ok = await this.ui.confirmar(t('ajustes.importar'), t('ajustes.importarMensaje'), t('ajustes.importarBoton'));
    if (!ok) return;

    const valido = await this.respaldo.importar(archivo);
    if (valido) await this.idiomas.aplicarGuardado();
    await this.ui.aviso(t(valido ? 'ajustes.restaurado' : 'ajustes.archivoInvalido'), valido ? 'success' : 'danger');
  }

  async borrarTodo(): Promise<void> {
    const ok = await this.ui.confirmar(t('ajustes.borrarTodo'), t('ajustes.borrarMensaje'), t('ajustes.borrarBoton'));
    if (!ok) return;
    await this.storage.borrarTodosLosDatos();
    await this.idiomas.aplicarGuardado();
    await this.ui.aviso(t('ajustes.borrados'));
    await this.router.navigateByUrl('/registro', { replaceUrl: true });
  }
}
