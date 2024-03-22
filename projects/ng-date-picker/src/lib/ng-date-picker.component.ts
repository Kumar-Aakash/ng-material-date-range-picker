/**
 * @(#)ng-date-picker.component.ts Sept 05, 2023
 *
 * @author Aakash Kumar
 */
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
  } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DateRange } from '@angular/material/datepicker';
import { DEFAULT_DATE_OPTION_ENUM } from './constant/date-filter-enum';
import { DEFAULT_DATE_OPTIONS } from './data/default-date-options';
import { ISelectDateOption } from './model/select-date-option';
import { SelectedDateEvent } from '../public-api';

@Component({
  selector: 'ng-date-range-picker',
  templateUrl: './ng-date-picker.component.html',
  styleUrls: ['./ng-date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgDatePickerComponent implements OnInit, AfterViewInit {
  isDateOptionList: boolean = false;
  isCustomRange: boolean = false;
  @Input() inputLabel: string = 'Date Range';
  @Input() defaultOptionId = 'custom-options';
  @Input() calendarId: string = 'custom-calendar';
  @Input() enableDefaultOptions: boolean = true;
  @Input() selectedDates!: DateRange<Date>;
  @Input() dateFormat: string = 'dd/MM/yyyy';
  @Input() isShowStaticDefaultOptions: boolean = false;
  @Input() hideDefaultOptions: boolean = false;
  @Input() cdkConnectedOverlayOffsetX = 0;
  @Input() cdkConnectedOverlayOffsetY = 0;
  @Input() listCdkConnectedOverlayOffsetY = 0;
  @Input() listCdkConnectedOverlayOffsetX = 0;

  // default min date is current date - 10 years.
  @Input() minDate =  new Date(new Date().setFullYear(new Date().getFullYear() - 10));

  // default max date is current date - 10 years.
  @Input() maxDate =  new Date(new Date().setFullYear(new Date().getFullYear() + 10));

  @Output() onDateSelectionChanged: EventEmitter<SelectedDateEvent>;
  @Output() dateListOptions: EventEmitter<ISelectDateOption[]>;

  private _dateDropDownOptions: ISelectDateOption[] = [];

  constructor(private cdref: ChangeDetectorRef, private el: ElementRef) {
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
    const input: HTMLInputElement =
      this.el.nativeElement.querySelector('#date-input-field');
    if (selectedOptions.length) {
      const dateRange: DateRange<Date> = selectedOptions[0].callBackFunction();
      if (dateRange && dateRange.start && dateRange.end) {
        this.updateSelectedDates(input, dateRange.start, dateRange.end);
      }
    } else if (this.selectedDates.start && this.selectedDates.end) {
      input.value =
        this.getDateString(this.selectedDates.start) +
        ' - ' +
        this.getDateString(this.selectedDates.end);
    }
    this.cdref.detectChanges();
  }

  /**
   * This method toggles the visibility of default date option's List.
   */
  toggleDateOptionSelectionList(): void {
    const selectedOption = this.dateDropDownOptions.filter(
      (option) => option.isSelected
    );
    if (
      selectedOption.length &&
      selectedOption[0].optionKey === DEFAULT_DATE_OPTION_ENUM.CUSTOM
    ) {
      this.toggleCustomDateRangeView();
    } else {
      this.isDateOptionList = !this.isDateOptionList;
    }
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
      this.isCustomRange = false;
      this.updateDateOnOptionSelect(option, input);
    } else {
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
    if (option.optionKey === DEFAULT_DATE_OPTION_ENUM.DATE_DIFF) {
      startDate.setDate(startDate.getDate() + option.dateDiff);
    } else if (option.optionKey === DEFAULT_DATE_OPTION_ENUM.LAST_MONTH) {
      startDate = new Date(currDate.getFullYear(), currDate.getMonth() - 1, 1);
      lastDate = new Date(
        currDate.getFullYear(),
        currDate.getMonth(),
        this.getDaysInMonth(currDate)
      );
    } else if (option.optionKey === DEFAULT_DATE_OPTION_ENUM.THIS_MONTH) {
      startDate = new Date(currDate.getFullYear(), currDate.getMonth(), 1);
      lastDate = new Date(
        currDate.getFullYear(),
        currDate.getMonth(),
        this.getDaysInMonth(currDate)
      );
    } else if (option.optionKey === DEFAULT_DATE_OPTION_ENUM.YEAR_TO_DATE) {
      startDate = new Date(currDate.getFullYear(), 0, 1);
    } else if (option.optionKey === DEFAULT_DATE_OPTION_ENUM.MONTH_TO_DATE) {
      startDate = new Date(currDate.getFullYear(), currDate.getMonth(), 1);
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
    input.value =
      this.getDateString(startDate) + ' - ' + this.getDateString(endDate);
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
