import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonBadge,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline, calendarOutline, speedometerOutline, cashOutline } from 'ionicons/icons';
import { RegistroMantenimiento, TipoMantenimiento } from '../../models/motocheck.models';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-detalle-servicio',
  templateUrl: './detalle-servicio.page.html',
  styleUrls: ['./detalle-servicio.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonBadge,
  ],
})
export class DetalleServicioPage implements OnInit {
  registro: RegistroMantenimiento | null = null;

  nombresTipos: Record<TipoMantenimiento, string> = {
    aceite: 'Aceite de motor',
    cadena: 'Tensión de cadena',
    frenos: 'Pastillas de freno',
    filtros: 'Filtro de aire',
    bujias: 'Bujías',
    kit_arrastre: 'Kit de arrastre',
    otro: 'Otro',
  };

  constructor(private router: Router, private storage: StorageService) {
    addIcons({ trashOutline, calendarOutline, speedometerOutline, cashOutline });
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['registro']) {
      this.registro = nav.extras.state['registro'];
    }
  }

  ngOnInit() {
    if (!this.registro) {
      this.router.navigateByUrl('/tabs/servicios');
    }
  }

  async eliminarRegistro() {
    if (!this.registro) return;
    await this.storage.eliminarMantenimiento(this.registro.id);
    this.router.navigateByUrl('/tabs/servicios', { replaceUrl: true });
  }
}