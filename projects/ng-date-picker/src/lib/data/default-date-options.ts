/**
 * @(#)default-date-options.ts Sept 08, 2023
 *
 * @author Aakash Kumar
 */
import { DATE_OPTION_TYPE } from '../constant/date-filter-const';
import { ISelectDateOption } from '../model/select-date-option.model';
import { createOption } from '../utils/date-picker-utilities';

export const DEFAULT_DATE_OPTIONS: ISelectDateOption[] = <ISelectDateOption[]>[
  createOption('Today', DATE_OPTION_TYPE.DATE_DIFF, 0),
  createOption('Yesterday', DATE_OPTION_TYPE.DATE_DIFF, -1),
  createOption('Last 7 Days', DATE_OPTION_TYPE.DATE_DIFF, -7),
  createOption('Last 30 Days', DATE_OPTION_TYPE.DATE_DIFF, -30),
  createOption('Last Month', DATE_OPTION_TYPE.LAST_MONTH),
  createOption('This Month', DATE_OPTION_TYPE.THIS_MONTH),
  createOption('Month To Date', DATE_OPTION_TYPE.MONTH_TO_DATE),
  createOption('Week To Date', DATE_OPTION_TYPE.WEEK_TO_DATE, 0, false),
  createOption('Year To Date', DATE_OPTION_TYPE.YEAR_TO_DATE),
  createOption('Custom Range', DATE_OPTION_TYPE.CUSTOM),
];
