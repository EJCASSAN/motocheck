import { t } from '../i18n/idioma';

import type {
  ConfiguracionIntervalos,
  ItemChecklist,
  Preferencias,
  PuntoChecklist,
  TipoMantenimiento,
  TipoServicioPeriodico,
} from './motocheck.models';

export const TIPOS_PERIODICOS: TipoServicioPeriodico[] = [
  'aceite',
  'cadena',
  'frenos',
  'filtros',
  'bujias',
  'kit_arrastre',
];

export const TIPOS_SERVICIO: TipoMantenimiento[] = [...TIPOS_PERIODICOS, 'otro'];

export function nombreServicio(tipo: TipoMantenimiento): string {
  return t(`servicio.${tipo}.nombre`);
}

export function etiquetaCorta(tipo: TipoMantenimiento): string {
  return t(`servicio.${tipo}.corto`);
}

export function textoPunto(id: PuntoChecklist, campo: 'nombre' | 'ayuda' | 'recomendacion'): string {
  return t(`checklist.puntos.${id}.${campo}`);
}

export const ICONOS_SERVICIO: Record<TipoMantenimiento, string> = {
  aceite: 'water-outline',
  cadena: 'link-outline',
  frenos: 'disc-outline',
  filtros: 'funnel-outline',
  bujias: 'flash-outline',
  kit_arrastre: 'cog-outline',
  otro: 'build-outline',
};

export const PASO_INTERVALO: Record<TipoServicioPeriodico, number> = {
  aceite: 500,
  cadena: 500,
  frenos: 1000,
  filtros: 1000,
  bujias: 1000,
  kit_arrastre: 1000,
};

export const INTERVALO_MINIMO_KM = 500;

export const INTERVALOS_DEFAULT: ConfiguracionIntervalos = {
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

export const PREFERENCIAS_DEFAULT: Preferencias = {
  avisosActivos: true,
  respaldoAutomatico: false,
  ultimoRespaldo: null,
};

export const CHECKLIST: ItemChecklist[] = [
  {
    id: 'llantas',
    icono: 'ellipse-outline',
    servicioRelacionado: 'otro',
  },
  {
    id: 'aceite',
    icono: 'water-outline',
    servicioRelacionado: 'aceite',
  },
  {
    id: 'cadena',
    icono: 'link-outline',
    servicioRelacionado: 'cadena',
  },
  {
    id: 'frenos',
    icono: 'disc-outline',
    servicioRelacionado: 'frenos',
  },
  {
    id: 'luces',
    icono: 'bulb-outline',
    servicioRelacionado: 'otro',
  },
];
