import { TestBed } from '@angular/core/testing';
import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';

import { IDIOMAS, IDIOMA_POR_DEFECTO, idiomaActual } from './idioma';
import type { Idioma } from './idioma';
import { TRADUCCIONES } from './transloco-loader';

export function configurarIdiomasDePrueba(): void {
  TestBed.configureTestingModule({
    imports: [
      TranslocoTestingModule.forRoot({
        langs: TRADUCCIONES,
        translocoConfig: { availableLangs: IDIOMAS, defaultLang: IDIOMA_POR_DEFECTO, reRenderOnLangChange: true },
        preloadLangs: true,
      }),
    ],
  });
  idiomaActual.set(IDIOMA_POR_DEFECTO);
}

export function usarIdioma(idioma: Idioma): void {
  TestBed.inject(TranslocoService).setActiveLang(idioma);
  idiomaActual.set(idioma);
}
