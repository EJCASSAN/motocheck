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

/** Fecha local en formato YYYY-MM-DD (para inputs type="date"). */
export function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "YYYY-MM-DD" -> Date local (sin desfase de zona horaria). */
export function fechaLocal(fecha: string): Date {
  const [y, m, d] = fecha.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** "Octubre 2026" */
export function mesAnio(fecha: string): string {
  const d = fechaLocal(fecha);
  const mes = MESES[d.getMonth()];
  return `${mes[0].toUpperCase()}${mes.slice(1)} ${d.getFullYear()}`;
}

/** "15 oct" */
export function diaMesCorto(fecha: string): string {
  const d = fechaLocal(fecha);
  return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`;
}

/** "hace 2 días", "hoy", "ayer" */
export function haceCuanto(iso: string): string {
  const inicio = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dias = Math.round((inicio(new Date()) - inicio(new Date(iso))) / 86_400_000);
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 30) return `hace ${dias} días`;
  const meses = Math.round(dias / 30);
  return meses === 1 ? 'hace 1 mes' : `hace ${meses} meses`;
}

/** 34250 -> "34.250" */
export function miles(n: number): string {
  return Math.round(n).toLocaleString('es-CO');
}

/** "ABC12D" -> "ABC 12D" (así se ve en la placa física). */
export function formatoPlaca(placa: string): string {
  return placa.replace(/^([A-Z]{3})(\d)/, '$1 $2');
}
