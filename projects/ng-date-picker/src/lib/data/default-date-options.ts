/**
 * @(#)default-date-options.ts Sept 08, 2023
 *
 * @author Aakash Kumar
 */
import { DEFAULT_DATE_OPTION_ENUM } from '../constant/date-filter-enum';
import { ISelectDateOption } from '../model/select-date-option';
import { createOption } from '../utils/date-picker-utilities';

export const DEFAULT_DATE_OPTIONS: ISelectDateOption[] = <ISelectDateOption[]>[
  createOption('Today', DEFAULT_DATE_OPTION_ENUM.DATE_DIFF, 0),
  createOption('Yesterday', DEFAULT_DATE_OPTION_ENUM.DATE_DIFF, -1),
  createOption('Last 7 Days', DEFAULT_DATE_OPTION_ENUM.DATE_DIFF, -7),
  createOption('Last 30 Days', DEFAULT_DATE_OPTION_ENUM.DATE_DIFF, -30),
  createOption('Last Month', DEFAULT_DATE_OPTION_ENUM.LAST_MONTH),
  createOption('This Month', DEFAULT_DATE_OPTION_ENUM.THIS_MONTH),
  createOption('Month To Date', DEFAULT_DATE_OPTION_ENUM.MONTH_TO_DATE),
  createOption('Week To Date', DEFAULT_DATE_OPTION_ENUM.WEEK_TO_DATE, 0, false),
  createOption('Year To Date', DEFAULT_DATE_OPTION_ENUM.YEAR_TO_DATE),
  createOption('Custom Range', DEFAULT_DATE_OPTION_ENUM.CUSTOM),
];
