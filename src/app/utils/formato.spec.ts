import { usarIdioma } from '../i18n/testing';

import { diaMesCorto, fechaLarga, formatoPlaca, haceCuanto, mesAnio, miles } from './formato';

describe('formato', () => {
  beforeEach(() => usarIdioma('es'));

  it('separa miles con punto', () => {
    expect(miles(34250)).toBe('34.250');
  });

  it('muestra la placa con espacio', () => {
    expect(formatoPlaca('ABC12D')).toBe('ABC 12D');
  });

  it('nombra el mes en español', () => {
    expect(mesAnio('2026-10-15')).toBe('Octubre 2026');
  });

  it('muestra "Sin fecha" para registros sin fecha válida', () => {
    expect(mesAnio('')).toBe('Sin fecha');
    expect(diaMesCorto('')).toBe('Sin fecha');
  });

  it('usa el formato del idioma activo', () => {
    expect(miles(34250)).toBe('34.250');
    expect(mesAnio('2026-10-15')).toBe('Octubre 2026');
    expect(diaMesCorto('2026-10-15')).toBe('15 oct');
    expect(fechaLarga('2026-10-15')).toBe('Jueves, 15 de octubre de 2026');
    usarIdioma('en');
    expect(miles(34250)).toBe('34,250');
    expect(mesAnio('2026-10-15')).toBe('October 2026');
    expect(diaMesCorto('2026-10-15')).toBe('Oct 15');
    expect(fechaLarga('2026-10-15')).toBe('Thursday, October 15, 2026');
    expect(mesAnio('')).toBe('No date');
  });

  it('dice hace cuánto en cada idioma', () => {
    const haceDosDias = new Date(Date.now() - 2 * 86_400_000).toISOString();
    expect(haceCuanto(haceDosDias)).toBe('hace 2 días');
    usarIdioma('en');
    expect(haceCuanto(haceDosDias)).toBe('2 days ago');
    expect(haceCuanto(new Date().toISOString())).toBe('today');
  });
});
