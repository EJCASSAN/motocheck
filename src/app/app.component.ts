import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

import { AvisosService } from './services/avisos.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  // Se crea al iniciar para vigilar las alertas durante toda la sesión (RF07).
  private avisos = inject(AvisosService);
}
