import { TestBed } from '@angular/core/testing';
import { InjectionToken } from '@angular/core';

import { LocaleService } from '@exogroup/ng-components/exo-date-range-picker/exo-material-date-range-picker/locale.service';
import {
  LocaleConfig,
} from '@exogroup/ng-components/exo-date-range-picker/exo-material-date-range-picker/exo-material-date-range-picker.component.spec';

// @ts-ignore
export const LOCALE_CONFIG = new InjectionToken<LocaleConfig>(undefined);

describe('LocaleService', () => {
  let localeService: LocaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LOCALE_CONFIG, useValue: {} },
        { provide: LocaleService, useClass: LocaleService, deps: [LOCALE_CONFIG] },
      ],
    });

    localeService = TestBed.inject(LocaleService);
  });

  it('should be create', () => {
    expect(localeService).toBeTruthy();
  });

  it('should get the default configs', () => {
    // @ts-ignore
    const local = new LocaleService(undefined);
    const result = local.config;

    expect(result).toBeDefined();
  });
});
