/**
 * @(#)default-date-options.ts Sept 08, 2023
 *
 * @author Aakash Kumar
 */
import { DEFAULT_DATE_OPTION_ENUM } from '../constant/date-filter-enum';
import { ISelectDateOption } from '../model/select-date-option';

export const DEFAULT_DATE_OPTIONS: ISelectDateOption[] = <ISelectDateOption[]>[
  {
    optionLabel: 'Today',
    optionKey: DEFAULT_DATE_OPTION_ENUM.DATE_DIFF,
    dateDiff: 0,
    isSelected: false,
    isVisible: true,
  },
  {
    optionLabel: 'Yesterday',
    optionKey: DEFAULT_DATE_OPTION_ENUM.SINGLE_DATE,
    dateDiff: -1,
    isSelected: false,
    isVisible: true,
  },
  {
    optionLabel: 'Last 7 Days',
    optionKey: DEFAULT_DATE_OPTION_ENUM.DATE_DIFF,
    dateDiff: -6,
    isSelected: false,
    isVisible: true,
  },
  {
    optionLabel: 'Last 30 Days',
    optionKey: DEFAULT_DATE_OPTION_ENUM.DATE_DIFF,
    dateDiff: -29,
    isSelected: false,
    isVisible: true,
  },
  {
    optionLabel: 'Last Month',
    optionKey: DEFAULT_DATE_OPTION_ENUM.LAST_MONTH,
    dateDiff: 0,
    isSelected: false,
    isVisible: true,
  },
  {
    optionLabel: 'This Month',
    optionKey: DEFAULT_DATE_OPTION_ENUM.THIS_MONTH,
    dateDiff: 0,
    isSelected: false,
    isVisible: true,
  },
  {
    optionLabel: 'Custom Range',
    optionKey: DEFAULT_DATE_OPTION_ENUM.CUSTOM,
    dateDiff: 0,
    isSelected: false,
    isVisible: true,
  },
];
