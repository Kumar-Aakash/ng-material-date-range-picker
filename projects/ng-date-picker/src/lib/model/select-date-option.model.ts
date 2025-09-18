import { DateRange } from '@angular/material/datepicker';
import { DATE_OPTION_TYPE } from '../constant/date-filter-const';

/**
 * @(#)select-date-option.ts Sept 08, 2023
 *
 * Defines the structure and behavior of a selectable date option,
 * used in date filtering components.
 *
 * @author Aakash Kumar
 */
export interface ISelectDateOption {
  /**
   * Label displayed in the drop-down list for this option.
   * Example: "Last 7 Days", "Today", "Custom".
   */
  optionLabel: string;

  /**
   * Type of the option, indicating how the date is determined.
   * Defaults to DATE_DIFF if not provided.
   */
  optionType?: DATE_OPTION_TYPE;

  /**
   * Number of days offset from today.
   *
   * - Positive numbers indicate future dates.
   * - Negative numbers indicate past dates.
   * - Used only when optionType is DATE_DIFF and no callback is provided.
   *
   * Example: -7 → "Last 7 Days"
   */
  dateDiff?: number;

  /**
   * Whether this option is currently selected.
   */
  isSelected: boolean;

  /**
   * Whether this option should be shown in the drop-down list.
   */
  isVisible: boolean;

  /**
   * Custom function to calculate and return a DateRange.
   * Used when optionType requires special handling beyond dateDiff.
   */
  callBackFunction?: () => DateRange<Date>;
}

/**
 * Default implementation of a selectable date option.
 * Provides default values for all fields.
 */
export class SelectDateOption implements ISelectDateOption {
  optionLabel = '';
  optionType = DATE_OPTION_TYPE.DATE_DIFF;
  dateDiff = 0;
  isSelected = false;
  isVisible = false;
  callBackFunction!: () => DateRange<Date>;
}
