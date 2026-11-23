import { usarIdioma } from '../i18n/testing';
import type { AlertaMantenimiento } from '../models/motocheck.models';

import { textoAviso } from './avisos.service';

const vencido: AlertaMantenimiento = {
  tipo: 'aceite',
  kmRecorridos: 3120,
  intervaloKm: 3000,
  kmRestantes: -120,
  porcentajeUso: 104,
  estado: 'vencido',
};

describe('textoAviso', () => {
  it('notificación en español', () => {
    usarIdioma('es');
    expect(textoAviso(vencido)).toEqual({
      title: 'Aceite de motor: vencido',
      body: 'Te pasaste 120 km del intervalo.',
    });
  });

  it('notificación en inglés', () => {
    usarIdioma('en');
    expect(textoAviso(vencido)).toEqual({ title: 'Engine oil: overdue', body: 'You are 120 km past the interval.' });
    expect(textoAviso({ ...vencido, tipo: 'cadena', kmRestantes: 650, estado: 'proximo' })).toEqual({
      title: 'Chain tension: due soon',
      body: '650 km left until the next service.',
    });
  });
});
