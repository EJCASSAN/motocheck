import { INTERVALOS_DEFAULT, PREFERENCIAS_DEFAULT, TIPOS_PERIODICOS } from '../models/catalogo';
import type {
  ConfiguracionIntervalos,
  Inspeccion,
  PerfilMoto,
  Preferencias,
  PuntoChecklist,
  RegistroMantenimiento,
  TipoMantenimiento,
} from '../models/motocheck.models';

/**
 * Reglas ESTRICTAS para importar un respaldo (RF19): cualquier dato inválido rechaza el archivo.
 * Para leer lo que ya está guardado en el teléfono se usa reparacion-datos.ts, que nunca descarta.
 */

/** Datos de un respaldo listos para guardar: todo validado y completo. */
export interface RespaldoNormalizado {
  perfil: PerfilMoto;
  mantenimientos: RegistroMantenimiento[];
  intervalos: ConfiguracionIntervalos;
  preferencias: Preferencias;
  ultimaInspeccion: Inspeccion | null;
}

/** Límites del respaldo: un archivo enorme haría lenta la app en cada inicio. */
export const LIMITES_RESPALDO = {
  bytesArchivo: 2 * 1024 * 1024,
  servicios: 5000,
  textoCorto: 50, // marca, modelo, placa
  notas: 500,
} as const;

export const TIPOS: TipoMantenimiento[] = [...TIPOS_PERIODICOS, 'otro'];
export const PUNTOS: PuntoChecklist[] = ['llantas', 'aceite', 'cadena', 'frenos', 'luces'];
export const UMBRALES = [70, 80, 90];
const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const FECHA_HORA_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

export type Objeto = Record<string, unknown>;

export function esObjeto(valor: unknown): valor is Objeto {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

export function esNumeroNoNegativo(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor) && valor >= 0;
}

/** Fecha y hora ISO 8601 completa (como la produce Date.toISOString). */
export function esFechaHoraISO(valor: unknown): valor is string {
  return typeof valor === 'string' && FECHA_HORA_REGEX.test(valor) && !Number.isNaN(Date.parse(valor));
}

function esTexto(valor: unknown, maximo: number): valor is string {
  return typeof valor === 'string' && valor.trim().length > 0 && valor.length <= maximo;
}

/** Perfil completo; completa kilometrajeInicial en perfiles del primer prototipo. */
export function normalizarPerfil(valor: unknown): PerfilMoto | null {
  if (!esObjeto(valor)) return null;
  const { marca, modelo, placa, cilindraje, kilometrajeActual, kilometrajeInicial, ultimaActualizacionKm } = valor;
  const corto = LIMITES_RESPALDO.textoCorto;
  if (!esTexto(marca, corto) || !esTexto(modelo, corto) || !esTexto(placa, corto)) return null;
  if (!esNumeroNoNegativo(cilindraje) || !esNumeroNoNegativo(kilometrajeActual)) return null;
  if (kilometrajeInicial !== undefined && !esNumeroNoNegativo(kilometrajeInicial)) return null;
  return {
    marca,
    modelo,
    placa,
    cilindraje,
    kilometrajeActual,
    kilometrajeInicial: kilometrajeInicial ?? kilometrajeActual,
    ultimaActualizacionKm: esFechaHoraISO(ultimaActualizacionKm) ? ultimaActualizacionKm : new Date().toISOString(),
  };
}

export function normalizarMantenimiento(valor: unknown): RegistroMantenimiento | null {
  if (!esObjeto(valor)) return null;
  const { id, tipo, kilometraje, fecha, costo, insumosNotas } = valor;
  if (!esTexto(id, LIMITES_RESPALDO.textoCorto)) return null;
  if (!TIPOS.includes(tipo as TipoMantenimiento)) return null;
  if (!esNumeroNoNegativo(kilometraje)) return null;
  if (typeof fecha !== 'string' || !FECHA_REGEX.test(fecha) || Number.isNaN(Date.parse(fecha))) return null;
  if (costo !== undefined && !esNumeroNoNegativo(costo)) return null;
  if (
    insumosNotas !== undefined &&
    (typeof insumosNotas !== 'string' || insumosNotas.length > LIMITES_RESPALDO.notas)
  ) {
    return null;
  }
  return {
    id,
    tipo: tipo as TipoMantenimiento,
    kilometraje,
    fecha,
    costo: costo ?? 0,
    insumosNotas: insumosNotas ?? '',
  };
}

