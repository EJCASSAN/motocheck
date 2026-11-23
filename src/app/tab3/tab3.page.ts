import { Component } from '@angular/core';
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
  IonCheckbox,
  IonLabel,
  IonCard,
  IonCardContent,
  IonProgressBar,
  IonButton,
  IonIcon,
  IonBadge,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  refreshOutline,
  checkmarkDoneCircleOutline,
  medkitOutline,
} from 'ionicons/icons';

interface ItemInspeccion {
  id: string;
  titulo: string;
  descripcion: string;
  revisado: boolean;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
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
    IonCheckbox,
    IonLabel,
    IonCard,
    IonCardContent,
    IonProgressBar,
    IonButton,
    IonIcon,
    IonBadge,
  ],
})
export class Tab3Page {
  items: ItemInspeccion[] = [
    {
      id: 'llantas',
      titulo: 'Llantas y presión',
      descripcion: 'Verificar presión de aire, labrado y ausencia de objetos incrustados.',
      revisado: false,
    },
    {
      id: 'frenos',
      titulo: 'Frenos delantero y trasero',
      descripcion: 'Comprobar firmeza de manigueta/pedal y nivel de líquido.',
      revisado: false,
    },
    {
      id: 'luces',
      titulo: 'Sistema eléctrico y luces',
      descripcion: 'Luz baja, alta, stop, direccionales y pito funcionando.',
      revisado: false,
    },
    {
      id: 'cadena',
      titulo: 'Cadena y kit de arrastre',
      descripcion: 'Revisar tensión adecuada (2-3 cm de holgura) y lubricación.',
      revisado: false,
    },
    {
      id: 'aceite',
      titulo: 'Nivel de aceite y fluidos',
      descripcion: 'Mirilla de aceite en nivel óptimo y sin fugas visibles.',
      revisado: false,
    },
    {
      id: 'documentos',
      titulo: 'Espejos y documentación',
      descripcion: 'Espejos ajustados, SOAT, tecnomecánica y licencia vigentes.',
      revisado: false,
    },
  ];

  constructor(private router: Router) {
    addIcons({ refreshOutline, checkmarkDoneCircleOutline, medkitOutline });
  }

  get completados(): number {
    return this.items.filter((i) => i.revisado).length;
  }

  get progreso(): number {
    return this.completados / this.items.length;
  }

  get listaCompleta(): boolean {
    return this.completados === this.items.length;
  }

  reiniciarLista() {
    this.items.forEach((i) => (i.revisado = false));
  }

  irADiagnostico() {
    this.router.navigateByUrl('/diagnostico');
  }
}