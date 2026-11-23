import { Injectable, computed, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

import { INTERVALOS_DEFAULT, NOMBRES_SERVICIO, PREFERENCIAS_DEFAULT, TIPOS_PERIODICOS } from '../models/catalogo';
import type {
  AlertaMantenimiento,
  ConfiguracionIntervalos,
  EstadoAlerta,
  Inspeccion,
  PerfilMoto,
  Preferencias,
  RegistroMantenimiento,
  RespaldoMotoCheck,
} from '../models/motocheck.models';

const STORAGE_KEYS = {
  PERFIL: 'motocheck_perfil',
  MANTENIMIENTOS: 'motocheck_mantenimientos',
  INTERVALOS: 'motocheck_intervalos',
  PREFERENCIAS: 'motocheck_preferencias',
  INSPECCION: 'motocheck_inspeccion',
};

const ORDEN_URGENCIA: Record<EstadoAlerta, number> = { vencido: 0, proximo: 1, optimo: 2 };

/**
 * RF05: calcula el estado de cada mantenimiento periódico.
 * Base = km del último servicio de ese tipo; si no hay, el km con que se registró la moto.
 */
export function calcularAlertas(
  perfil: PerfilMoto | null,
  mantenimientos: RegistroMantenimiento[],
  config: ConfiguracionIntervalos,
): AlertaMantenimiento[] {
  if (!perfil) return [];

  return TIPOS_PERIODICOS.map((tipo) => {
    const intervaloKm = config.intervalosKm[tipo];
    const kmUltimoServicio = mantenimientos
      .filter((m) => m.tipo === tipo)
      .reduce((max, m) => Math.max(max, m.kilometraje), -1);

    const kmBase = kmUltimoServicio >= 0 ? kmUltimoServicio : perfil.kilometrajeInicial;
    const kmRecorridos = Math.max(0, perfil.kilometrajeActual - kmBase);
    const porcentajeUso = Math.round((kmRecorridos / intervaloKm) * 100);

    let estado: EstadoAlerta = 'optimo';
    if (porcentajeUso >= 100) estado = 'vencido';
    else if (porcentajeUso >= config.umbralAmarillo) estado = 'proximo';

    return {
      tipo,
      nombre: NOMBRES_SERVICIO[tipo],
      kmRecorridos,
      intervaloKm,
      kmRestantes: intervaloKm - kmRecorridos,
      porcentajeUso,
      estado,
    };
  }).sort((a, b) => ORDEN_URGENCIA[a.estado] - ORDEN_URGENCIA[b.estado] || b.porcentajeUso - a.porcentajeUso);
}

/** Orden de la bitácora: más reciente primero (fecha y luego km). */
function ordenarBitacora(lista: RegistroMantenimiento[]): RegistroMantenimiento[] {
  return [...lista].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.kilometraje - a.kilometraje);
}

