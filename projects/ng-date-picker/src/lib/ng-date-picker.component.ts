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
  @Input() minDate = new Date(
    new Date().setFullYear(new Date().getFullYear() - 10)
  );

  // default max date is current date - 10 years.
  @Input() maxDate = new Date(
    new Date().setFullYear(new Date().getFullYear() + 10)
  );

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
      this._dateDropDownOptions[this.selectedOptionIndex].isSelected = true;
    }
    this.dateListOptions.emit(this.dateDropDownOptions);
  }

  ngAfterViewInit(): void {
    this.updateDefaultDatesValues();
  }

  /**
   * This method toggles the visibility of default date option's List.
   */
  toggleDateOptionSelectionList(event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
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
    selectedDates: DateRange<Date> | null
  ): void {
    this.updateSelectedDates(
      input,
      selectedDates?.start ?? new Date(),
      selectedDates?.end ?? new Date(),
      null
    );
    if (this.isCustomRange) {
      this.resetOptionSelection();
      this.selectCustomOption();
      this.isCustomRange = false;
    }
  }

  /**
   * This method update the date on specified option.
   *
   * @param option ISelectDateOption
   * @param input HTMLInputElement
   */
  updateSelection(option: ISelectDateOption, input: HTMLInputElement): void {
    this.isDateOptionList = false;
    if (option.optionKey !== DEFAULT_DATE_OPTION_ENUM.CUSTOM) {
      this.isCustomRange = false;
      this.resetOptionSelection(option);
      this.updateDateOnOptionSelect(option, input);
    } else {
      this.isCustomRange = true;
    }
    this.cdref.markForCheck();
  }

  // This method sets custom option as selected.
  selectCustomOption(): void {
    const customOption = this.dateDropDownOptions.filter(
      (option) => option.optionKey === DEFAULT_DATE_OPTION_ENUM.CUSTOM
    );
    customOption[0].isSelected = true;
  }

  /**
   * This method toggles the custom date range selection view.
   */
  toggleCustomDateRangeView(): void {
    this.isCustomRange = !this.isCustomRange;
  }

  /**
   * Clears the selected dates and resets date-related properties.
   *
   * @param event - The mouse event that triggered the clear action.
   */
  clearSelection(event: MouseEvent): void {
    event.stopImmediatePropagation();
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    this.minDate = new Date(currentDate.setFullYear(year - 10));
    this.maxDate = new Date(currentDate.setFullYear(year + 10));
    this.selectedDates = null;
    this.resetOptionSelection();

    const dateInputField =
      this.el.nativeElement.querySelector('#date-input-field');
    if (dateInputField) {
      dateInputField.value = '';
    }
    this.cdref.markForCheck();
    const selectedDateEventData: SelectedDateEvent = {
      range: null,
      selectedOption: null,
    };
    this.onDateSelectionChanged.emit(selectedDateEventData);
  }

  /**
   * This method sets clicked element as selected.
   * @param option ISelectDateOption
   */
  private resetOptionSelection(option?: ISelectDateOption): void {
    this.dateDropDownOptions.forEach((option) => (option.isSelected = false));
    if (option) {
      option.isSelected = true;
    }
    this.cdref.markForCheck();
  }

  /**
   * Updates the selected dates based on the given option and input element.
   *
   * @param option - The date option selected by the user.
   * @param input - The HTML input element to update.
   */
  private updateDateOnOptionSelect(
    option: ISelectDateOption,
    input: HTMLInputElement
  ): void {
    const currDate = new Date();
    let startDate: Date = new Date();
    let lastDate: Date = new Date();

    // If there is a callback function, use it to get the date range
    if (option.callBackFunction) {
      const dateRange: DateRange<Date> = option.callBackFunction();
      if (dateRange?.start && dateRange?.end) {
        this.updateSelectedDates(input, dateRange.start, dateRange.end, option);
        return;
      }
    }

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
          this.getDaysInMonth(currDate)
        );
        break;

      case DEFAULT_DATE_OPTION_ENUM.THIS_MONTH:
        startDate = new Date(currDate.getFullYear(), currDate.getMonth(), 1);
        lastDate = new Date(
          currDate.getFullYear(),
          currDate.getMonth(),
          this.getDaysInMonth(currDate)
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
   * This method updates dates on selection.
   *
   * @param input HTMLInputElement
   * @param startDate Date
   * @param endDate Date
   */
  private updateSelectedDates(
    input: HTMLInputElement,
    startDate: Date,
    endDate: Date,
    option: ISelectDateOption | null
  ): void {
    this.selectedDates = new DateRange<Date>(startDate, endDate);
    input.value =
      this.displaySelectedLabel && option
        ? option.optionLabel
        : this.getDateString(startDate) + ' - ' + this.getDateString(endDate);
    const selectedOption = this.dateDropDownOptions.filter(
      (option) => option.isSelected
    )[0];
    const selectedDateEventData: SelectedDateEvent = {
      range: new DateRange<Date>(new Date(startDate), new Date(endDate)),
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
   * This method update the default date values on init.
   */
  private updateDefaultDatesValues(): void {
    const input: HTMLInputElement =
      this.el.nativeElement.querySelector('#date-input-field');
    if (
      this.selectedDates &&
      this.selectedDates.start &&
      this.selectedDates.end
    ) {
      const customOption: ISelectDateOption[] =
        this._dateDropDownOptions.filter(
          (option) => option.optionKey === DEFAULT_DATE_OPTION_ENUM.CUSTOM
        );
      customOption[0].isSelected = true;
      input.value =
        this.getDateString(this.selectedDates.start) +
        ' - ' +
        this.getDateString(this.selectedDates.end);
    } else {
      const selectedOptions: ISelectDateOption[] =
        this._dateDropDownOptions.filter((option) => option.isSelected);
      if (
        selectedOptions.length &&
        selectedOptions[0].optionKey !== DEFAULT_DATE_OPTION_ENUM.CUSTOM
      ) {
        this.updatedFromListValueSelection(selectedOptions[0], input);
      }
    }
    this.cdref.detectChanges();
  }

  /**
   * This method updates the date values based on default option selection.
   *
   * @param selectedOption ISelectDateOption
   * @param input HTMLInputElement
   */
  private updatedFromListValueSelection(
    selectedOption: ISelectDateOption,
    input: HTMLInputElement
  ): void {
    // This will update value if option is selected from provided custom list.
    if (selectedOption['callBackFunction']) {
      const dateRange: DateRange<Date> = selectedOption.callBackFunction();
      if (dateRange?.start && dateRange?.end) {
        this.updateSelectedDates(
          input,
          dateRange.start,
          dateRange.end,
          selectedOption
        );
      }
    } else {
      // This will update value if option is selected from default list.
      this.updateDateOnOptionSelect(selectedOption, input);
    }
  }
}
