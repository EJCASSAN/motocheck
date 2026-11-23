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
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonProgressBar,
  IonList,
  IonItem,
  IonLabel,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  settingsOutline,
  speedometerOutline,
  constructOutline,
  checkmarkCircleOutline,
  warningOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { StorageService } from '../services/storage.service';
import {
  AlertaMantenimiento,
  PerfilMoto,
  TipoMantenimiento,
} from '../models/motocheck.models';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonProgressBar,
    IonList,
    IonItem,
    IonLabel,
    IonModal,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
  ],
})
export class Tab1Page implements OnInit {
  perfil: PerfilMoto | null = null;
  alertas: AlertaMantenimiento[] = [];

  totalVencidos = 0;
  totalProximos = 0;
  totalOptimos = 0;

  modalKmAbierto = false;
  nuevoKilometraje: number | null = null;

  modalServicioAbierto = false;
  servicioTipo: TipoMantenimiento = 'aceite';
  servicioKm: number | null = null;
  servicioFecha = new Date().toISOString().split('T')[0];
  servicioCosto: number | null = null;
  servicioNotas = '';

  constructor(private storage: StorageService, private router: Router) {
    addIcons({
      settingsOutline,
      speedometerOutline,
      constructOutline,
      checkmarkCircleOutline,
      warningOutline,
      alertCircleOutline,
    });
  }

  ngOnInit() {
    this.storage.perfil$.subscribe((p) => {
      this.perfil = p;
      this.actualizarAlertas();
    });
    this.storage.mantenimientos$.subscribe(() => this.actualizarAlertas());
    this.storage.intervalos$.subscribe(() => this.actualizarAlertas());
  }

  actualizarAlertas() {
    this.alertas = this.storage.calcularAlertas();
    this.totalVencidos = this.alertas.filter((a) => a.estado === 'vencido').length;
    this.totalProximos = this.alertas.filter((a) => a.estado === 'proximo').length;
    this.totalOptimos = this.alertas.filter((a) => a.estado === 'optimo').length;
  }

  irAAjustes() {
    this.router.navigateByUrl('/ajustes');
  }

  abrirModalKm() {
    this.nuevoKilometraje = this.perfil ? this.perfil.kilometrajeActual : 0;
    this.modalKmAbierto = true;
  }

  async guardarKilometraje() {
    if (this.nuevoKilometraje !== null && this.nuevoKilometraje >= 0) {
      await this.storage.actualizarKilometraje(Number(this.nuevoKilometraje));
      this.modalKmAbierto = false;
    }
  }

  abrirModalServicio(tipo: TipoMantenimiento) {
    this.servicioTipo = tipo;
    this.servicioKm = this.perfil ? this.perfil.kilometrajeActual : 0;
    this.servicioFecha = new Date().toISOString().split('T')[0];
    this.servicioCosto = null;
    this.servicioNotas = '';
    this.modalServicioAbierto = true;
  }

  async guardarServicio() {
    if (this.servicioKm === null) return;
    await this.storage.agregarMantenimiento({
      tipo: this.servicioTipo,
      kilometraje: Number(this.servicioKm),
      fecha: this.servicioFecha,
      costo: Number(this.servicioCosto || 0),
      insumosNotas: this.servicioNotas.trim(),
    });
    this.modalServicioAbierto = false;
  }

  colorEstado(estado: AlertaMantenimiento['estado']): string {
    if (estado === 'vencido') return 'danger';
    if (estado === 'proximo') return 'warning';
    return 'success';
  }

  etiquetaEstado(estado: AlertaMantenimiento['estado']): string {
    if (estado === 'vencido') return 'Vencido';
    if (estado === 'proximo') return 'Próximo';
    return 'Al día';
  }
}