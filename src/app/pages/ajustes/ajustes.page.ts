import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonTextarea,
  IonText,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  optionsOutline,
  saveOutline,
  downloadOutline,
  cloudUploadOutline,
  trashOutline,
} from 'ionicons/icons';
import { StorageService } from '../../services/storage.service';
import { PerfilMoto } from '../../models/motocheck.models';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.page.html',
  styleUrls: ['./ajustes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonTextarea,
    IonText,
  ],
})
export class AjustesPage implements OnInit {
  marca = '';
  modelo = '';
  cilindraje: number | null = null;
  placa = '';
  kilometrajeActual: number | null = null;

  respaldoJson = '';
  mensajeEstado = '';

  constructor(private storage: StorageService, private router: Router) {
    addIcons({
      optionsOutline,
      saveOutline,
      downloadOutline,
      cloudUploadOutline,
      trashOutline,
    });
  }

  ngOnInit() {
    this.storage.perfil$.subscribe((p) => {
      if (p) {
        this.marca = p.marca;
        this.modelo = p.modelo;
        this.cilindraje = p.cilindraje;
        this.placa = p.placa;
        this.kilometrajeActual = p.kilometrajeActual;
      }
    });
  }

  async guardarPerfil() {
    if (!this.marca.trim() || !this.modelo.trim() || !this.cilindraje || !this.placa.trim()) {
      this.mensajeEstado = 'Completa todos los campos del perfil.';
      return;
    }

    const actualizado: PerfilMoto = {
      marca: this.marca.trim(),
      modelo: this.modelo.trim(),
      cilindraje: Number(this.cilindraje),
      placa: this.placa.trim().toUpperCase(),
      kilometrajeActual: Number(this.kilometrajeActual || 0),
      ultimaActualizacionKm: new Date().toISOString(),
    };

    await this.storage.guardarPerfil(actualizado);
    this.mensajeEstado = 'Perfil actualizado correctamente.';
  }

  irAIntervalos() {
    this.router.navigateByUrl('/intervalos');
  }

  exportarRespaldo() {
    this.respaldoJson = this.storage.exportarRespaldoJSON();
    this.mensajeEstado = 'Respaldo generado. Puedes copiar el texto JSON.';
  }

  async importarRespaldo() {
    if (!this.respaldoJson.trim()) {
      this.mensajeEstado = 'Pega primero un JSON de respaldo válido.';
      return;
    }
    const ok = await this.storage.importarRespaldoJSON(this.respaldoJson);
    this.mensajeEstado = ok
      ? 'Respaldo restaurado correctamente.'
      : 'Error: el formato JSON no es válido.';
  }

  async borrarTodo() {
    await this.storage.borrarTodosLosDatos();
    this.router.navigateByUrl('/registro', { replaceUrl: true });
  }
}