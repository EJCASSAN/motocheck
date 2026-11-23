import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel,
  IonBadge,
} from '@ionic/angular';

interface FallaComun {
  id: string;
  sintoma: string;
  gravedad: 'Alta' | 'Media' | 'Baja';
  causas: string;
  accion: string;
}

@Component({
  selector: 'app-diagnostico',
  templateUrl: './diagnostico.page.html',
  styleUrls: ['./diagnostico.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonLabel,
    IonBadge,
  ],
})
export class DiagnosticoPage {
  fallas: FallaComun[] = [
    {
      id: 'encendido',
      sintoma: 'La moto no enciende (no da arranque)',
      gravedad: 'Alta',
      causas: 'Batería descargada, interruptor de corte (run/off) activado, fusible quemado o bujía en mal estado.',
      accion: 'Verifica el botón rojo de apagado, revisa si encienden las luces del tablero y comprueba los bornes de la batería.',
    },
    {
      id: 'frenos',
      sintoma: 'Chirrido o pérdida de fuerza al frenar',
      gravedad: 'Alta',
      causas: 'Pastillas de freno desgastadas, disco cristalizado o nivel bajo de líquido de frenos.',
      accion: 'Inspecciona el grosor de las pastillas inmediatamente y no ruedes a alta velocidad hasta reemplazarlas.',
    },
    {
      id: 'cadena',
      sintoma: 'Golpeteo metálico en la rueda trasera',
      gravedad: 'Media',
      causas: 'Cadena destensionada, falta de lubricación o dientes del piñón/catalina desgastados.',
      accion: 'Limpia, lubrica y tensiona la cadena dejando entre 2 y 3 cm de juego libre.',
    },
    {
      id: 'temperatura',
      sintoma: 'Sobrecalentamiento del motor',
      gravedad: 'Alta',
      causas: 'Nivel bajo de aceite o refrigerante, ventilador bloqueado o manguera con fuga.',
      accion: 'Detén la moto en un lugar seguro, deja enfriar el motor y revisa niveles antes de continuar.',
    },
    {
      id: 'vibracion',
      sintoma: 'Vibración excesiva en el manillar',
      gravedad: 'Media',
      causas: 'Presión incorrecta en llanta delantera, rin golpeado o rodamientos de dirección flojos.',
      accion: 'Calibra la presión de aire según el manual del fabricante y revisa visualmente la llanta.',
    },
  ];

  colorGravedad(gravedad: FallaComun['gravedad']): string {
    if (gravedad === 'Alta') return 'danger';
    if (gravedad === 'Media') return 'warning';
    return 'success';
  }
}