import { InjectionToken } from '@angular/core';
import moment from 'moment';

import { LocaleConfig } from '../model/locale-config.model';

/**
 *  DefaultLocaleConfig
 */
export const DefaultLocaleConfig: LocaleConfig = {
  direction: 'ltr',
  separator: ' - ',
  weekLabel: 'W',
  applyLabel: 'Apply',
  cancelLabel: 'Cancel',
  clearLabel: 'Clear',
  customRangeLabel: 'Custom range',
  daysOfWeek: [ 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su' ],
  monthNames: moment.monthsShort(),
  firstDay: 1,
};

export const LOCALE_CONFIG = new InjectionToken<LocaleConfig>('daterangepicker.config');
