import { idiomaOpcional } from '../i18n/idioma';
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

function numeroFinito(valor: unknown, porDefecto: number): number {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : porDefecto;
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor : valor === undefined || valor === null ? '' : String(valor);
}

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
    kilometrajeInicial: numeroFinito(valor['kilometrajeInicial'], actual),
    ultimaActualizacionKm:
      typeof valor['ultimaActualizacionKm'] === 'string' ? valor['ultimaActualizacionKm'] : new Date(0).toISOString(),
  };
}

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
  const { avisosActivos, respaldoAutomatico, ultimoRespaldo, idioma } = valor;
  return {
    avisosActivos: typeof avisosActivos === 'boolean' ? avisosActivos : PREFERENCIAS_DEFAULT.avisosActivos,
    respaldoAutomatico:
      typeof respaldoAutomatico === 'boolean' ? respaldoAutomatico : PREFERENCIAS_DEFAULT.respaldoAutomatico,
    ultimoRespaldo: typeof ultimoRespaldo === 'string' ? ultimoRespaldo : null,
    ...idiomaOpcional(idioma),
  };
}
