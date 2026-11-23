import { TestBed } from '@angular/core/testing';

import { INTERVALOS_DEFAULT } from '../models/catalogo';
import type { PerfilMoto, RespaldoMotoCheck } from '../models/motocheck.models';

import { RespaldoService } from './respaldo.service';
import { StorageService } from './storage.service';

const perfilActual: PerfilMoto = {
  marca: 'Yamaha',
  modelo: 'MT-03',
  cilindraje: 321,
  placa: 'ABC12D',
  kilometrajeInicial: 25000,
  kilometrajeActual: 34250,
  ultimaActualizacionKm: '2026-11-20T10:00:00.000Z',
};

const perfilRespaldo: PerfilMoto = { ...perfilActual, marca: 'Honda', modelo: 'CB190R', placa: 'XYZ98A' };

function respaldo(cambios: Record<string, unknown> = {}): string {
  const base: RespaldoMotoCheck = {
    version: 1,
    perfil: perfilRespaldo,
    mantenimientos: [
      { id: 'r1', tipo: 'aceite', kilometraje: 30000, fecha: '2026-09-01', costo: 80000, insumosNotas: '' },
    ],
    intervalos: INTERVALOS_DEFAULT,
  };
  return JSON.stringify({ ...base, ...cambios });
}

describe('Restaurar respaldo de forma segura (local-data)', () => {
  let storage: StorageService;

  beforeEach(async () => {
    localStorage.clear();
    storage = TestBed.inject(StorageService);
    await storage.guardarPerfil(perfilActual);
    await storage.guardarMantenimiento({
      tipo: 'cadena',
      kilometraje: 34000,
      fecha: '2026-11-01',
      costo: 25000,
      insumosNotas: '',
    });
    await storage.guardarInspeccion({
      fecha: '2026-11-22T12:00:00.000Z',
      resultados: {
        llantas: 'aprobado',
        aceite: 'aprobado',
        cadena: 'aprobado',
        frenos: 'aprobado',
        luces: 'aprobado',
      },
    });
  });

  function datosSinCambios(): void {
    expect(storage.perfil()?.placa).toBe('ABC12D');
    expect(storage.mantenimientos().map((m) => m.tipo)).toEqual(['cadena']);
  }

  it('G3: rechaza un respaldo sin moto y no mezcla datos', async () => {
    expect(await storage.restaurarRespaldo(respaldo({ perfil: null }))).toBe(false);
    datosSinCambios();
  });

  it('G3: un respaldo sin inspección borra la inspección anterior (reemplazo completo)', async () => {
    expect(await storage.restaurarRespaldo(respaldo())).toBe(true);
    expect(storage.perfil()?.placa).toBe('XYZ98A');
    expect(storage.ultimaInspeccion()).toBeNull();
  });

  it('G4: rechaza intervalos en 0, negativos o umbral fuera de 70/80/90', async () => {
    const malos = [
      { ...INTERVALOS_DEFAULT, intervalosKm: { ...INTERVALOS_DEFAULT.intervalosKm, aceite: 0 } },
      { ...INTERVALOS_DEFAULT, intervalosKm: { ...INTERVALOS_DEFAULT.intervalosKm, frenos: -100 } },
      { ...INTERVALOS_DEFAULT, umbralAmarillo: 50 },
    ];
    for (const intervalos of malos) {
      expect(await storage.restaurarRespaldo(respaldo({ intervalos }))).toBe(false);
    }
    expect(storage.intervalos()).toEqual(INTERVALOS_DEFAULT);
    datosSinCambios();
  });

  it('G4: rechaza versiones de respaldo desconocidas', async () => {
    expect(await storage.restaurarRespaldo(respaldo({ version: 2 }))).toBe(false);
    datosSinCambios();
  });

  it('G5: un servicio sin fecha válida se rechaza sin tocar el perfil ni lanzar error', async () => {
    const mantenimientos = [{ id: 'r1', tipo: 'aceite', kilometraje: 30000, costo: 0, insumosNotas: '' }];
    await expect(storage.restaurarRespaldo(respaldo({ mantenimientos }))).resolves.toBe(false);
    datosSinCambios();
  });

  it('un respaldo exportado por la app se puede importar aunque tenga intervalos del prototipo (300 km)', async () => {
    await storage.guardarIntervalos({
      ...INTERVALOS_DEFAULT,
      intervalosKm: { ...INTERVALOS_DEFAULT.intervalosKm, cadena: 300 },
    });
    const json = JSON.stringify(storage.crearRespaldo());
    expect(await storage.restaurarRespaldo(json)).toBe(true);
    expect(storage.intervalos().intervalosKm.cadena).toBe(300);
  });

  it('importa respaldos del primer prototipo (sin versión ni km inicial)', async () => {
    const { kilometrajeInicial: _omitido, ...perfilViejo } = perfilRespaldo;
    const viejo = JSON.parse(respaldo({ perfil: perfilViejo }));
    delete viejo.version;

    expect(await storage.restaurarRespaldo(JSON.stringify(viejo))).toBe(true);
    expect(storage.perfil()?.kilometrajeInicial).toBe(perfilRespaldo.kilometrajeActual);
  });

  it('G3: si falla una escritura a mitad del proceso, vuelven los datos anteriores', async () => {
    // En web, Preferences escribe en localStorage: la tercera escritura falla.
    const original = Storage.prototype.setItem;
    let llamadas = 0;
    const espia = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, k, v) {
      llamadas++;
      if (llamadas === 3) throw new Error('almacenamiento lleno');
      return original.call(this, k, v);
    });

    expect(await storage.restaurarRespaldo(respaldo())).toBe(false);
    espia.mockRestore();

    // Lo que importa es el disco: una instancia nueva lee lo que quedó guardado.
    TestBed.resetTestingModule();
    const recargado = TestBed.inject(StorageService);
    await recargado.cargar();
    expect(recargado.perfil()?.placa).toBe('ABC12D');
    expect(recargado.mantenimientos().map((m) => m.tipo)).toEqual(['cadena']);
    expect(recargado.ultimaInspeccion()).not.toBeNull();
  });

  it('rechaza ids de servicio repetidos', async () => {
    const s = { id: 'x', tipo: 'aceite', kilometraje: 1000, fecha: '2026-01-01', costo: 0, insumosNotas: '' };
    expect(await storage.restaurarRespaldo(respaldo({ mantenimientos: [s, { ...s, kilometraje: 2000 }] }))).toBe(false);
    datosSinCambios();
  });

  it('rechaza respaldos demasiado grandes (más de 5.000 servicios o notas de más de 500 caracteres)', async () => {
    const muchos = Array.from({ length: 5001 }, (_, i) => ({
      id: `s${i}`,
      tipo: 'aceite',
      kilometraje: i,
      fecha: '2026-01-01',
      costo: 0,
      insumosNotas: '',
    }));
    expect(await storage.restaurarRespaldo(respaldo({ mantenimientos: muchos }))).toBe(false);

    const notaLarga = [
      { id: 'n', tipo: 'otro', kilometraje: 1, fecha: '2026-01-01', costo: 0, insumosNotas: 'a'.repeat(501) },
    ];
    expect(await storage.restaurarRespaldo(respaldo({ mantenimientos: notaLarga }))).toBe(false);
    datosSinCambios();
  });

  it('guarda solo los campos conocidos de la inspección importada', async () => {
    const ultimaInspeccion = {
      fecha: '2026-11-22T12:00:00.000Z',
      resultados: { llantas: 'aprobado', aceite: 'aprobado', cadena: 'no_aprobado', frenos: null, luces: 'aprobado' },
      extra: 'x'.repeat(1000),
    };
    expect(await storage.restaurarRespaldo(respaldo({ ultimaInspeccion }))).toBe(true);
    expect(Object.keys(storage.ultimaInspeccion() ?? {})).toEqual(['fecha', 'resultados']);
  });
});