/** Todos los servicios válidos, sin ids repetidos y como máximo LIMITES_RESPALDO.servicios. */
export function normalizarMantenimientos(valor: unknown): RegistroMantenimiento[] | null {
  if (!Array.isArray(valor) || valor.length > LIMITES_RESPALDO.servicios) return null;
  const lista = valor.map(normalizarMantenimiento);
  if (!lista.every((m) => m !== null)) return null;
  const ids = new Set(lista.map((m) => m.id));
  return ids.size === lista.length ? lista : null;
}

/** Umbral 70/80/90 e intervalos > 0 km; los tipos que falten toman el valor por defecto. */
export function normalizarIntervalos(valor: unknown): ConfiguracionIntervalos | null {
  if (!esObjeto(valor) || !UMBRALES.includes(valor['umbralAmarillo'] as number)) return null;
  const km = valor['intervalosKm'];
  if (!esObjeto(km)) return null;
  const intervalosKm = { ...INTERVALOS_DEFAULT.intervalosKm };
  for (const tipo of TIPOS_PERIODICOS) {
    if (km[tipo] === undefined) continue;
    // > 0 (no >= 500): intervalos del primer prototipo como 300 km deben poder importarse.
    if (!esNumeroNoNegativo(km[tipo]) || km[tipo] === 0) return null;
    intervalosKm[tipo] = km[tipo];
  }
  return { umbralAmarillo: valor['umbralAmarillo'] as ConfiguracionIntervalos['umbralAmarillo'], intervalosKm };
}

export function normalizarPreferencias(valor: unknown): Preferencias | null {
  if (valor === undefined || valor === null) return { ...PREFERENCIAS_DEFAULT };
  if (!esObjeto(valor)) return null;
  const { avisosActivos, respaldoAutomatico, ultimoRespaldo } = valor;
  if (avisosActivos !== undefined && typeof avisosActivos !== 'boolean') return null;
  if (respaldoAutomatico !== undefined && typeof respaldoAutomatico !== 'boolean') return null;
  if (ultimoRespaldo !== undefined && ultimoRespaldo !== null && !esFechaHoraISO(ultimoRespaldo)) return null;
  return {
    avisosActivos: avisosActivos ?? PREFERENCIAS_DEFAULT.avisosActivos,
    respaldoAutomatico: respaldoAutomatico ?? PREFERENCIAS_DEFAULT.respaldoAutomatico,
    ultimoRespaldo: (ultimoRespaldo as string | null | undefined) ?? null,
  };
}

/** `undefined` = inspección inválida; `null` = no hay inspección. Solo copia los campos conocidos. */
export function normalizarInspeccion(valor: unknown): Inspeccion | null | undefined {
  if (valor === undefined || valor === null) return null;
  if (!esObjeto(valor) || !esFechaHoraISO(valor['fecha']) || !esObjeto(valor['resultados'])) return undefined;
  const origen = valor['resultados'];
  const resultados = {} as Inspeccion['resultados'];
  for (const punto of PUNTOS) {
    const r = origen[punto] ?? null;
    if (r !== null && r !== 'aprobado' && r !== 'no_aprobado') return undefined;
    resultados[punto] = r;
  }
  return { fecha: valor['fecha'], resultados };
}

/** RF19: valida el respaldo completo. Devuelve null si cualquier parte es inválida. */
export function normalizarRespaldo(data: unknown): RespaldoNormalizado | null {
  if (!esObjeto(data)) return null;
  // El primer prototipo exportaba sin versión.
  if (data['version'] !== undefined && data['version'] !== 1) return null;

  const perfil = normalizarPerfil(data['perfil']);
  const mantenimientos = normalizarMantenimientos(data['mantenimientos']);
  const intervalos = normalizarIntervalos(data['intervalos']);
  const preferencias = normalizarPreferencias(data['preferencias']);
  const ultimaInspeccion = normalizarInspeccion(data['ultimaInspeccion']);
  if (!perfil || !mantenimientos || !intervalos || !preferencias || ultimaInspeccion === undefined) return null;

  return { perfil, mantenimientos, intervalos, preferencias, ultimaInspeccion };
}
