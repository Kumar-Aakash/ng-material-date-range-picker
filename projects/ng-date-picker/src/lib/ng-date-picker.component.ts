import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { DateRange } from '@angular/material/datepicker';
import moment from 'moment';

import { DEFAULT_DATE_OPTION_ENUM } from './constant/date-filter-enum';
import { DEFAULT_DATE_OPTIONS } from './data/default-date-options';
import { ISelectDateOption } from './model/select-date-option';
import { SelectedDateEvent } from '../public-api';
import { LocaleConfig } from './model/locale-config.model';
import { LocaleService } from './services/locale.service';

@Component({
  selector: 'ng-date-range-picker',
  templateUrl: './ng-date-picker.component.html',
  styleUrls: ['./ng-date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgDatePickerComponent implements OnInit, AfterViewInit {
  isDateOptionList: boolean = false;
  isCustomRange: boolean = true;
  isOpen: boolean = false;

  /** Set calendar locale settings */
  private _locale: LocaleConfig = {};
  @Input() set locale(value: LocaleConfig | undefined) {
    if (value) {
      this._locale = { ...this._localeService.config, ...value };
    }
  }
  /** Minimum selectable date */
  @Input() minDate!: Date;
  /** Maximum selectable date */
  @Input() maxDate!: Date;





  /** original inputs */
  @Input() inputLabel: string = 'Date Range';
  @Input() defaultOptionId = 'custom-options';
  @Input() calendarId: string = 'custom-calendar';
  @Input() enableDefaultOptions: boolean = true;
  @Input() selectedDates!: DateRange<Date>;
  @Input() dateFormat: string = 'yyyy-MM-dd';
  @Input() isShowStaticDefaultOptions: boolean = false;
  @Input() hideDefaultOptions: boolean = false;
  @Input() cdkConnectedOverlayOffsetX = 0;
  @Input() cdkConnectedOverlayOffsetY = 0;
  @Input() listCdkConnectedOverlayOffsetY = 0;
  @Input() listCdkConnectedOverlayOffsetX = 0;
  @Output() onDateSelectionChanged: EventEmitter<SelectedDateEvent>;
  @Output() dateListOptions: EventEmitter<ISelectDateOption[]>;

  private _dateDropDownOptions: ISelectDateOption[] = [];

  backdropClass = 'date-rage-picker-backdrop';

  constructor(
    private cdref: ChangeDetectorRef,
    private el: ElementRef,
    private renderer: Renderer2,
    private _localeService: LocaleService
  ) {
    this.onDateSelectionChanged = new EventEmitter<SelectedDateEvent>();
    this.dateListOptions = new EventEmitter<ISelectDateOption[]>();
  }

  @Input()
  set dateDropDownOptions(defaultDateList: ISelectDateOption[]) {
    if (this.enableDefaultOptions) {
      this._dateDropDownOptions =
        this.getClone<ISelectDateOption[]>(DEFAULT_DATE_OPTIONS).concat(
          defaultDateList
        );
    } else {
      this._dateDropDownOptions = defaultDateList;
    }
  }

  get dateDropDownOptions(): ISelectDateOption[] {
    return this._dateDropDownOptions ?? [];
  }

  ngOnInit(): void {
    if (!this._dateDropDownOptions.length && this.enableDefaultOptions) {
      this._dateDropDownOptions =
        this.getClone<ISelectDateOption[]>(DEFAULT_DATE_OPTIONS);
    }
    this.dateListOptions.emit(this.dateDropDownOptions);
  }

  ngAfterViewInit(): void {
    const selectedOptions: ISelectDateOption[] =
      this._dateDropDownOptions.filter((option) => option.isSelected);
    if (selectedOptions.length) {
      const input: HTMLInputElement =
        this.el.nativeElement.querySelector('#date-input-field');
      const dateRange: DateRange<Date> = selectedOptions[0].callBackFunction();
      if (dateRange && dateRange.start && dateRange.end) {
        this.updateSelectedDates(input, dateRange.start, dateRange.end);
      }
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
   * @param input HTMLInputElement
   * @param selectedDates DateRange<Date>
   */
  updateCustomRange(
    input: HTMLInputElement,
    selectedDates: DateRange<Date>
  ): void {
    this.updateSelectedDates(
      input,
      selectedDates.start ?? new Date(),
      selectedDates.end ?? new Date()
    );
  }

  /**
   * This method update the date on specified option.
   *
   * @param option ISelectDateOption
   * @param input HTMLInputElement
   */
  updateSelection(option: ISelectDateOption, input: HTMLInputElement): void {
    this.resetOptionSelection(option);

    this.isDateOptionList = false;
    if (option.optionKey !== DEFAULT_DATE_OPTION_ENUM.CUSTOM) {
      // this.isCustomRange = false;
      this.isOpen = false;
      this.updateDateOnOptionSelect(option, input);
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
   * @param input HTMLInputElement
   */
  private updateDateOnOptionSelect(
    option: ISelectDateOption,
    input: HTMLInputElement
  ): void {
    const currDate = new Date();
    let startDate: Date = new Date();
    let lastDate: Date = new Date();
    if (!!option.callBackFunction) {
      const dateRange: DateRange<Date> = option.callBackFunction();
      if (dateRange && dateRange.start && dateRange.end) {
        this.updateSelectedDates(input, dateRange.start, dateRange.end);
        return;
      }
    }

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

    this.updateSelectedDates(input, startDate, lastDate);
  }

  /**
   * This method updates dates on selection.
   *
   * @param input HTMLInputElement
   * @param startDate Date
   * @param endDate Date
   */
  private updateSelectedDates(
    input: HTMLInputElement,
    startDate: Date,
    endDate: Date
  ): void {
    this.selectedDates = new DateRange<Date>(startDate, endDate);
    input.value = this.getDateString(startDate) + ' - ' + this.getDateString(endDate);
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
}
