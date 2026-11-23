import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonFab,
  IonFabButton,
  IonIcon,
  IonModal,
  IonButtons,
  IonButton,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonChip,
  IonText,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, constructOutline, calendarOutline } from 'ionicons/icons';
import { StorageService } from '../services/storage.service';
import {
  PerfilMoto,
  RegistroMantenimiento,
  TipoMantenimiento,
} from '../models/motocheck.models';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonFab,
    IonFabButton,
    IonIcon,
    IonModal,
    IonButtons,
    IonButton,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonChip,
    IonText,
  ],
})
export class Tab2Page implements OnInit {
  perfil: PerfilMoto | null = null;
  mantenimientos: RegistroMantenimiento[] = [];
  filtroTipo: TipoMantenimiento | 'todos' = 'todos';

  // Modal Nuevo Servicio
  modalAbierto = false;
  servicioTipo: TipoMantenimiento = 'aceite';
  servicioKm: number | null = null;
  servicioFecha = new Date().toISOString().split('T')[0];
  servicioCosto: number | null = null;
  servicioNotas = '';

  nombresTipos: Record<TipoMantenimiento, string> = {
    aceite: 'Aceite de motor',
    cadena: 'Tensión de cadena',
    frenos: 'Pastillas de freno',
    filtros: 'Filtro de aire',
    bujias: 'Bujías',
    kit_arrastre: 'Kit de arrastre',
    otro: 'Otro',
  };

  constructor(private storage: StorageService, private router: Router) {
    addIcons({ addOutline, trashOutline, constructOutline, calendarOutline });
  }

  ngOnInit() {
    this.storage.perfil$.subscribe((p) => (this.perfil = p));
    this.storage.mantenimientos$.subscribe((lista) => (this.mantenimientos = lista));
  }

  get mantenimientosFiltrados(): RegistroMantenimiento[] {
    if (this.filtroTipo === 'todos') return this.mantenimientos;
    return this.mantenimientos.filter((m) => m.tipo === this.filtroTipo);
  }

  get totalInvertido(): number {
    return this.mantenimientosFiltrados.reduce((acc, m) => acc + (m.costo || 0), 0);
  }

  abrirModalNuevo() {
    this.servicioTipo = 'aceite';
    this.servicioKm = this.perfil ? this.perfil.kilometrajeActual : 0;
    this.servicioFecha = new Date().toISOString().split('T')[0];
    this.servicioCosto = null;
    this.servicioNotas = '';
    this.modalAbierto = true;
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
    this.modalAbierto = false;
  }

  async eliminar(id: string, event: Event) {
    event.stopPropagation();
    await this.storage.eliminarMantenimiento(id);
  }

  verDetalle(registro: RegistroMantenimiento) {
    this.router.navigate(['/detalle-servicio'], { state: { registro } });
  }
}