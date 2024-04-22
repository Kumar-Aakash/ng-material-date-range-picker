import moment from 'moment';
import { DatePickerConstant } from '../constants/date-picker.constant';

export abstract class DateTimeParser {

  private static readonly defaultFormat = 'YYYY-MM-DD';

  /**
   * return default date format
   *
   * @param date
   */
  static defaultMomentFormat(date: moment.MomentInput = this.getBaseDate()): moment.Moment {
    return moment(date, this.defaultFormat);
  }

  /**
   * Add a certain amount of units to a date and return the result formatted using the default format
   *
   * @param date
   *
   * @param amount
   *
   * @param unit
   */
  static add(date: moment.MomentInput, amount: number, unit: moment.unitOfTime.DurationConstructor): string {
    return this.defaultMomentFormat(date).add(amount, unit).format(this.defaultFormat);
  }

  /**
   * Calculates the difference between 2 dates using the given unit
   *
   * @param dateFrom
   *
   * @param dateTo
   *
   * @param unit
   */
  static difference(dateFrom: moment.MomentInput, dateTo: moment.MomentInput, unit: moment.unitOfTime.DurationConstructor): number {
    return moment(dateTo).
      diff(moment(dateFrom), unit);
  }

  /**
   * Get first day of month formatted using the default format
   *
   * @param date
   */
  static firstDayOfMonth(date: moment.MomentInput): string {
    return this.format(this.defaultMomentFormat(date).startOf('month'));
  }

  /**
   * Get start of month
   *
   * @param date
   */
  static startOfMonth(date: moment.MomentInput): string {
    return this.format(this.defaultMomentFormat(date).startOf('month'));
  }

  /**
   * Get start of day
   *
   * @param date
   */
  static startOfDay(date: moment.MomentInput): string {
    return this.format(this.defaultMomentFormat(date).startOf('day'));
  }

  /**
   * Get first day of a given quarter, formatted using the default format
   *
   * @param quarter
   *
   * @param year
   */
  static firstDayOfQuarter(quarter: number, year = this.format(this.getBaseDate(), 'YYYY')): string {
    const firstDayOfQuarter = moment(year, 'YYYY').quarter(quarter).startOf('quarter');
    return this.format(firstDayOfQuarter);
  }

  /**
   * Format a date using a given format
   *
   * @param date
   *
   * @param format
   *
   * @param locale
   */
  static format(date: moment.MomentInput, format?: string, locale?: string): string {
    return moment(date).locale(locale || DatePickerConstant.defaultLanguage).format(format || this.defaultFormat);
  }

  /**
   * Get the date of New York's timezone
   *
   * @param timeZone
   */
  static getBaseDate(timeZone = DatePickerConstant.timezone.newYork): moment.Moment {
    return moment(new Date().toLocaleString(
      DatePickerConstant.defaultLanguage,
      { timeZone }),
    DatePickerConstant.usInputDateFormat);
  }

  /**
   * Get amount of days of a given date
   *
   * @param date
   */
  static getDaysOfMonth(date: moment.MomentInput): string {
    return moment(date).format('DD');
  }

  /**
   * Get amount of hours of a given date
   *
   * @param date
   */
  static getHours(date: moment.MomentInput): number {
    return +moment(date).format('H');
  }

  /**
   * Get amount of hours of a given date as an array
   *
   * @param date
   */
  static getHoursAsArray(date: moment.MomentInput): number[] {
    const hours = DateTimeParser.getHours(date);
    const hoursConsideringCurrentHour = hours + 1;
    return date && hoursConsideringCurrentHour >= 0 ? Array.from(Array(hoursConsideringCurrentHour), (_, hour) => hour) : [];
  }

  /**
   * Get amount of minutes of a given date
   *
   * @param date
   */
  static getMinutes(date: moment.MomentInput): string {
    return moment(date).format('mm');
  }

  /**
   * Get last day of a given quarter, formatted using the default format
   *
   * @param quarter
   *
   * @param year
   */
  static lastDayOfQuarter(quarter: number, year = this.format(this.getBaseDate(), 'YYYY')): string {
    const lastDayOfQuarter = moment(year, 'YYYY').quarter(quarter).endOf('quarter');
    return this.format(lastDayOfQuarter);
  }

  /**
   * Get the last day of a given month
   *
   * @param date
   */
  static lastDayOfMonth(date: moment.MomentInput): string {
    return this.format(this.defaultMomentFormat(date).endOf('month'));
  }

  /**
   * Subtract a certain amount of units to a date and return the result formatted using the default format
   *
   * @param date
   *
   * @param amount
   *
   * @param unit
   */
  static subtract(date: moment.MomentInput, amount: number, unit: moment.unitOfTime.DurationConstructor): string {
    return this.defaultMomentFormat(date).subtract(amount, unit).format(this.defaultFormat);
  }

  /**
   * Get today's date formatted using the default format
   */
  static today(): string {
    return this.format(this.getBaseDate());
  }

  /**
   * Get the current quarter formatted using the default format
   */
  static quarter(): number {
    return this.getBaseDate().quarter();
  }

  /**
   * Get yesterday's date formatted using the default format
   */
  static yesterday(): string {
    return this.subtract(this.getBaseDate(), 1, 'day');
  }
}
