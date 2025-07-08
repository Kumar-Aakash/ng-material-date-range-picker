/**
 * @(#)default-date-options.ts Sept 08, 2023
 *
 * @author Aakash Kumar
 */
import { DEFAULT_DATE_OPTION_ENUM } from './date-filter-enum';
import { ISelectDateOption } from '../model/select-date-option';
import { DATE_DEFAULT_OPTIONS_KEYS } from './date-default-options-keys.constant';

export const DEFAULT_DATE_OPTIONS: ISelectDateOption[] = <ISelectDateOption[]>[
  {
    optionLabel: 'Today',
    optionKey: DEFAULT_DATE_OPTION_ENUM.DATE_DIFF,
    dateKey: DATE_DEFAULT_OPTIONS_KEYS.TODAY,
    dateDiff: 0,
    isSelected: false,
    isVisible: true,
  },
  {
    optionLabel: 'Yesterday',
    optionKey: DEFAULT_DATE_OPTION_ENUM.SINGLE_DATE,
    dateKey: DATE_DEFAULT_OPTIONS_KEYS.YESTERDAY,
    dateDiff: -1,
    isSelected: false,
    isVisible: true,
  },
  {
    optionLabel: 'Last 7 Days',
    optionKey: DEFAULT_DATE_OPTION_ENUM.DATE_DIFF,
    dateKey: DATE_DEFAULT_OPTIONS_KEYS.LAST7DAYS,
    dateDiff: -6,
    isSelected: false,
    isVisible: true,
  },
  {
    optionLabel: 'Last 7 Days (Excl. Today)',
    optionKey: DEFAULT_DATE_OPTION_ENUM.DATE_DIFF,
    dateKey: DATE_DEFAULT_OPTIONS_KEYS.LAST7DAYSEXCLUDETODAY,
    dateDiff: -6,
    isSelected: false,
    isVisible: true,
    excludeToday: true,
  },
  {
    optionLabel: 'Last 30 Days (Excl. Today)',
    optionKey: DEFAULT_DATE_OPTION_ENUM.DATE_DIFF,
    dateKey: DATE_DEFAULT_OPTIONS_KEYS.LAST30DAYSEXCLUDETODAY,
    dateDiff: -29,
    isSelected: false,
    isVisible: true,
    excludeToday: true,
  },
  {
    optionLabel: 'Last 30 Days',
    optionKey: DEFAULT_DATE_OPTION_ENUM.DATE_DIFF,
    dateKey: DATE_DEFAULT_OPTIONS_KEYS.LAST30DAYS,
    dateDiff: -29,
    isSelected: false,
    isVisible: true,
  },
  {
    optionLabel: 'This Month',
    optionKey: DEFAULT_DATE_OPTION_ENUM.THIS_MONTH,
    dateKey: DATE_DEFAULT_OPTIONS_KEYS.THIS_MONTH,
    dateDiff: 0,
    isSelected: false,
    isVisible: true,
  },
  {
    optionLabel: 'Last Month',
    optionKey: DEFAULT_DATE_OPTION_ENUM.LAST_MONTH,
    dateKey: DATE_DEFAULT_OPTIONS_KEYS.LAST_MONTH,
    dateDiff: 0,
    isSelected: false,
    isVisible: true,
  },
  {
    optionLabel: 'Custom Range',
    optionKey: DEFAULT_DATE_OPTION_ENUM.CUSTOM,
    dateKey: DATE_DEFAULT_OPTIONS_KEYS.CUSTOM_RANGE,
    dateDiff: 0,
    isSelected: false,
    isVisible: true,
  },
];
