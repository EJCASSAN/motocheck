import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';

import { StorageService } from '../services/storage.service';

import { idiomaActual } from './idioma';
import { IdiomaService } from './idioma.service';
import { configurarIdiomasDePrueba } from './testing';

describe('IdiomaService', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => (document.documentElement.lang = ''));

  it('sin elección guardada usa inglés si el teléfono está en inglés', async () => {
    await TestBed.inject(IdiomaService).iniciar('en-US');
    expect(idiomaActual()).toBe('en');
    expect(TestBed.inject(TranslocoService).getActiveLang()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('sin elección guardada usa español para otros idiomas', async () => {
    await TestBed.inject(IdiomaService).iniciar('fr-FR');
    expect(idiomaActual()).toBe('es');
  });

  it('la elección guardada gana al idioma del teléfono y sobrevive al reinicio', async () => {
    const servicio = TestBed.inject(IdiomaService);
    await servicio.iniciar('es-CO');
    await servicio.cambiar('en');
    expect(TestBed.inject(StorageService).preferencias().idioma).toBe('en');

    TestBed.resetTestingModule();
    configurarIdiomasDePrueba();
    await TestBed.inject(IdiomaService).iniciar('es-CO');
    expect(idiomaActual()).toBe('en');
  });

  it('al importar un respaldo con otro idioma, la pantalla cambia sin reiniciar', async () => {
    const servicio = TestBed.inject(IdiomaService);
    const storage = TestBed.inject(StorageService);
    await servicio.iniciar('es-CO');
    await storage.guardarPerfil({
      marca: 'Honda',
      modelo: 'CB190R',
      cilindraje: 184,
      placa: 'XYZ98A',
      kilometrajeInicial: 1000,
      kilometrajeActual: 2000,
      ultimaActualizacionKm: '2026-11-20T10:00:00.000Z',
    });
    await storage.guardarPreferencias({ idioma: 'en' });
    const json = JSON.stringify(storage.crearRespaldo());
    await storage.guardarPreferencias({ idioma: 'es' });

    expect(await storage.restaurarRespaldo(json)).toBe(true);
    await servicio.aplicarGuardado('es-CO');
    expect(idiomaActual()).toBe('en');
  });

  it('sin idioma guardado (respaldo antiguo o datos borrados) vuelve al idioma del teléfono', async () => {
    const servicio = TestBed.inject(IdiomaService);
    await servicio.iniciar('en-US');
    await servicio.cambiar('es');
    await TestBed.inject(StorageService).borrarTodosLosDatos();
    await servicio.aplicarGuardado('en-US');
    expect(idiomaActual()).toBe('en');
  });

  it('si no se puede guardar la elección, el idioma no cambia y se informa el error', async () => {
    const servicio = TestBed.inject(IdiomaService);
    await servicio.iniciar('es-CO');
    const espia = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('lleno');
    });
    await expect(servicio.cambiar('en')).rejects.toThrow();
    espia.mockRestore();
    expect(idiomaActual()).toBe('es');
  });

  it('si falla la carga de datos al iniciar, la app abre igual con el idioma del teléfono', async () => {
    const storage = TestBed.inject(StorageService);
    vi.spyOn(storage, 'cargar').mockRejectedValue(new Error('roto'));
    await expect(TestBed.inject(IdiomaService).iniciar('en-US')).resolves.toBeUndefined();
    expect(idiomaActual()).toBe('en');
  });
});
