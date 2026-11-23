import { Injectable } from '@angular/core';
import type { Translation, TranslocoLoader } from '@jsverse/transloco';
import { of } from 'rxjs';
import type { Observable } from 'rxjs';

import en from './en.json';
import es from './es.json';
import { IDIOMA_POR_DEFECTO, esIdioma } from './idioma';
import type { Idioma } from './idioma';

export const TRADUCCIONES: Record<Idioma, Translation> = { es, en };

@Injectable({ providedIn: 'root' })
export class CargadorTraducciones implements TranslocoLoader {
  getTranslation(idioma: string): Observable<Translation> {
    return of(TRADUCCIONES[esIdioma(idioma) ? idioma : IDIOMA_POR_DEFECTO]);
  }
}
