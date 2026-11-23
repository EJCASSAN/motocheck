import type { OnInit } from '@angular/core';
import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, NavController } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

import { t } from '../../i18n/idioma';
import type { PerfilMoto } from '../../models/motocheck.models';
import { StorageService } from '../../services/storage.service';
import { UiService } from '../../services/ui.service';
import { formatoPlaca } from '../../utils/formato';

const MAX_TEXTO = 50;

const PLACA_REGEX = /^[A-Z]{3}\d{2}[A-Z]?$/;

type Campo = 'marca' | 'modelo' | 'cilindraje' | 'placa' | 'kilometraje';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  imports: [FormsModule, IonContent, IonIcon, TranslocoPipe],
})
export class RegistroPage implements OnInit {
  @Input() modo: 'registro' | 'editar' = 'registro';

  private storage = inject(StorageService);
  private router = inject(Router);
  private nav = inject(NavController);
  private ui = inject(UiService);

  marca = '';
  modelo = '';
  cilindraje: number | null = null;
  placa = '';
  kilometraje: number | null = null;
  intentoGuardar = false;

  get editando(): boolean {
    return this.modo === 'editar';
  }

  get errores(): Partial<Record<Campo, string>> {
    const e: Partial<Record<Campo, string>> = {};
    if (!this.marca.trim()) e.marca = 'registro.errores.marcaVacia';
    else if (this.marca.trim().length > MAX_TEXTO) e.marca = 'registro.errores.maximo50';
    if (!this.modelo.trim()) e.modelo = 'registro.errores.modeloVacio';
    else if (this.modelo.trim().length > MAX_TEXTO) e.modelo = 'registro.errores.maximo50';
    if (!this.cilindraje) e.cilindraje = 'registro.errores.cilindrajeVacio';
    else if (this.cilindraje < 50 || this.cilindraje > 2500) e.cilindraje = 'registro.errores.cilindrajeRango';
    if (!this.placa.trim()) e.placa = 'registro.errores.placaVacia';
    else if (!PLACA_REGEX.test(this.placaNormalizada)) e.placa = 'registro.errores.placaFormato';
    if (!this.editando) {
      if (this.kilometraje === null || `${this.kilometraje}` === '') e.kilometraje = 'registro.errores.kmVacio';
      else if (this.kilometraje < 0) e.kilometraje = 'registro.errores.kmNegativo';
    }
    return e;
  }

  get placaNormalizada(): string {
    return this.placa.toUpperCase().replace(/[\s-]/g, '');
  }

  error(campo: Campo): string {
    const clave = this.intentoGuardar ? this.errores[campo] : undefined;
    return clave ? t(clave) : '';
  }

  ngOnInit(): void {
    const p = this.storage.perfil();
    if (this.editando && p) {
      this.marca = p.marca;
      this.modelo = p.modelo;
      this.cilindraje = p.cilindraje;
      this.placa = formatoPlaca(p.placa);
    }
  }

  volver(): void {
    this.nav.back();
  }

  async guardar(): Promise<void> {
    this.intentoGuardar = true;
    if (Object.keys(this.errores).length > 0) {
      await this.ui.aviso(t('registro.revisaCampos'), 'danger');
      return;
    }

    const actual = this.storage.perfil();
    const datos = {
      marca: this.marca.trim(),
      modelo: this.modelo.trim(),
      cilindraje: Number(this.cilindraje),
      placa: this.placaNormalizada,
    };

    if (this.editando && actual) {
      await this.storage.guardarPerfil({ ...actual, ...datos });
      await this.ui.aviso(t('registro.motoActualizada'));
      this.nav.back();
      return;
    }

    const km = Number(this.kilometraje);
    const perfil: PerfilMoto = {
      ...datos,
      kilometrajeInicial: km,
      kilometrajeActual: km,
      ultimaActualizacionKm: new Date().toISOString(),
    };
    await this.storage.guardarPerfil(perfil);
    await this.router.navigateByUrl('/tabs/inicio', { replaceUrl: true });
  }
}
