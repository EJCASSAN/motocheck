/** Mantenimientos con intervalo en km (se calculan alertas para ellos). */
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
  ultimaActualizacionKm: string; // ISO date
}

export interface RegistroMantenimiento {
  id: string;
  fecha: string; // YYYY-MM-DD
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
  ultimoRespaldo: string | null; // ISO date
}

export interface AlertaMantenimiento {
  tipo: TipoServicioPeriodico;
  nombre: string;
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
  nombre: string;
  ayuda: string;
  icono: string;
  /** Qué hacer si el punto no se aprueba. */
  recomendacion: string;
  /** Servicio de la bitácora que corrige la falla. */
  servicioRelacionado: TipoMantenimiento;
}

export interface Inspeccion {
  fecha: string; // ISO date
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
