import { DEFAULT_DATE_OPTION_ENUM } from '../constant/date-filter-enum';

/**
 * @(#)select-date-option.ts Sept 08, 2023
 *
 * @author Aakash Kumar
 */
export interface ISelectDateOption {
  // Label displayed in drop-down list for selection.
  optionLabel: string;

  // Used to check normal date or special date.
  optionKey: DEFAULT_DATE_OPTION_ENUM;

  // Actual date difference.
  // positive number indicates date forward from today.
  // negative number indicates date backward from today.
  dateDiff: number;

  // boolean value used to show active or inactive selection.
  isSelected: boolean;

  // boolean value used to show or hide label in list.
  isVisible: boolean;
}

export class SelectDateOption implements ISelectDateOption {
  optionLabel = '';
  optionKey = DEFAULT_DATE_OPTION_ENUM.DATE_DIFF;
  dateDiff = 0;
  isSelected = false;
  isVisible = false;
}
