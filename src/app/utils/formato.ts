const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

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

export function mesAnio(fecha: string): string {
  const d = fechaLocal(fecha);
  if (!esFechaValida(d)) return 'Sin fecha';
  const mes = MESES[d.getMonth()];
  return `${mes[0].toUpperCase()}${mes.slice(1)} ${d.getFullYear()}`;
}

export function diaMesCorto(fecha: string): string {
  const d = fechaLocal(fecha);
  if (!esFechaValida(d)) return 'Sin fecha';
  return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`;
}

export function haceCuanto(iso: string): string {
  const inicio = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dias = Math.round((inicio(new Date()) - inicio(new Date(iso))) / 86_400_000);
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 30) return `hace ${dias} días`;
  const meses = Math.round(dias / 30);
  return meses === 1 ? 'hace 1 mes' : `hace ${meses} meses`;
}

export function miles(n: number): string {
  return Math.round(n).toLocaleString('es-CO');
}

export function formatoPlaca(placa: string): string {
  return placa.replace(/^([A-Z]{3})(\d)/, '$1 $2');
}
