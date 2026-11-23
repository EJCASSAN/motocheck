import { diaMesCorto, formatoPlaca, mesAnio, miles } from './formato';

describe('formato', () => {
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
});
