import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';
import {
  AlertaMantenimiento,
  ConfiguracionIntervalos,
  PerfilMoto,
  RegistroMantenimiento,
  RespaldoMotoCheck,
} from '../models/motocheck.models';

const STORAGE_KEYS = {
  PERFIL: 'motocheck_perfil',
  MANTENIMIENTOS: 'motocheck_mantenimientos',
  INTERVALOS: 'motocheck_intervalos',
};

const INTERVALOS_DEFAULT: ConfiguracionIntervalos = {
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

const NOMBRES_SERVICIO: Record<keyof ConfiguracionIntervalos['intervalosKm'], string> = {
  aceite: 'Aceite de motor',
  cadena: 'Tensión de cadena',
  frenos: 'Pastillas de freno',
  filtros: 'Filtro de aire',
  bujias: 'Bujías',
  kit_arrastre: 'Kit de arrastre',
};

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private perfilSubject = new BehaviorSubject<PerfilMoto | null>(null);
  private mantenimientosSubject = new BehaviorSubject<RegistroMantenimiento[]>([]);
  private intervalosSubject = new BehaviorSubject<ConfiguracionIntervalos>(INTERVALOS_DEFAULT);

  perfil$ = this.perfilSubject.asObservable();
  mantenimientos$ = this.mantenimientosSubject.asObservable();
  intervalos$ = this.intervalosSubject.asObservable();

  constructor() {
    this.cargarDatosIniciales();
  }

  async cargarDatosIniciales(): Promise<void> {
    const [perfilRes, mantRes, intRes] = await Promise.all([
      Preferences.get({ key: STORAGE_KEYS.PERFIL }),
      Preferences.get({ key: STORAGE_KEYS.MANTENIMIENTOS }),
      Preferences.get({ key: STORAGE_KEYS.INTERVALOS }),
    ]);

    if (perfilRes.value) {
      this.perfilSubject.next(JSON.parse(perfilRes.value));
    }
    if (mantRes.value) {
      this.mantenimientosSubject.next(JSON.parse(mantRes.value));
    }
    if (intRes.value) {
      this.intervalosSubject.next(JSON.parse(intRes.value));
    }
  }

  async guardarPerfil(perfil: PerfilMoto): Promise<void> {
    await Preferences.set({
      key: STORAGE_KEYS.PERFIL,
      value: JSON.stringify(perfil),
    });
    this.perfilSubject.next(perfil);
  }

  async actualizarKilometraje(nuevoKm: number): Promise<void> {
    const actual = this.perfilSubject.value;
    if (!actual) return;

    const actualizado: PerfilMoto = {
      ...actual,
      kilometrajeActual: nuevoKm,
      ultimaActualizacionKm: new Date().toISOString(),
    };
    await this.guardarPerfil(actualizado);
  }

  async agregarMantenimiento(registro: Omit<RegistroMantenimiento, 'id'>): Promise<void> {
    const nuevo: RegistroMantenimiento = {
      ...registro,
      id: Date.now().toString(),
    };
    const listaActualizada = [nuevo, ...this.mantenimientosSubject.value].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    await Preferences.set({
      key: STORAGE_KEYS.MANTENIMIENTOS,
      value: JSON.stringify(listaActualizada),
    });
    this.mantenimientosSubject.next(listaActualizada);

    const perfil = this.perfilSubject.value;
    if (perfil && registro.kilometraje > perfil.kilometrajeActual) {
      await this.actualizarKilometraje(registro.kilometraje);
    }
  }

  async eliminarMantenimiento(id: string): Promise<void> {
    const listaActualizada = this.mantenimientosSubject.value.filter((m) => m.id !== id);
    await Preferences.set({
      key: STORAGE_KEYS.MANTENIMIENTOS,
      value: JSON.stringify(listaActualizada),
    });
    this.mantenimientosSubject.next(listaActualizada);
  }

  async guardarIntervalos(config: ConfiguracionIntervalos): Promise<void> {
    await Preferences.set({
      key: STORAGE_KEYS.INTERVALOS,
      value: JSON.stringify(config),
    });
    this.intervalosSubject.next(config);
  }

  calcularAlertas(): AlertaMantenimiento[] {
    const perfil = this.perfilSubject.value;
    if (!perfil) return [];

    const mantenimientos = this.mantenimientosSubject.value;
    const config = this.intervalosSubject.value;
    const tipos = Object.keys(config.intervalosKm) as Array<
      keyof ConfiguracionIntervalos['intervalosKm']
    >;

    return tipos.map((tipo) => {
      const intervaloKm = config.intervalosKm[tipo];
      const ultimoServicio = mantenimientos
        .filter((m) => m.tipo === tipo)
        .sort((a, b) => b.kilometraje - a.kilometraje)[0];

      const kmBase = ultimoServicio ? ultimoServicio.kilometraje : 0;
      const kmRecorridos = Math.max(0, perfil.kilometrajeActual - kmBase);
      const kmRestantes = intervaloKm - kmRecorridos;
      const porcentajeUso = Math.round((kmRecorridos / intervaloKm) * 100);

      let estado: AlertaMantenimiento['estado'] = 'optimo';
      if (porcentajeUso >= 100) {
        estado = 'vencido';
      } else if (porcentajeUso >= config.umbralAmarillo) {
        estado = 'proximo';
      }

      return {
        tipo,
        nombre: NOMBRES_SERVICIO[tipo],
        kmRecorridos,
        intervaloKm,
        kmRestantes,
        porcentajeUso,
        estado,
      };
    });
  }

  exportarRespaldoJSON(): string {
    const respaldo: RespaldoMotoCheck = {
      perfil: this.perfilSubject.value,
      mantenimientos: this.mantenimientosSubject.value,
      intervalos: this.intervalosSubject.value,
    };
    return JSON.stringify(respaldo, null, 2);
  }

  async importarRespaldoJSON(jsonString: string): Promise<boolean> {
    try {
      const data: RespaldoMotoCheck = JSON.parse(jsonString);
      if (data.perfil) await this.guardarPerfil(data.perfil);
      if (Array.isArray(data.mantenimientos)) {
        await Preferences.set({
          key: STORAGE_KEYS.MANTENIMIENTOS,
          value: JSON.stringify(data.mantenimientos),
        });
        this.mantenimientosSubject.next(data.mantenimientos);
      }
      if (data.intervalos) await this.guardarIntervalos(data.intervalos);
      return true;
    } catch {
      return false;
    }
  }

  async borrarTodosLosDatos(): Promise<void> {
    await Preferences.clear();
    this.perfilSubject.next(null);
    this.mantenimientosSubject.next([]);
    this.intervalosSubject.next(INTERVALOS_DEFAULT);
  }
}