describe('RespaldoService.importar', () => {
  beforeEach(() => localStorage.clear());

  it('rechaza archivos de más de 2 MB sin leerlos', async () => {
    const servicio = TestBed.inject(RespaldoService);
    const grande = { size: 3 * 1024 * 1024, text: vi.fn() } as unknown as File;
    expect(await servicio.importar(grande)).toBe(false);
    expect(grande.text).not.toHaveBeenCalled();
  });

  it('devuelve false (sin lanzar) si el archivo no se puede leer', async () => {
    const servicio = TestBed.inject(RespaldoService);
    const roto = { size: 10, text: () => Promise.reject(new Error('sin permiso')) } as unknown as File;
    await expect(servicio.importar(roto)).resolves.toBe(false);
  });
});

describe('Arranque con datos dañados (local-data)', () => {
  beforeEach(() => localStorage.clear());

  it('G6: un valor guardado corrupto no impide cargar el resto', async () => {
    localStorage.setItem('CapacitorStorage.motocheck_perfil', JSON.stringify(perfilActual));
    localStorage.setItem('CapacitorStorage.motocheck_mantenimientos', '{esto no es json');
    const storage = TestBed.inject(StorageService);

    await expect(storage.cargar()).resolves.toBeUndefined();
    expect(storage.perfil()?.placa).toBe('ABC12D');
    expect(storage.mantenimientos()).toEqual([]);
  });

  it('G6: con el perfil dañado la app pide registro y los servicios se conservan', async () => {
    localStorage.setItem('CapacitorStorage.motocheck_perfil', '{roto');
    localStorage.setItem(
      'CapacitorStorage.motocheck_mantenimientos',
      JSON.stringify([{ id: 'a', tipo: 'aceite', kilometraje: 1000, fecha: '2026-01-01', costo: 0, insumosNotas: '' }]),
    );
    const storage = TestBed.inject(StorageService);
    await storage.cargar();
    expect(storage.perfil()).toBeNull();
    expect(storage.mantenimientos()).toHaveLength(1);
  });

  it('carga un perfil del primer prototipo (sin km inicial)', async () => {
    const { kilometrajeInicial: _omitido, ...viejo } = perfilActual;
    localStorage.setItem('CapacitorStorage.motocheck_perfil', JSON.stringify(viejo));
    const storage = TestBed.inject(StorageService);
    await storage.cargar();
    expect(storage.perfil()?.kilometrajeInicial).toBe(34250);
  });

  it('no pierde servicios raros del prototipo (fecha vacía, km negativo) al guardar uno nuevo', async () => {
    localStorage.setItem('CapacitorStorage.motocheck_perfil', JSON.stringify(perfilActual));
    localStorage.setItem(
      'CapacitorStorage.motocheck_mantenimientos',
      JSON.stringify([
        { id: 'p1', tipo: 'aceite', kilometraje: -10, fecha: '', costo: 0, insumosNotas: '' },
        { id: 'p2', tipo: 'cadena', kilometraje: 30000, fecha: '2026-05-01', costo: 0, insumosNotas: '' },
      ]),
    );
    const storage = TestBed.inject(StorageService);
    await storage.cargar();
    expect(storage.mantenimientos()).toHaveLength(2);

    await storage.guardarMantenimiento({
      tipo: 'frenos',
      kilometraje: 34000,
      fecha: '2026-11-01',
      costo: 0,
      insumosNotas: '',
    });
    const guardados = JSON.parse(localStorage.getItem('CapacitorStorage.motocheck_mantenimientos') ?? '[]');
    expect(guardados.map((m: { id: string }) => m.id)).toEqual(expect.arrayContaining(['p1', 'p2']));
  });

  it('un intervalo inválido guardado vuelve a su valor por defecto sin borrar los demás', async () => {
    localStorage.setItem(
      'CapacitorStorage.motocheck_intervalos',
      JSON.stringify({
        umbralAmarillo: 70,
        intervalosKm: { ...INTERVALOS_DEFAULT.intervalosKm, aceite: 2000, cadena: 300, frenos: 0 },
      }),
    );
    const storage = TestBed.inject(StorageService);
    await storage.cargar();
    expect(storage.intervalos().umbralAmarillo).toBe(70);
    expect(storage.intervalos().intervalosKm.aceite).toBe(2000);
    expect(storage.intervalos().intervalosKm.cadena).toBe(300);
    expect(storage.intervalos().intervalosKm.frenos).toBe(INTERVALOS_DEFAULT.intervalosKm.frenos);
  });

  it('preferencias e inspección dañadas toman valores por defecto', async () => {
    localStorage.setItem('CapacitorStorage.motocheck_preferencias', JSON.stringify({ avisosActivos: 'si' }));
    localStorage.setItem('CapacitorStorage.motocheck_inspeccion', JSON.stringify({ fecha: 'ayer' }));
    const storage = TestBed.inject(StorageService);
    await storage.cargar();
    expect(storage.preferencias().avisosActivos).toBe(true);
    expect(storage.ultimaInspeccion()).toBeNull();
  });
});
