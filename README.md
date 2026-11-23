# MotoCheck

Aplicación móvil (Ionic + Angular + Capacitor) para controlar el mantenimiento preventivo de una motocicleta.
Funciona sin internet: los datos se guardan solo en el teléfono.

## Requisitos

- Node.js 20 o superior y npm
- Para Android: Android Studio (SDK 36) y JDK 21

## Ejecutar en el navegador

```bash
npm install
npm start          # abre http://localhost:4200
```

## Ejecutar en Android

```bash
npm run build      # genera la carpeta www
npx cap sync android
npx cap open android   # luego ▶ Run en Android Studio
```

APK de depuración desde la terminal: `cd android && ./gradlew assembleDebug`
(queda en `android/app/build/outputs/apk/debug/app-debug.apk`).

## Pruebas y calidad

```bash
npm run test:unit
npm run lint
```

## Estructura

- `src/app/models`: tipos de datos y catálogo (servicios, intervalos, checklist)
- `src/app/services`: almacenamiento local, avisos, respaldo, modales y mensajes
- `src/app/pages`: una carpeta por pantalla (registro, inicio, bitácora, checklist, detalle, diagnóstico, ajustes, intervalos)
- `src/app/components`: modales "Nuevo servicio" y "Actualizar kilometraje"
