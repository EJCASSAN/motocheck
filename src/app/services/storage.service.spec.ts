import { TestBed } from '@angular/core/testing';

import { INTERVALOS_DEFAULT } from '../models/catalogo';
import type { PerfilMoto, RegistroMantenimiento } from '../models/motocheck.models';

import { StorageService, calcularAlertas, esRespaldoValido } from './storage.service';

const perfil: PerfilMoto = {
  marca: 'Yamaha',
  modelo: 'MT-03',
  cilindraje: 321,
  placa: 'ABC12D',
  kilometrajeInicial: 25000,
  kilometrajeActual: 34250,
  ultimaActualizacionKm: '2026-11-20T10:00:00.000Z',
};

const servicio = (tipo: RegistroMantenimiento['tipo'], kilometraje: number): RegistroMantenimiento => ({
  id: `${tipo}-${kilometraje}`,
  tipo,
  kilometraje,
  fecha: '2026-10-15',
  costo: 0,
  insumosNotas: '',
});

describe('calcularAlertas (RF05)', () => {
  it('no calcula nada sin moto registrada', () => {
    expect(calcularAlertas(null, [], INTERVALOS_DEFAULT)).toEqual([]);
  });

  it('clasifica vencido, próximo y al día como en el mockup', () => {
    const alertas = calcularAlertas(
      perfil,
      [servicio('aceite', 31000), servicio('cadena', 30400), servicio('frenos', 28200)],
      INTERVALOS_DEFAULT,
    );
    const porTipo = Object.fromEntries(alertas.map((a) => [a.tipo, a]));

    expect(porTipo['aceite'].estado).toBe('vencido'); // 3.250 de 3.000 km
    expect(porTipo['aceite'].kmRecorridos).toBe(3250);
    expect(porTipo['cadena'].estado).toBe('proximo'); // faltan 650 km (86 %)
    expect(porTipo['cadena'].kmRestantes).toBe(650);
    expect(porTipo['frenos'].estado).toBe('optimo'); // faltan 8.950 km
    expect(porTipo['frenos'].kmRestantes).toBe(8950);
  });

  it('usa el último servicio de cada tipo y, si no hay, el km del registro', () => {
    const alertas = calcularAlertas(perfil, [servicio('aceite', 28000), servicio('aceite', 33000)], INTERVALOS_DEFAULT);
    expect(alertas.find((a) => a.tipo === 'aceite')?.kmRecorridos).toBe(1250);
    expect(alertas.find((a) => a.tipo === 'bujias')?.kmRecorridos).toBe(9250);
  });

  it('respeta el umbral de aviso configurado', () => {
    const config = { ...INTERVALOS_DEFAULT, umbralAmarillo: 90 as const };
    const cadena = calcularAlertas(perfil, [servicio('cadena', 30400)], config).find((a) => a.tipo === 'cadena');
    expect(cadena?.estado).toBe('optimo'); // 86 % < 90 %
  });

  it('ordena por urgencia: vencidos primero', () => {
    const alertas = calcularAlertas(perfil, [servicio('aceite', 34000)], INTERVALOS_DEFAULT);
    const orden = alertas.map((a) => a.estado);
    expect(orden.indexOf('vencido')).toBeLessThan(orden.indexOf('optimo'));
  });
});

describe('esRespaldoValido (RF19)', () => {
  it('acepta un respaldo correcto', () => {
    expect(
      esRespaldoValido({
        version: 1,
        perfil,
        mantenimientos: [servicio('aceite', 1000)],
        intervalos: INTERVALOS_DEFAULT,
      }),
    ).toBe(true);
  });

  it('rechaza archivos que no son de MotoCheck', () => {
    expect(esRespaldoValido(null)).toBe(false);
    expect(esRespaldoValido({ hola: 'mundo' })).toBe(false);
    expect(esRespaldoValido({ perfil, mantenimientos: 'x', intervalos: INTERVALOS_DEFAULT })).toBe(false);
  });
});

describe('StorageService', () => {
  let storage: StorageService;

  beforeEach(async () => {
    localStorage.clear();
    storage = TestBed.inject(StorageService);
    await storage.guardarPerfil(perfil);
  });

  it('RF04: no acepta un kilometraje menor al actual', async () => {
    expect(await storage.actualizarKilometraje(34000)).toBe(false);
    expect(storage.perfil()?.kilometrajeActual).toBe(34250);
    expect(await storage.actualizarKilometraje(34580)).toBe(true);
    expect(storage.perfil()?.kilometrajeActual).toBe(34580);
  });

  it('RF08: guardar un servicio con más km adelanta el odómetro', async () => {
    await storage.guardarMantenimiento({
      tipo: 'aceite',
      kilometraje: 35000,
      fecha: '2026-11-23',
      costo: 90000,
      insumosNotas: '',
    });
    expect(storage.mantenimientos()).toHaveLength(1);
    expect(storage.perfil()?.kilometrajeActual).toBe(35000);
  });

  it('RF12 y RF13: edita y elimina un servicio', async () => {
    const r = await storage.guardarMantenimiento({
      tipo: 'cadena',
      kilometraje: 34000,
      fecha: '2026-11-01',
      costo: 0,
      insumosNotas: '',
    });
    await storage.guardarMantenimiento({ ...r, costo: 25000 }, r.id);
    expect(storage.mantenimientos()).toHaveLength(1);
    expect(storage.obtenerMantenimiento(r.id)?.costo).toBe(25000);

    await storage.eliminarMantenimiento(r.id);
    expect(storage.mantenimientos()).toHaveLength(0);
  });

  it('RF18 y RF19: un respaldo exportado se puede importar', async () => {
    await storage.guardarMantenimiento({
      tipo: 'frenos',
      kilometraje: 30000,
      fecha: '2026-09-01',
      costo: 110000,
      insumosNotas: '',
    });
    const json = JSON.stringify(storage.crearRespaldo());
    await storage.borrarTodosLosDatos();
    expect(storage.perfil()).toBeNull();

    expect(await storage.restaurarRespaldo(json)).toBe(true);
    expect(storage.perfil()?.placa).toBe('ABC12D');
    expect(storage.mantenimientos()).toHaveLength(1);
    expect(await storage.restaurarRespaldo('no es json')).toBe(false);
  });
});
