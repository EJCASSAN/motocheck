import { signal } from '@angular/core';
import { translate } from '@jsverse/transloco';

export type Idioma = 'es' | 'en';

type Parametros = Record<string, unknown>;

export const IDIOMAS: Idioma[] = ['es', 'en'];

export const IDIOMA_POR_DEFECTO: Idioma = 'es';

const LOCALES: Record<Idioma, string> = { es: 'es-CO', en: 'en-US' };

export const idiomaActual = signal<Idioma>(IDIOMA_POR_DEFECTO);

export function localeActual(): string {
  return LOCALES[idiomaActual()];
}

export function esIdioma(valor: unknown): valor is Idioma {
  return IDIOMAS.includes(valor as Idioma);
}

export function idiomaOpcional(valor: unknown): { idioma?: Idioma } {
  return esIdioma(valor) ? { idioma: valor } : {};
}

export function detectarIdioma(idiomaTelefono: string | undefined): Idioma {
  const codigo = idiomaTelefono?.toLowerCase().slice(0, 2);
  return esIdioma(codigo) ? codigo : IDIOMA_POR_DEFECTO;
}

export function t(clave: string, params?: Parametros): string {
  return translate(clave, params, idiomaActual());
}

export function tPlural(n: number, clave: string, params?: Parametros): string {
  return t(`${clave}.${n === 1 ? 'uno' : 'varios'}`, { n, ...params });
}
