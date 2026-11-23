import { registerLocaleData } from '@angular/common';
import localeEsCO from '@angular/common/locales/es-CO';
import { LOCALE_ID } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  PreloadAllModules,
  RouteReuseStrategy,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowForwardOutline,
  backspaceOutline,
  bicycleOutline,
  buildOutline,
  bulbOutline,
  checkmarkCircleOutline,
  checkmarkOutline,
  chevronBackOutline,
  chevronForwardOutline,
  clipboardOutline,
  closeOutline,
  cloudUploadOutline,
  cogOutline,
  constructOutline,
  discOutline,
  documentOutline,
  downloadOutline,
  ellipseOutline,
  flashOutline,
  funnelOutline,
  homeOutline,
  informationCircleOutline,
  linkOutline,
  listOutline,
  lockClosedOutline,
  notificationsOutline,
  optionsOutline,
  phonePortraitOutline,
  searchOutline,
  settingsOutline,
  shieldCheckmarkOutline,
  speedometerOutline,
  timeOutline,
  trashOutline,
  warningOutline,
  waterOutline,
} from 'ionicons/icons';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

registerLocaleData(localeEsCO);

addIcons({
  addOutline,
  arrowForwardOutline,
  backspaceOutline,
  bicycleOutline,
  buildOutline,
  bulbOutline,
  checkmarkCircleOutline,
  checkmarkOutline,
  chevronBackOutline,
  chevronForwardOutline,
  clipboardOutline,
  closeOutline,
  cloudUploadOutline,
  cogOutline,
  constructOutline,
  discOutline,
  documentOutline,
  downloadOutline,
  ellipseOutline,
  flashOutline,
  funnelOutline,
  homeOutline,
  informationCircleOutline,
  linkOutline,
  listOutline,
  lockClosedOutline,
  notificationsOutline,
  optionsOutline,
  phonePortraitOutline,
  searchOutline,
  settingsOutline,
  shieldCheckmarkOutline,
  speedometerOutline,
  timeOutline,
  trashOutline,
  warningOutline,
  waterOutline,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: 'es-CO' },
    provideIonicAngular({ mode: 'md' }),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
  ],
});
