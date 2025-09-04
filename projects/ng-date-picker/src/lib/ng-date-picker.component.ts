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
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { DateRange } from '@angular/material/datepicker';
import { SelectedDateEvent } from '../public-api';
import { DEFAULT_DATE_OPTION_ENUM } from './constant/date-filter-enum';
import { DEFAULT_DATE_OPTIONS } from './data/default-date-options';
import { ISelectDateOption } from './model/select-date-option';
import {
  getClone,
  getDateString,
  getDateWithOffset,
  getDaysInMonth,
  getFormattedDateString,
  resetOptionSelection,
  selectCustomOption,
} from './utils/date-picker-utilities';

@Component({
  selector: 'ng-date-range-picker',
  templateUrl: './ng-date-picker.component.html',
  styleUrls: ['./ng-date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgDatePickerComponent implements OnInit, AfterViewInit {
  public isDateOptionList: boolean = false;
  public isCustomRange: boolean = false;
  private _dateDropDownOptions: ISelectDateOption[] = [];

  @Input() inputLabel: string = 'Date Range';
  @Input() staticOptionId = 'static-options';
  @Input() dynamicOptionId = 'dynamic-options';
  @Input() calendarId: string = 'custom-calendar';
  @Input() enableDefaultOptions: boolean = true;
  @Input() selectedDates!: DateRange<Date> | null;
  @Input() dateFormat: string = 'dd/MM/yyyy';
  @Input() isShowStaticDefaultOptions: boolean = false;
  @Input() hideDefaultOptions: boolean = false;
  @Input() cdkConnectedOverlayOffsetX = 0;
  @Input() cdkConnectedOverlayOffsetY = 0;
  @Input() listCdkConnectedOverlayOffsetY = 0;
  @Input() listCdkConnectedOverlayOffsetX = 0;
  @Input() selectedOptionIndex = 3;
  @Input() displaySelectedLabel = false;
  @Input() cdkConnectedOverlayPush = true;
  @Input() cdkConnectedOverlayPositions = [];

  // default min date is current date - 10 years.
  @Input() minDate = getDateWithOffset(-10);
  // default max date is current date + 10 years.
  @Input() maxDate = getDateWithOffset(10);

  @Output() onDateSelectionChanged = new EventEmitter<SelectedDateEvent>();
  @Output() dateListOptions = new EventEmitter<ISelectDateOption[]>();

  private cdref: ChangeDetectorRef = inject(ChangeDetectorRef);
  private el: ElementRef = inject(ElementRef);
  constructor() {}

  @Input()
  set dateDropDownOptions(defaultDateList: ISelectDateOption[]) {
    this._dateDropDownOptions = [
      ...(this.enableDefaultOptions ? getClone(DEFAULT_DATE_OPTIONS) : []),
      ...(defaultDateList ?? []),
    ];
  }

  get dateDropDownOptions(): ISelectDateOption[] {
    return this._dateDropDownOptions ?? [];
  }

  ngOnInit(): void {
    if (this.isDefaultInitializationRequired()) {
      this.initializeDefaultOptions();
    }
    this.dateListOptions.emit(this.dateDropDownOptions);
  }

  ngAfterViewInit(): void {
    this.updateDefaultDatesValues();
  }

  /**
   * Toggles the visibility of the default date option list.
   * If the custom option is selected, toggles the custom date range view instead.
   *
   * @param event Optional MouseEvent triggering the toggle.
   */
  toggleDateOptionSelectionList(event?: MouseEvent): void {
    event?.preventDefault();
    event?.stopImmediatePropagation();
    const isCustomSelected =
      this.dateDropDownOptions.find((option) => option.isSelected)
        ?.optionKey === DEFAULT_DATE_OPTION_ENUM.CUSTOM;

    if (isCustomSelected) {
      this.toggleCustomDateRangeView();
      return;
    }
    this.isDateOptionList = !this.isDateOptionList;
  }

  /**
   * Updates the custom date range selection from the input.
   *
   * @param input The HTML input element associated with the date picker.
   * @param selectedDates The selected date range.
   */
  updateCustomRange(
    input: HTMLInputElement,
    selectedDates: DateRange<Date> | null
  ): void {
    const start = selectedDates?.start ?? new Date();
    const end = selectedDates?.end ?? new Date();
    this.updateSelectedDates(input, start, end, null);

    if (!this.isCustomRange) return;

    resetOptionSelection(this.dateDropDownOptions);
    selectCustomOption(this.dateDropDownOptions);
    this.isCustomRange = false;
  }

  /**
   * Updates the selection when a specific date option is clicked.
   *
   * @param option The selected date option.
   * @param input The HTML input element to update with selected dates.
   */
  updateSelection(option: ISelectDateOption, input: HTMLInputElement): void {
    this.isDateOptionList = false;
    this.isCustomRange = option.optionKey === DEFAULT_DATE_OPTION_ENUM.CUSTOM;
    if (!this.isCustomRange) {
      resetOptionSelection(this.dateDropDownOptions, option);
      this.updateDateOnOptionSelect(option, input);
    }
    this.cdref.markForCheck();
  }

  /**
   * Toggles the custom date range selection view visibility.
   */
  toggleCustomDateRangeView(): void {
    this.isCustomRange = !this.isCustomRange;
  }

  /**
   * Clears the currently selected dates and resets all related properties.
   *
   * @param event The MouseEvent triggering the clear action.
   */
  clearSelection(event: MouseEvent): void {
    event?.stopImmediatePropagation();
    this.minDate = getDateWithOffset(-10);
    this.maxDate = getDateWithOffset(10);
    this.selectedDates = null;
    resetOptionSelection(this.dateDropDownOptions);
    this.clearDateInput();
    this.cdref.markForCheck();
    const selectedDateEventData: SelectedDateEvent = {
      range: null,
      selectedOption: null,
    };
    this.onDateSelectionChanged.emit(selectedDateEventData);
  }

  /**
   * Clears the input field value for the date picker.
   */
  private clearDateInput(): void {
    const dateInputField =
      this.el.nativeElement.querySelector('#date-input-field');
    if (dateInputField) {
      dateInputField.value = '';
    }
  }

  /**
   * Updates selected dates based on a selected option and input element.
   *
   * @param option The selected date option.
   * @param input The HTML input element to update.
   */
  private updateDateOnOptionSelect(
    option: ISelectDateOption,
    input: HTMLInputElement
  ): void {
    // If there is a callback function, use it to get the date range
    if (option?.callBackFunction) {
      const dateRange: DateRange<Date> = option.callBackFunction();
      if (dateRange?.start && dateRange?.end) {
        this.updateSelectedDates(input, dateRange.start, dateRange.end, option);
        return;
      }
    }
    this.updateDateWithSelectedOption(option, input);
  }

  /**
   * Calculates and updates the start and end dates based on the selected option.
   *
   * @param option The selected date option.
   * @param input The HTML input element to update.
   */
  private updateDateWithSelectedOption(
    option: ISelectDateOption,
    input: HTMLInputElement
  ): void {
    const currDate = new Date();
    let startDate: Date = new Date();
    let lastDate: Date = new Date();
    // Determine the date range based on the option key
    switch (option.optionKey) {
      case DEFAULT_DATE_OPTION_ENUM.DATE_DIFF:
        startDate.setDate(startDate.getDate() + option.dateDiff);
        break;

      case DEFAULT_DATE_OPTION_ENUM.LAST_MONTH:
        currDate.setMonth(currDate.getMonth() - 1);
        startDate = new Date(currDate.getFullYear(), currDate.getMonth(), 1);
        lastDate = new Date(
          currDate.getFullYear(),
          currDate.getMonth(),
          getDaysInMonth(currDate)
        );
        break;

      case DEFAULT_DATE_OPTION_ENUM.THIS_MONTH:
        startDate = new Date(currDate.getFullYear(), currDate.getMonth(), 1);
        lastDate = new Date(
          currDate.getFullYear(),
          currDate.getMonth(),
          getDaysInMonth(currDate)
        );
        break;

      case DEFAULT_DATE_OPTION_ENUM.YEAR_TO_DATE:
        startDate = new Date(currDate.getFullYear(), 0, 1);
        break;

      case DEFAULT_DATE_OPTION_ENUM.MONTH_TO_DATE:
        startDate = new Date(currDate.getFullYear(), currDate.getMonth(), 1);
        break;

      default:
        break;
    }

    // Update the selected dates
    this.updateSelectedDates(input, startDate, lastDate, option);
  }

  /**
   * Updates the date range and input display.
   *
   * @param input The HTML input element.
   * @param start Start date of the range.
   * @param end End date of the range.
   * @param opt Optional selected date option.
   */
  private updateSelectedDates(
    input: HTMLInputElement,
    start: Date,
    end: Date,
    opt: ISelectDateOption | null
  ): void {
    const range = new DateRange(start, end);
    this.selectedDates = range;

    const label = this.displaySelectedLabel ? opt?.optionLabel : null;
    const rangeLabel = `${getDateString(
      start,
      this.dateFormat
    )} - ${getDateString(end, this.dateFormat)}`;

    input.value = label ?? rangeLabel;
    this.onDateSelectionChanged.emit({
      range,
      selectedOption:
        this.dateDropDownOptions.find((o) => o.isSelected) ?? null,
    });
    this.cdref.markForCheck();
  }

  /**
   * Updates the input and internal state with default dates on initialization.
   */
  private updateDefaultDatesValues(): void {
    const input: HTMLInputElement =
      this.el.nativeElement.querySelector('#date-input-field');
    if (this.selectedDates?.start && this.selectedDates?.end) {
      this._dateDropDownOptions.find(
        (option) => option.optionKey === DEFAULT_DATE_OPTION_ENUM.CUSTOM
      )!.isSelected = true;
      input.value = getFormattedDateString(this.selectedDates, this.dateFormat);
      this.cdref.detectChanges();
      return;
    }

    const selectedOptions = this._dateDropDownOptions.find(
      (option) => option.isSelected
    );

    if (
      selectedOptions &&
      selectedOptions.optionKey !== DEFAULT_DATE_OPTION_ENUM.CUSTOM
    ) {
      this.updatedFromListValueSelection(selectedOptions, input);
      this.cdref.detectChanges();
    }
  }

  /**
   * Updates the input and selected dates based on a selected option from the list.
   *
   * @param selectedOption The selected date option.
   * @param input The HTML input element to update.
   */
  private updatedFromListValueSelection(
    selectedOption: ISelectDateOption,
    input: HTMLInputElement
  ): void {
    // This will update value if option is selected from default list.
    if (!selectedOption['callBackFunction']) {
      this.updateDateOnOptionSelect(selectedOption, input);
      return;
    }
    // This will update value if option is selected from provided custom list.
    const dateRange: DateRange<Date> = selectedOption.callBackFunction();
    this.updateSelectedDates(
      input,
      dateRange.start ?? new Date(),
      dateRange.end ?? new Date(),
      selectedOption
    );
  }

  /**
   * Checks whether default initialization of options is required.
   *
   * @returns True if default options need to be initialized, otherwise false.
   */
  private isDefaultInitializationRequired(): boolean {
    return this.enableDefaultOptions && !this._dateDropDownOptions.length;
  }

  /**
   * Initializes the default date options with the selected index.
   */
  private initializeDefaultOptions(): void {
    this._dateDropDownOptions = getClone<ISelectDateOption[]>(
      DEFAULT_DATE_OPTIONS
    ).map((opt, idx) => ({
      ...opt,
      isSelected: idx === this.selectedOptionIndex,
    }));
  }
}
