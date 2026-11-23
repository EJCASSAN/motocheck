import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonText,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { speedometerOutline, shieldCheckmarkOutline, arrowForwardOutline } from 'ionicons/icons';
import { StorageService } from '../../services/storage.service';
import { PerfilMoto } from '../../models/motocheck.models';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonInput,
    IonButton,
    IonCard,
    IonCardContent,
    IonIcon,
    IonText,
  ],
})
export class RegistroPage implements OnInit {
  marca = '';
  modelo = '';
  cilindraje: number | null = null;
  placa = '';
  kilometrajeActual: number | null = null;
  mensajeError = '';

  constructor(private storage: StorageService, private router: Router) {
    addIcons({ speedometerOutline, shieldCheckmarkOutline, arrowForwardOutline });
  }

  async ngOnInit() {
    await this.storage.cargarDatosIniciales();
    this.storage.perfil$.subscribe((perfil) => {
      if (perfil) {
        this.router.navigateByUrl('/tabs/inicio', { replaceUrl: true });
      }
    });
  }

  async guardarPerfil() {
    if (
      !this.marca.trim() ||
      !this.modelo.trim() ||
      !this.cilindraje ||
      !this.placa.trim() ||
      this.kilometrajeActual === null ||
      this.kilometrajeActual < 0
    ) {
      this.mensajeError = 'Por favor completa todos los campos de tu moto.';
      return;
    }

    const nuevoPerfil: PerfilMoto = {
      marca: this.marca.trim(),
      modelo: this.modelo.trim(),
      cilindraje: Number(this.cilindraje),
      placa: this.placa.trim().toUpperCase(),
      kilometrajeActual: Number(this.kilometrajeActual),
      ultimaActualizacionKm: new Date().toISOString(),
    };

    await this.storage.guardarPerfil(nuevoPerfil);
    this.router.navigateByUrl('/tabs/inicio', { replaceUrl: true });
  }
}