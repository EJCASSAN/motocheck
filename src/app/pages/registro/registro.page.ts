import type { OnInit } from '@angular/core';
import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, NavController } from '@ionic/angular';

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
  imports: [FormsModule, IonContent, IonIcon],
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
    if (!this.marca.trim()) e.marca = 'Escribe la marca.';
    else if (this.marca.trim().length > MAX_TEXTO) e.marca = 'Máximo 50 caracteres.';
    if (!this.modelo.trim()) e.modelo = 'Escribe la línea o modelo.';
    else if (this.modelo.trim().length > MAX_TEXTO) e.modelo = 'Máximo 50 caracteres.';
    if (!this.cilindraje) e.cilindraje = 'Escribe el cilindraje.';
    else if (this.cilindraje < 50 || this.cilindraje > 2500) e.cilindraje = 'Entre 50 y 2.500 cc.';
    if (!this.placa.trim()) e.placa = 'Escribe la placa.';
    else if (!PLACA_REGEX.test(this.placaNormalizada)) e.placa = 'Formato: ABC12D o ABC12.';
    if (!this.editando) {
      if (this.kilometraje === null || `${this.kilometraje}` === '') e.kilometraje = 'Escribe el kilometraje.';
      else if (this.kilometraje < 0) e.kilometraje = 'No puede ser negativo.';
    }
    return e;
  }

  get placaNormalizada(): string {
    return this.placa.toUpperCase().replace(/[\s-]/g, '');
  }

  error(campo: Campo): string {
    return this.intentoGuardar ? (this.errores[campo] ?? '') : '';
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
      await this.ui.aviso('Revisa los campos marcados en rojo.', 'danger');
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
      await this.ui.aviso('Datos de la moto actualizados.');
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
