export type TipoMantenimiento =
  | 'aceite'
  | 'cadena'
  | 'frenos'
  | 'filtros'
  | 'bujias'
  | 'kit_arrastre'
  | 'otro';

export type EstadoAlerta = 'optimo' | 'proximo' | 'vencido';

export interface PerfilMoto {
  marca: string;
  modelo: string;
  cilindraje: number;
  placa: string;
  kilometrajeActual: number;
  ultimaActualizacionKm: string; // ISO date
}

export interface RegistroMantenimiento {
  id: string;
  fecha: string; // ISO date
  kilometraje: number;
  tipo: TipoMantenimiento;
  costo: number;
  insumosNotas: string;
}

export interface ConfiguracionIntervalos {
  umbralAmarillo: 70 | 80 | 90; // Porcentaje de aviso
  intervalosKm: {
    aceite: number;
    cadena: number;
    frenos: number;
    filtros: number;
    bujias: number;
    kit_arrastre: number;
  };
}

export interface AlertaMantenimiento {
  tipo: keyof ConfiguracionIntervalos['intervalosKm'];
  nombre: string;
  kmRecorridos: number;
  intervaloKm: number;
  kmRestantes: number;
  porcentajeUso: number;
  estado: EstadoAlerta;
}

export interface ItemChecklist {
  id: string;
  nombre: string;
  descripcion: string;
  estado: 'pendiente' | 'aprobado' | 'no_aprobado';
}

export interface RespaldoMotoCheck {
  perfil: PerfilMoto | null;
  mantenimientos: RegistroMantenimiento[];
  intervalos: ConfiguracionIntervalos;
}