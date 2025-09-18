import { DateRange, MatCalendar } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { DATE_OPTION_TYPE } from '../constant/date-filter-const';
import { ISelectDateOption } from '../model/select-date-option.model';
import { ChangeDetectorRef } from '@angular/core';
import { ActiveDate } from '../model/active-date.model';

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
    (option) => option.optionType === DATE_OPTION_TYPE.CUSTOM
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
  key: DATE_OPTION_TYPE,
  dateDiff = 0,
  isVisible = true
): ISelectDateOption {
  return {
    optionLabel: label,
    optionType: key,
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
  return date;
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

/**
 * Overrides the `activeDate` setter for a MatCalendar instance, injecting custom handler logic
 * while preserving the original setter behavior. Useful for reacting to internal date navigation
 * events (e.g., month changes) in Angular Material's calendar.
 *
 * @param calendar - Instance of MatCalendar whose `activeDate` setter will be overridden.
 * @param cdref - ChangeDetectorRef to trigger view updates after the setter runs.
 * @param handler - Custom callback function executed whenever `activeDate` is set.
 */
export function overrideActiveDateSetter(
  calendar: MatCalendar<Date>,
  cdref: ChangeDetectorRef,
  handler: (date: ActiveDate) => void
): void {
  const proto = Object.getPrototypeOf(calendar);
  const descriptor = Object.getOwnPropertyDescriptor(proto, 'activeDate');

  if (!(descriptor?.set && descriptor?.get)) {
    console.warn(
      'overrideActiveDateSetter: activeDate setter/getter not found on MatCalendar prototype.'
    );
    return;
  }
  const originalSetter = descriptor.set;
  const originalGetter = descriptor.get;

  Object.defineProperty(calendar, 'activeDate', {
    configurable: true,
    enumerable: false,
    get() {
      return originalGetter.call(this);
    },

    set(value: Date) {
      const activeDate: ActiveDate = {
        previous: originalGetter.call(this) ?? value,
        current: value,
      };
      originalSetter.call(this, value);
      handler.call(this, activeDate);
      cdref.markForCheck();
    },
  });
}
