import { DateRange } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { DEFAULT_DATE_OPTION_ENUM } from '../constant/date-filter-enum';
import { ISelectDateOption } from './../model/select-date-option';

/**
 * Resets the selection state for all options
 * and marks the given option as selected if provided.
 *
 * @param options - List of date options
 * @param selectedOption - Option to be marked as selected
 */
export function resetOptionSelection(
  options: ISelectDateOption[],
  selectedOption?: ISelectDateOption
) {
  options.forEach((option) => (option.isSelected = false));
  if (selectedOption) {
    selectedOption.isSelected = true;
  }
}

/**
 * Marks the custom date option as selected.
 *
 * @param options - List of date options
 */
export function selectCustomOption(options: ISelectDateOption[]): void {
  const customOption = options.find(
    (option) => option.optionKey === DEFAULT_DATE_OPTION_ENUM.CUSTOM
  );
  if (customOption) customOption.isSelected = true;
}

/**
 * Returns a new date with the given year offset applied.
 *
 * @param offset - Number of years to add (negative for past years)
 * @returns Date object with updated year
 */
export function getDateWithOffset(offset: number) {
  const date = new Date();
  date.setFullYear(date.getFullYear() + offset);
  return date;
}

/**
 * Creates a deep clone of the provided object or array.
 *
 * @param data - Data to be cloned
 * @returns A deep copy of the data
 */
export function getClone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Formats a date object into a string using Angular DatePipe.
 *
 * @param date - Date to be formatted
 * @param dateFormat - Desired date format (e.g., 'dd/MM/yyyy')
 * @returns Formatted date string
 */
export function getDateString(date: Date, dateFormat: string): string {
  const datePipe = new DatePipe('en');
  return datePipe.transform(date, dateFormat) ?? '';
}

/**
 * Formats a date range into a string with start and end dates.
 *
 * @param range - Date range with start and end
 * @param dateFormat - Desired date format
 * @returns Formatted range string (e.g., '01/01/2023 - 07/01/2023')
 */
export function getFormattedDateString(
  range: DateRange<Date>,
  dateFormat: string
) {
  if (!(range.start && range.end)) {
    return '';
  }
  return (
    getDateString(range.start, dateFormat) +
    ' - ' +
    getDateString(range.end, dateFormat)
  );
}

/**
 * Creates a standardized date option object for dropdowns.
 *
 * @param label - Display label for the option
 * @param key - Option key from DEFAULT_DATE_OPTION_ENUM
 * @param dateDiff - Offset in days from current date (default: 0)
 * @param isVisible - Whether the option is visible (default: true)
 * @returns ISelectDateOption object
 */
export function createOption(
  label: string,
  key: DEFAULT_DATE_OPTION_ENUM,
  dateDiff = 0,
  isVisible = true
): ISelectDateOption {
  return {
    optionLabel: label,
    optionKey: key,
    dateDiff,
    isSelected: false,
    isVisible,
  };
}

/**
 * Returns the date of the next month based on the given date.
 *
 * @param currDate - Current date
 * @returns A new Date object incremented by one month
 */
export function getDateOfNextMonth(currDate: Date): Date {
  const date = new Date(currDate);
  date.setMonth(currDate.getMonth() + 1);
  return currDate;
}

/**
 * Returns the first day of the month following the given date.
 *
 * @param currDate - The current date
 * @returns A Date object set to the first day of the next month
 */
export function getFirstDateOfNextMonth(currDate: Date): Date {
  return new Date(currDate.getFullYear(), currDate.getMonth() + 1, 1);
}

/**
 * Returns the number of days in the month of the given date.
 *
 * @param date The date to calculate the days for.
 * @returns Number of days in the month.
 */
export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}
