import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { DateRange } from '@angular/material/datepicker';
import moment from 'moment';

import { DEFAULT_DATE_OPTION_ENUM } from './constant/date-filter-enum';
import { DEFAULT_DATE_OPTIONS } from './constant/default-date-options';
import { ISelectDateOption } from './model/select-date-option';
import { SelectedDateEvent } from '../public-api';
import { FormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { LabelsConfig } from './model/labels-config.model';
import { DATE_DEFAULT_OPTIONS_KEYS } from './constant/date-default-options-keys.constant';

@Component({
  selector: 'ng-date-range-picker',
  templateUrl: './ng-date-picker.component.html',
  styleUrls: ['./ng-date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
  ],
})
export class NgDatePickerComponent implements OnInit {
  isDateOptionList: boolean = false;
  isCustomRange: boolean = true;
  isOpen: boolean = false;

  /** Set calendar locale settings */
  private _locale!: string;
  private _dateDropDownOptions: ISelectDateOption[] = [];
  private _defaultOptionsInUse: boolean = false;
  private _startDate!: Date;
  private _endDate!: Date;
  private _timezone!: string;
  private baseDate: Date = new Date();
  selectedDates!: DateRange<Date>;

  backdropClass = 'date-rage-picker-backdrop';
  date = new FormControl();

  @Input() set locale(value: string | undefined) {
    if (value) {
      this._locale = value;
      this.setLocale(this._locale);
    }
  }
  /** Labels */
  @Input() labels!: LabelsConfig | undefined;
  /** Show labels on input instead of the date range selected */
  @Input() showRangeLabelOnInput: boolean = true;
  /** Minimum selectable date */
  @Input() minDate!: Date;
  /** Maximum selectable date */
  @Input() maxDate!: Date;
  /** Start date for range picker */
  @Input() set startDate(startDate: moment.Moment | undefined) {
    if (startDate) {
      this._startDate = startDate.toDate();
      this.updateDefaultDates();
    }
  }
  /** End date for range picker */
  @Input() set endDate(endDate: moment.Moment | undefined) {
    if (endDate) {
      this._endDate = endDate.toDate();
      this.updateDefaultDates();
    }
  }
  /** Set date range options */
  @Input() set dateDropDownOptions(defaultDateList: ISelectDateOption[]) {
    if (defaultDateList && defaultDateList.length) {
      this._dateDropDownOptions = defaultDateList;
    }
  }
  get dateDropDownOptions(): ISelectDateOption[] {
    return this._dateDropDownOptions ?? [];
  }
  /** Toggle visibility for date range options */
  @Input() showDefaultOptions: boolean = true;
  /** Set default timezone */
  @Input() set timezone(timezone: string | undefined) {
    if (timezone) {
      this._timezone = timezone;
      this.baseDate = moment(new Date().toLocaleString('en', { timeZone: timezone })).toDate();
    }
  }
  get timezone(): string | undefined {
    return this._timezone;
  }

  // resetDates
  // labels
  // timezone
  // isFullWidth
  // openAfterViewInit

  /** original inputs */

  @Input() dateFormat: string = 'yyyy-MM-dd';
  @Input() cdkConnectedOverlayOffsetX = 0;
  @Input() cdkConnectedOverlayOffsetY = 0;
  @Input() listCdkConnectedOverlayOffsetY = 0;
  @Input() listCdkConnectedOverlayOffsetX = 0;
  @Output() onDateSelectionChanged: EventEmitter<SelectedDateEvent>;
  @Output() dateListOptions: EventEmitter<ISelectDateOption[]>;

  constructor(
    private cdref: ChangeDetectorRef,
    private _adapter: DateAdapter<any>,
  ) {
    this.onDateSelectionChanged = new EventEmitter<SelectedDateEvent>();
    this.dateListOptions = new EventEmitter<ISelectDateOption[]>();
  }

  ngOnInit(): void {
    if (!this._dateDropDownOptions.length && this.showDefaultOptions) {
      this._dateDropDownOptions = this.getClone<ISelectDateOption[]>(DEFAULT_DATE_OPTIONS);
      this._defaultOptionsInUse = true;
    }
    this.calculateLabel();
    this.dateListOptions.emit(this.dateDropDownOptions);
  }

  setLocale(locale: string): void {
    this._adapter.setLocale(locale);
  }

  updateDefaultDates() {
    if (this._startDate) {
      let endDate = this.getBaseDate();
      if (this._endDate) {
        endDate = this._endDate;
      }

      this.selectedDates = new DateRange(this._startDate, endDate);
    }
  }

  /**
   * This method toggles the visibility of default date option's List.
   */
  toggleDateOptionSelectionList(): void {
    this.isOpen = !this.isOpen;
  }

  /**
   * This method updates the date range on button click.
   *
   * @param selectedDates DateRange<Date>
   */
  updateCustomRange(
    selectedDates: DateRange<Date>
  ): void {
    this.updateSelectedDates(
      selectedDates.start ?? this.getBaseDate(),
      selectedDates.end ?? this.getBaseDate()
    );
  }

  /**
   * This method update the date on specified option.
   *
   * @param option ISelectDateOption
   */
  updateSelection(option: ISelectDateOption): void {
    this.resetOptionSelection(option);

    this.isDateOptionList = false;
    if (option.optionKey !== DEFAULT_DATE_OPTION_ENUM.CUSTOM) {
      // this.isCustomRange = false;
      this.isOpen = false;
      this.updateDateOnOptionSelect(option);
    } else {
      this.isOpen = true;
      this.isCustomRange = true;
    }
  }

  /**
   * This method toggles the custom date range selection view.
   */
  toggleCustomDateRangeView(): void {
    this.isCustomRange = !this.isCustomRange;
  }

  /**
   * This method sets clicked element as selected.
   * @param option ISelectDateOption
   */
  private resetOptionSelection(option: ISelectDateOption): void {
    this.dateDropDownOptions.forEach((option) => (option.isSelected = false));
    option.isSelected = true;
  }

  /**
   * This method update date if specified option is not custom range.
   *
   * @param option ISelectDateOption
   */
  private updateDateOnOptionSelect(option: ISelectDateOption): void {
    if (!!option.callBackFunction) {
      const dateRange: DateRange<Date> = option.callBackFunction();
      if (dateRange && dateRange.start && dateRange.end) {
        this.updateSelectedDates(dateRange.start, dateRange.end, option.optionLabel);
        return;
      }
    }

    const dates = this.calculateStartAndEndDateByType(option);

    this.updateSelectedDates(dates.start, dates.end, option.optionLabel);
  }

  /**
   * This method updates dates on selection.
   *
   * @param startDate Date
   *
   * @param endDate Date
   *
   * @param rangeLabel string
   */
  private updateSelectedDates(startDate: Date, endDate: Date, rangeLabel: string = ''): void {
    this.selectedDates = new DateRange<Date>(startDate, endDate);

    if (this.showRangeLabelOnInput && rangeLabel) {
      this.date.setValue(rangeLabel);
    } else {
      this.date.setValue(this.getDateString(startDate) + ' - ' + this.getDateString(endDate));
    }

    const selectedOption = this.dateDropDownOptions.filter(
      (option) => option.isSelected
    )[0];
    const selectedDateEventData: SelectedDateEvent = {
      range: this.selectedDates,
      selectedOption: selectedOption,
    };
    this.onDateSelectionChanged.emit(selectedDateEventData);
    this.cdref.markForCheck();
  }

  /**
   * This method converts the given date into specified string format.
   *
   * @param date Date
   * @returns formatted date.
   */
  private getDateString(date: Date): string {
    const datePipe = new DatePipe('en');
    return datePipe.transform(date, this.dateFormat) ?? '';
  }

  /**
   * This method return the number of days in moth on specified date.
   *
   * @param date Date
   * @returns number
   */
  private getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  /**
   * This method clone the data.
   *
   * @param data T
   * @returns T
   */
  private getClone<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
  }

  /**
   * Calculate possible label range
   */
  private calculateLabel(): void {
    const dateOptionsLength = this._dateDropDownOptions.length;

    let calculatedLabel = '';

    for (let i = 0; i < dateOptionsLength; i++) {

      if (this.labels && this._defaultOptionsInUse) {

        // update the label with the translations
        let optionLabel: string | undefined = '';

        switch (this._dateDropDownOptions[i].dateKey) {
          case DATE_DEFAULT_OPTIONS_KEYS.TODAY:
            optionLabel = this.labels.todayLabel;
            break;
          case DATE_DEFAULT_OPTIONS_KEYS.YESTERDAY:
            optionLabel = this.labels.yesterdayLabel;
            break;
          case DATE_DEFAULT_OPTIONS_KEYS.LAST7DAYS:
            optionLabel = this.labels.last7daysLabel;
            break;
          case DATE_DEFAULT_OPTIONS_KEYS.LAST30DAYS:
            optionLabel = this.labels.last30daysLabel;
            break;
          case DATE_DEFAULT_OPTIONS_KEYS.THIS_MONTH:
            optionLabel = this.labels.thisMonthLabel;
            break;
          case DATE_DEFAULT_OPTIONS_KEYS.LAST_MONTH:
            optionLabel = this.labels.lastMonthLabel;
            break;
          case DATE_DEFAULT_OPTIONS_KEYS.CUSTOM_RANGE:
            optionLabel = this.labels.customRangeLabel;
            break;
          default:
            break;
        }

        if (optionLabel) {
          this._dateDropDownOptions[i].optionLabel = optionLabel;
        }
      }

      // if we have a calculated label, doesn't need to do anything else for the next ones
      // don't use break because of the previous if where we are setting the translations for the labels
      if (calculatedLabel) {
        continue;
      }

      const dates = this.calculateStartAndEndDateByType(this._dateDropDownOptions[i]);

      if (
        dates.start.toDateString() === this.selectedDates.start?.toDateString() &&
        dates.end.toDateString() === this.selectedDates.end?.toDateString()
      ) {
        calculatedLabel = this._dateDropDownOptions[i].optionLabel;
        this._dateDropDownOptions[i].isSelected = true;
      }
    }

    if (calculatedLabel) {
      this.date.setValue(calculatedLabel);
    }
  }

  private getBaseDate(): Date {
    return new Date(this.baseDate.valueOf());
  }

  /**
   * Calculate start date and end date per date option
   *
   * @param option
   */
  private calculateStartAndEndDateByType(option: ISelectDateOption): { start: Date, end: Date } {
    const currDate: Date = this.getBaseDate();
    let startDate: Date = this.getBaseDate();
    let lastDate: Date = this.getBaseDate();

    switch (option.optionKey) {
      case DEFAULT_DATE_OPTION_ENUM.DATE_DIFF:
        startDate.setDate(startDate.getDate() + option.dateDiff);
        break;
      case DEFAULT_DATE_OPTION_ENUM.LAST_MONTH:
        startDate = new Date(currDate.getFullYear(), currDate.getMonth() - 1, 1);
        const lastDayMonth = this.getDaysInMonth(startDate);
        lastDate = new Date(currDate.getFullYear(), currDate.getMonth() - 1, lastDayMonth);
        break;
      case DEFAULT_DATE_OPTION_ENUM.THIS_MONTH:
        startDate = new Date(currDate.getFullYear(), currDate.getMonth(), 1);
        lastDate = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate());
        break;
      case DEFAULT_DATE_OPTION_ENUM.YEAR_TO_DATE:
        startDate = new Date(currDate.getFullYear(), 0, 1);
        break;
      case DEFAULT_DATE_OPTION_ENUM.MONTH_TO_DATE:
        startDate = new Date(currDate.getFullYear(), currDate.getMonth(), 1);
        break;
      case DEFAULT_DATE_OPTION_ENUM.SINGLE_DATE:
      default:
        startDate.setDate(startDate.getDate() + option.dateDiff);
        lastDate.setDate(startDate.getDate());
        break;
    }

    return { start: startDate, end: lastDate };
  }
}
