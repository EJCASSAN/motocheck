import { localeActual, t, tPlural } from '../i18n/idioma';

export function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function fechaLocal(fecha: string): Date {
  const [y, m, d] = fecha.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function esFechaValida(d: Date): boolean {
  return !Number.isNaN(d.getTime());
}

const formatosMes = new Map<string, Intl.DateTimeFormat>();
const formatosNumero = new Map<string, Intl.NumberFormat>();

function nombreMes(d: Date, estilo: 'long' | 'short'): string {
  const locale = localeActual();
  const clave = `${locale}|${estilo}`;
  if (!formatosMes.has(clave)) formatosMes.set(clave, new Intl.DateTimeFormat(locale, { month: estilo }));
  return formatosMes.get(clave)!.format(d).replace('.', '');
}

export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function mesAnio(fecha: string): string {
  const d = fechaLocal(fecha);
  if (!esFechaValida(d)) return t('fechas.sinFecha');
  return t('fechas.mesAnio', { mes: capitalizar(nombreMes(d, 'long')), anio: d.getFullYear() });
}

export function diaMesCorto(fecha: string): string {
  const d = fechaLocal(fecha);
  if (!esFechaValida(d)) return t('fechas.sinFecha');
  return t('fechas.diaMes', { dia: d.getDate(), mes: nombreMes(d, 'short') });
}

export function fechaLarga(fecha: string): string {
  const d = fechaLocal(fecha);
  if (!esFechaValida(d)) return t('fechas.sinFecha');
  return capitalizar(
    d.toLocaleDateString(localeActual(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  );
}

export function fechaCorta(iso: string): string {
  const d = new Date(iso);
  if (!esFechaValida(d)) return t('fechas.sinFecha');
  return d.toLocaleDateString(localeActual(), { day: 'numeric', month: 'short', year: 'numeric' });
}

export function hora(iso: string): string {
  const d = new Date(iso);
  if (!esFechaValida(d)) return t('fechas.sinFecha');
  return d.toLocaleTimeString(localeActual(), { hour: 'numeric', minute: '2-digit' });
}

export function haceCuanto(iso: string): string {
  const inicio = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dias = Math.round((inicio(new Date()) - inicio(new Date(iso))) / 86_400_000);
  if (Number.isNaN(dias)) return t('fechas.sinFecha');
  if (dias <= 0) return t('fechas.hoy');
  if (dias === 1) return t('fechas.ayer');
  if (dias < 30) return tPlural(dias, 'fechas.haceDias');
  return tPlural(Math.round(dias / 30), 'fechas.haceMeses');
}

export function miles(n: number): string {
  const locale = localeActual();
  if (!formatosNumero.has(locale))
    formatosNumero.set(locale, new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }));
  return formatosNumero.get(locale)!.format(Math.round(n));
}

export function formatoPlaca(placa: string): string {
  return placa.replace(/^([A-Z]{3})(\d)/, '$1 $2');
}
