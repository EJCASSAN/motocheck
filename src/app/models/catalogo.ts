import type {
  ConfiguracionIntervalos,
  ItemChecklist,
  Preferencias,
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

export const NOMBRES_SERVICIO: Record<TipoMantenimiento, string> = {
  aceite: 'Aceite de motor',
  cadena: 'Tensión de cadena',
  frenos: 'Pastillas de freno',
  filtros: 'Filtro de aire',
  bujias: 'Bujías',
  kit_arrastre: 'Kit de arrastre',
  otro: 'Otro servicio',
};

export const ETIQUETAS_CORTAS: Record<TipoMantenimiento, string> = {
  aceite: 'Aceite',
  cadena: 'Cadena',
  frenos: 'Frenos',
  filtros: 'Filtros',
  bujias: 'Bujías',
  kit_arrastre: 'Kit arrastre',
  otro: 'Otro',
};

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
    nombre: 'Neumáticos',
    ayuda: 'Presión y desgaste',
    icono: 'ellipse-outline',
    recomendacion: 'Calibra la presión según el manual y cambia la llanta si el labrado está por debajo del testigo.',
    servicioRelacionado: 'otro',
  },
  {
    id: 'aceite',
    nombre: 'Nivel de aceite',
    ayuda: 'Entre mín. y máx.',
    icono: 'water-outline',
    recomendacion: 'Completa el nivel con el aceite recomendado y revisa que no haya fugas antes de salir.',
    servicioRelacionado: 'aceite',
  },
  {
    id: 'cadena',
    nombre: 'Tensión de cadena',
    ayuda: 'Holgura 2–3 cm',
    icono: 'link-outline',
    recomendacion: 'Ajusta y lubrica la cadena dejando entre 2 y 3 cm de juego libre.',
    servicioRelacionado: 'cadena',
  },
  {
    id: 'frenos',
    nombre: 'Líquido de frenos',
    ayuda: 'Nivel y color',
    icono: 'disc-outline',
    recomendacion: 'No ruedes hasta revisar el nivel del líquido y el grosor de las pastillas.',
    servicioRelacionado: 'frenos',
  },
  {
    id: 'luces',
    nombre: 'Luces',
    ayuda: 'Altas, bajas, stop, direccionales',
    icono: 'bulb-outline',
    recomendacion: 'Cambia el bombillo o fusible dañado: rodar sin luces es peligroso y genera multa.',
    servicioRelacionado: 'otro',
  },
];
