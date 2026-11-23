import type { Idioma } from '../i18n/idioma';

export type TipoServicioPeriodico = 'aceite' | 'cadena' | 'frenos' | 'filtros' | 'bujias' | 'kit_arrastre';

export type TipoMantenimiento = TipoServicioPeriodico | 'otro';

export type EstadoAlerta = 'optimo' | 'proximo' | 'vencido';

export type UmbralAviso = 70 | 80 | 90;

export interface PerfilMoto {
  marca: string;
  modelo: string;
  cilindraje: number;
  placa: string;
  kilometrajeInicial: number;
  kilometrajeActual: number;
  ultimaActualizacionKm: string;
}

export interface RegistroMantenimiento {
  id: string;
  fecha: string;
  kilometraje: number;
  tipo: TipoMantenimiento;
  costo: number;
  insumosNotas: string;
}

export interface ConfiguracionIntervalos {
  umbralAmarillo: UmbralAviso;
  intervalosKm: Record<TipoServicioPeriodico, number>;
}

export interface Preferencias {
  avisosActivos: boolean;
  respaldoAutomatico: boolean;
  ultimoRespaldo: string | null;
  idioma?: Idioma;
}

export interface AlertaMantenimiento {
  tipo: TipoServicioPeriodico;
  kmRecorridos: number;
  intervaloKm: number;
  kmRestantes: number;
  porcentajeUso: number;
  estado: EstadoAlerta;
}

export type PuntoChecklist = 'llantas' | 'aceite' | 'cadena' | 'frenos' | 'luces';

export type ResultadoPunto = 'aprobado' | 'no_aprobado' | null;

export interface ItemChecklist {
  id: PuntoChecklist;
  icono: string;
  servicioRelacionado: TipoMantenimiento;
}

export interface Inspeccion {
  fecha: string;
  resultados: Record<PuntoChecklist, ResultadoPunto>;
}

export interface RespaldoMotoCheck {
  version: 1;
  perfil: PerfilMoto | null;
  mantenimientos: RegistroMantenimiento[];
  intervalos: ConfiguracionIntervalos;
  preferencias?: Preferencias;
  ultimaInspeccion?: Inspeccion | null;
}
