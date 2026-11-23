import { INTERVALOS_DEFAULT, PREFERENCIAS_DEFAULT, TIPOS_PERIODICOS } from '../models/catalogo';
import type {
  ConfiguracionIntervalos,
  PerfilMoto,
  Preferencias,
  RegistroMantenimiento,
  TipoMantenimiento,
  UmbralAviso,
} from '../models/motocheck.models';

import { TIPOS, UMBRALES, esObjeto } from './validacion-datos';

/**
 * Lectura TOLERANTE de lo que ya está guardado en el teléfono (puede venir del primer prototipo,
 * que no validaba). Regla: reparar lo mínimo para que la app funcione y NUNCA descartar un registro,
 * porque el siguiente guardado reescribe la clave completa y lo descartado se perdería para siempre.
 */

function numeroFinito(valor: unknown, porDefecto: number): number {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : porDefecto;
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor : valor === undefined || valor === null ? '' : String(valor);
}

/** null solo si no hay forma de usarlo (no es objeto o no tiene kilometraje actual). */
export function repararPerfil(valor: unknown): PerfilMoto | null {
  if (!esObjeto(valor)) return null;
  const actual = valor['kilometrajeActual'];
  if (typeof actual !== 'number' || !Number.isFinite(actual)) return null;
  return {
    marca: texto(valor['marca']),
    modelo: texto(valor['modelo']),
    placa: texto(valor['placa']),
    cilindraje: numeroFinito(valor['cilindraje'], 0),
    kilometrajeActual: actual,
    // Perfiles del avance 1 no tenían kilometrajeInicial.
    kilometrajeInicial: numeroFinito(valor['kilometrajeInicial'], actual),
    ultimaActualizacionKm:
      typeof valor['ultimaActualizacionKm'] === 'string' ? valor['ultimaActualizacionKm'] : new Date(0).toISOString(),
  };
}

/** Conserva cada servicio que sea un objeto; solo se descartan valores que no son registros. */
export function repararMantenimientos(valor: unknown): RegistroMantenimiento[] {
  if (!Array.isArray(valor)) return [];
  return valor.filter(esObjeto).map((m, i) => ({
    id: texto(m['id']) || `recuperado-${i}`,
    tipo: TIPOS.includes(m['tipo'] as TipoMantenimiento) ? (m['tipo'] as TipoMantenimiento) : 'otro',
    kilometraje: numeroFinito(m['kilometraje'], 0),
    fecha: texto(m['fecha']),
    costo: numeroFinito(m['costo'], 0),
    insumosNotas: texto(m['insumosNotas']),
  }));
}

/** Cada intervalo inválido (0, negativo, no numérico) toma su valor por defecto; los demás se conservan. */
export function repararIntervalos(valor: unknown): ConfiguracionIntervalos {
  const config: ConfiguracionIntervalos = {
    umbralAmarillo: INTERVALOS_DEFAULT.umbralAmarillo,
    intervalosKm: { ...INTERVALOS_DEFAULT.intervalosKm },
  };
  if (!esObjeto(valor)) return config;
  if (UMBRALES.includes(valor['umbralAmarillo'] as number)) {
    config.umbralAmarillo = valor['umbralAmarillo'] as UmbralAviso;
  }
  const km = valor['intervalosKm'];
  if (esObjeto(km)) {
    for (const tipo of TIPOS_PERIODICOS) {
      const v = km[tipo];
      if (typeof v === 'number' && Number.isFinite(v) && v > 0) config.intervalosKm[tipo] = v;
    }
  }
  return config;
}

export function repararPreferencias(valor: unknown): Preferencias {
  if (!esObjeto(valor)) return { ...PREFERENCIAS_DEFAULT };
  const { avisosActivos, respaldoAutomatico, ultimoRespaldo } = valor;
  return {
    avisosActivos: typeof avisosActivos === 'boolean' ? avisosActivos : PREFERENCIAS_DEFAULT.avisosActivos,
    respaldoAutomatico:
      typeof respaldoAutomatico === 'boolean' ? respaldoAutomatico : PREFERENCIAS_DEFAULT.respaldoAutomatico,
    ultimoRespaldo: typeof ultimoRespaldo === 'string' ? ultimoRespaldo : null,
  };
}
