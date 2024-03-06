import { Injectable, Inject } from '@angular/core';

import { LocaleConfig } from '../model/locale-config.model';
import { DefaultLocaleConfig, LOCALE_CONFIG } from '../constant/locale-config.constant';


@Injectable()
export class LocaleService {
  constructor(@Inject(LOCALE_CONFIG) private _config: LocaleConfig) {
    // do nothing
  }

  get config(): LocaleConfig {
    if (!this._config) {
      return DefaultLocaleConfig;
    }

    return { ... DefaultLocaleConfig, ...this._config };
  }
}
