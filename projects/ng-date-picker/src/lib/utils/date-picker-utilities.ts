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

/** Escapes a string so it can be used as a literal inside a RegExp. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Returns true when both dates fall on the same calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Parses a date string against an Angular-style date format (the subset of
 * tokens `yyyy`, `yy`, `MM`, `M`, `dd`, `d`). Returns `null` if the string
 * does not match the format or is not a real calendar date (e.g. `31/02`).
 *
 * @param value - The user-entered date string.
 * @param format - The expected format, e.g. `dd/MM/yyyy`.
 * @returns The parsed Date, or `null` if it does not match.
 */
export function parseDateByFormat(value: string, format: string): Date | null {
  const tokens: string[] = [];
  const tokenRegex = /yyyy|yy|MM|M|dd|d/g;
  let pattern = '^';
  let lastIndex = 0;
  let token: RegExpExecArray | null;
  while ((token = tokenRegex.exec(format)) !== null) {
    pattern += escapeRegExp(format.slice(lastIndex, token.index));
    switch (token[0]) {
      case 'yyyy':
        pattern += '(\\d{4})';
        break;
      case 'yy':
        pattern += '(\\d{2})';
        break;
      case 'MM':
      case 'dd':
        pattern += '(\\d{2})';
        break;
      default: // 'M' or 'd'
        pattern += '(\\d{1,2})';
        break;
    }
    tokens.push(token[0]);
    lastIndex = token.index + token[0].length;
  }
  pattern += escapeRegExp(format.slice(lastIndex)) + '$';

  const match = new RegExp(pattern).exec(value.trim());
  if (!match) {
    return null;
  }

  let year = NaN;
  let month = NaN;
  let day = NaN;
  tokens.forEach((token, index) => {
    const part = parseInt(match[index + 1], 10);
    if (token.startsWith('y')) {
      year = token === 'yy' ? 2000 + part : part;
    } else if (token.startsWith('M')) {
      month = part - 1;
    } else {
      day = part;
    }
  });
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return null;
  }

  const date = new Date(year, month, day);
  // Reject overflow dates such as 31/02 that Date silently rolls over.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/**
 * Derives the relative date-math expressions (start/end) for a date option,
 * for display in editable inputs. Only day-diff options have a clean relative
 * form (e.g. `Last 7 Days` -> `now-7d` .. `now`); an explicit `startExpr` /
 * `endExpr` on the option overrides the derived value. Returns `null` when no
 * relative representation applies, so the caller falls back to absolute dates.
 *
 * @param option - The selected date option.
 * @returns `{ start, end }` expressions, or `null`.
 */
export function getRelativeExpr(
  option?: ISelectDateOption | null
): { start: string; end: string } | null {
  if (!option) {
    return null;
  }
  if (option.startExpr && option.endExpr) {
    return { start: option.startExpr, end: option.endExpr };
  }
  if (option.optionType !== DATE_OPTION_TYPE.DATE_DIFF) {
    return null;
  }
  const diff = option.dateDiff ?? 0;
  const start = diff === 0 ? 'now' : `now${diff > 0 ? '+' : ''}${diff}d`;
  return { start, end: 'now' };
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
 * Compares two dates by year, month, and day only (ignores time).
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns true if both dates fall on the same calendar day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Computes the expected DateRange for a given option, mirroring the
 * logic in updateDateWithSelectedOption. Used for auto-matching a
 * provided selectedDates against the available options list.
 *
 * Returns null for CUSTOM options and any unhandled types.
 *
 * @param option - The date option to compute a range for
 * @returns Computed DateRange, or null if not applicable
 */
export function computeOptionDateRange(
  option: ISelectDateOption
): DateRange<Date> | null {
  if (option.optionType === DATE_OPTION_TYPE.CUSTOM) {
    return null;
  }

  if (option.callBackFunction) {
    return option.callBackFunction();
  }

  const currDate = new Date();
  let startDate: Date = new Date();
  let lastDate: Date = new Date();

  switch (option.optionType) {
    case DATE_OPTION_TYPE.DATE_DIFF:
      startDate = new Date();
      startDate.setDate(startDate.getDate() + (option.dateDiff ?? 0));
      lastDate = new Date();
      break;

    case DATE_OPTION_TYPE.LAST_MONTH: {
      const lastMonth = new Date(currDate);
      lastMonth.setMonth(currDate.getMonth() - 1);
      startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      lastDate = new Date(
        lastMonth.getFullYear(),
        lastMonth.getMonth(),
        getDaysInMonth(lastMonth)
      );
      break;
    }

    case DATE_OPTION_TYPE.THIS_MONTH:
      startDate = new Date(currDate.getFullYear(), currDate.getMonth(), 1);
      lastDate = new Date(
        currDate.getFullYear(),
        currDate.getMonth(),
        getDaysInMonth(currDate)
      );
      break;

    case DATE_OPTION_TYPE.YEAR_TO_DATE:
      startDate = new Date(currDate.getFullYear(), 0, 1);
      lastDate = new Date();
      break;

    case DATE_OPTION_TYPE.MONTH_TO_DATE:
      startDate = new Date(currDate.getFullYear(), currDate.getMonth(), 1);
      lastDate = new Date();
      break;

    default:
      return null;
  }

  return new DateRange<Date>(startDate, lastDate);
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