/** RF19: valida la estructura mínima de un respaldo antes de importarlo. */
export function esRespaldoValido(data: unknown): data is RespaldoMotoCheck {
  if (!data || typeof data !== 'object') return false;
  const r = data as Partial<RespaldoMotoCheck>;
  const perfilOk =
    r.perfil === null ||
    (typeof r.perfil === 'object' &&
      typeof r.perfil?.marca === 'string' &&
      typeof r.perfil?.placa === 'string' &&
      typeof r.perfil?.kilometrajeActual === 'number');
  const mantOk =
    Array.isArray(r.mantenimientos) &&
    r.mantenimientos.every(
      (m) => typeof m?.id === 'string' && typeof m?.kilometraje === 'number' && typeof m?.tipo === 'string',
    );
  const intOk = typeof r.intervalos?.intervalosKm === 'object' && typeof r.intervalos?.umbralAmarillo === 'number';
  return perfilOk && mantOk && intOk;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  readonly perfil = signal<PerfilMoto | null>(null);
  readonly mantenimientos = signal<RegistroMantenimiento[]>([]);
  readonly intervalos = signal<ConfiguracionIntervalos>(INTERVALOS_DEFAULT);
  readonly preferencias = signal<Preferencias>(PREFERENCIAS_DEFAULT);
  readonly ultimaInspeccion = signal<Inspeccion | null>(null);

  readonly alertas = computed(() => calcularAlertas(this.perfil(), this.mantenimientos(), this.intervalos()));

  private carga: Promise<void> | null = null;

  /** Lee los datos del teléfono una sola vez; las demás llamadas esperan la misma promesa. */
  cargar(): Promise<void> {
    this.carga ??= this.leerTodo();
    return this.carga;
  }

  private async leerTodo(): Promise<void> {
    const [perfil, mant, intervalos, prefs, inspeccion] = await Promise.all(
      Object.values(STORAGE_KEYS).map((key) => Preferences.get({ key })),
    );
    if (perfil.value) {
      const p = JSON.parse(perfil.value) as PerfilMoto;
      // Perfiles del avance 1 no tenían kilometrajeInicial.
      this.perfil.set({ ...p, kilometrajeInicial: p.kilometrajeInicial ?? p.kilometrajeActual });
    }
    if (mant.value) this.mantenimientos.set(ordenarBitacora(JSON.parse(mant.value)));
    if (intervalos.value) this.intervalos.set(JSON.parse(intervalos.value));
    if (prefs.value) this.preferencias.set({ ...PREFERENCIAS_DEFAULT, ...JSON.parse(prefs.value) });
    if (inspeccion.value) this.ultimaInspeccion.set(JSON.parse(inspeccion.value));
  }

  private escribir(key: string, value: unknown): Promise<void> {
    return Preferences.set({ key, value: JSON.stringify(value) });
  }

  // ---- M1 Perfil ----

  async guardarPerfil(perfil: PerfilMoto): Promise<void> {
    await this.escribir(STORAGE_KEYS.PERFIL, perfil);
    this.perfil.set(perfil);
  }

  // ---- M2 Odómetro ----

  /** RF04: no acepta valores menores al odómetro actual. */
  async actualizarKilometraje(nuevoKm: number): Promise<boolean> {
    const actual = this.perfil();
    if (!actual || !Number.isFinite(nuevoKm) || nuevoKm < actual.kilometrajeActual) return false;
    await this.guardarPerfil({
      ...actual,
      kilometrajeActual: nuevoKm,
      ultimaActualizacionKm: new Date().toISOString(),
    });
    return true;
  }

  // ---- M3 Bitácora ----

  obtenerMantenimiento(id: string): RegistroMantenimiento | undefined {
    return this.mantenimientos().find((m) => m.id === id);
  }

  /** RF08 (sin id) y RF12 (con id): guarda el servicio y adelanta el odómetro si hace falta. */
  async guardarMantenimiento(datos: Omit<RegistroMantenimiento, 'id'>, id?: string): Promise<RegistroMantenimiento> {
    const registro: RegistroMantenimiento = { ...datos, id: id ?? Date.now().toString(36) };
    const otros = this.mantenimientos().filter((m) => m.id !== registro.id);
    const lista = ordenarBitacora([registro, ...otros]);

    await this.escribir(STORAGE_KEYS.MANTENIMIENTOS, lista);
    this.mantenimientos.set(lista);

    const perfil = this.perfil();
    if (perfil && registro.kilometraje > perfil.kilometrajeActual) {
      await this.actualizarKilometraje(registro.kilometraje);
    }
    return registro;
  }

  async eliminarMantenimiento(id: string): Promise<void> {
    const lista = this.mantenimientos().filter((m) => m.id !== id);
    await this.escribir(STORAGE_KEYS.MANTENIMIENTOS, lista);
    this.mantenimientos.set(lista);
  }

  // ---- M4 Inspección ----

  async guardarInspeccion(inspeccion: Inspeccion): Promise<void> {
    await this.escribir(STORAGE_KEYS.INSPECCION, inspeccion);
    this.ultimaInspeccion.set(inspeccion);
  }

  // ---- M5 Configuración y datos ----

  async guardarIntervalos(config: ConfiguracionIntervalos): Promise<void> {
    await this.escribir(STORAGE_KEYS.INTERVALOS, config);
    this.intervalos.set(config);
  }

  async guardarPreferencias(cambios: Partial<Preferencias>): Promise<void> {
    const prefs = { ...this.preferencias(), ...cambios };
    await this.escribir(STORAGE_KEYS.PREFERENCIAS, prefs);
    this.preferencias.set(prefs);
  }

  crearRespaldo(): RespaldoMotoCheck {
    return {
      version: 1,
      perfil: this.perfil(),
      mantenimientos: this.mantenimientos(),
      intervalos: this.intervalos(),
      preferencias: this.preferencias(),
      ultimaInspeccion: this.ultimaInspeccion(),
    };
  }

  /** RF19: reemplaza los datos actuales por los del respaldo. Devuelve false si el JSON no es válido. */
  async restaurarRespaldo(json: string): Promise<boolean> {
    let data: unknown;
    try {
      data = JSON.parse(json);
    } catch {
      return false;
    }
    if (!esRespaldoValido(data)) return false;

    if (data.perfil) {
      await this.guardarPerfil({
        ...data.perfil,
        kilometrajeInicial: data.perfil.kilometrajeInicial ?? data.perfil.kilometrajeActual,
      });
    }
    const lista = ordenarBitacora(data.mantenimientos);
    await this.escribir(STORAGE_KEYS.MANTENIMIENTOS, lista);
    this.mantenimientos.set(lista);
    await this.guardarIntervalos({
      umbralAmarillo: data.intervalos.umbralAmarillo,
      intervalosKm: { ...INTERVALOS_DEFAULT.intervalosKm, ...data.intervalos.intervalosKm },
    });
    if (data.preferencias) await this.guardarPreferencias(data.preferencias);
    if (data.ultimaInspeccion) await this.guardarInspeccion(data.ultimaInspeccion);
    return true;
  }

  /** Tamaño aproximado de los datos guardados, en bytes. */
  tamanoDatos(): number {
    return new Blob([JSON.stringify(this.crearRespaldo())]).size;
  }

  /** RF20 */
  async borrarTodosLosDatos(): Promise<void> {
    await Promise.all(Object.values(STORAGE_KEYS).map((key) => Preferences.remove({ key })));
    this.perfil.set(null);
    this.mantenimientos.set([]);
    this.intervalos.set(INTERVALOS_DEFAULT);
    this.preferencias.set(PREFERENCIAS_DEFAULT);
    this.ultimaInspeccion.set(null);
  }
}
