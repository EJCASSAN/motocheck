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
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonRange,
  IonLabel,
  IonText,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { saveOutline } from 'ionicons/icons';
import { StorageService } from '../../services/storage.service';
import { ConfiguracionIntervalos } from '../../models/motocheck.models';

@Component({
  selector: 'app-intervalos',
  templateUrl: './intervalos.page.html',
  styleUrls: ['./intervalos.page.scss'],
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
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonRange,
    IonLabel,
    IonText,
  ],
})
export class IntervalosPage implements OnInit {
  config: ConfiguracionIntervalos = {
    umbralAmarillo: 80,
    intervalosKm: {
      aceite: 3000,
      cadena: 4500,
      frenos: 15000,
      filtros: 6000,
      bujias: 10000,
      kit_arrastre: 20000,
    },
  };

  guardado = false;

  constructor(private storage: StorageService, private router: Router) {
    addIcons({ saveOutline });
  }

  ngOnInit() {
    this.storage.intervalos$.subscribe((c) => {
      this.config = {
        umbralAmarillo: c.umbralAmarillo,
        intervalosKm: { ...c.intervalosKm },
      };
    });
  }

  async guardarIntervalos() {
    await this.storage.guardarIntervalos({
      umbralAmarillo: Number(this.config.umbralAmarillo) as 70 | 80 | 90,
      intervalosKm: {
        aceite: Number(this.config.intervalosKm.aceite),
        cadena: Number(this.config.intervalosKm.cadena),
        frenos: Number(this.config.intervalosKm.frenos),
        filtros: Number(this.config.intervalosKm.filtros),
        bujias: Number(this.config.intervalosKm.bujias),
        kit_arrastre: Number(this.config.intervalosKm.kit_arrastre),
      },
    });
    this.guardado = true;
    setTimeout(() => this.router.navigateByUrl('/tabs/inicio'), 800);
  }
}