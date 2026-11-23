import { inject, isDevMode, provideAppInitializer } from '@angular/core';
import type { EnvironmentProviders } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';

import { IDIOMAS, IDIOMA_POR_DEFECTO } from './idioma';
import { IdiomaService } from './idioma.service';
import { CargadorTraducciones } from './transloco-loader';

export function provideIdiomas(): EnvironmentProviders[] {
  return [
    ...provideTransloco({
      config: {
        availableLangs: IDIOMAS,
        defaultLang: IDIOMA_POR_DEFECTO,
        fallbackLang: IDIOMA_POR_DEFECTO,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: { logMissingKey: isDevMode(), useFallbackTranslation: false, allowEmpty: false },
      },
      loader: CargadorTraducciones,
    }),
    provideAppInitializer(() => inject(IdiomaService).iniciar()),
  ];
}
