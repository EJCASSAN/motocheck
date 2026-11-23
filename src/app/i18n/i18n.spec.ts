import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslocoPipe } from '@jsverse/transloco';

import en from './en.json';
import es from './es.json';
import { detectarIdioma, t, tPlural } from './idioma';
import { usarIdioma } from './testing';

function claves(objeto: object, prefijo = ''): Map<string, unknown> {
  const salida = new Map<string, unknown>();
  for (const [clave, valor] of Object.entries(objeto)) {
    const ruta = prefijo + clave;
    if (valor && typeof valor === 'object') claves(valor, ruta + '.').forEach((v, k) => salida.set(k, v));
    else salida.set(ruta, valor);
  }
  return salida;
}

@Component({ selector: 'app-prueba', template: `{{ 'tabs.inicio' | transloco }}`, imports: [TranslocoPipe] })
class PruebaComponent {}

describe('Traducciones', () => {
  it('es y en tienen exactamente las mismas claves y ninguna vacía', () => {
    const enEs = claves(es);
    const enEn = claves(en);
    const faltanEnIngles = [...enEs.keys()].filter((k) => !enEn.has(k));
    const sobranEnIngles = [...enEn.keys()].filter((k) => !enEs.has(k));
    const vacias = [...enEs, ...enEn].filter(([, v]) => typeof v !== 'string' || !v.trim()).map(([k]) => k);
    expect(faltanEnIngles).toEqual([]);
    expect(sobranEnIngles).toEqual([]);
    expect(vacias).toEqual([]);
  });

  it('el pipe muestra el texto del idioma activo y cambia al instante', () => {
    usarIdioma('es');
    const fixture = TestBed.createComponent(PruebaComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('Inicio');
    usarIdioma('en');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('Home');
  });

  it('elige singular o plural', () => {
    usarIdioma('es');
    expect(tPlural(1, 'checklist.pendientesAviso')).toBe('Revisa el punto pendiente antes de finalizar.');
    expect(tPlural(2, 'checklist.pendientesAviso')).toBe('Revisa los 2 puntos pendientes antes de finalizar.');
    usarIdioma('en');
    expect(tPlural(2, 'checklist.pendientesAviso')).toBe('Check the 2 pending points before finishing.');
    expect(tPlural(1, 'bitacora.invertido')).toBe('Spent · 1 service');
  });

  it('detecta el idioma del teléfono', () => {
    expect(detectarIdioma('en-US')).toBe('en');
    expect(detectarIdioma('EN')).toBe('en');
    expect(detectarIdioma('fr-FR')).toBe('es');
    expect(detectarIdioma(undefined)).toBe('es');
  });

  it('traduce textos con parámetros', () => {
    usarIdioma('en');
    expect(t('inicio.faltanKm', { km: '650' })).toBe('650 km left');
  });
});
