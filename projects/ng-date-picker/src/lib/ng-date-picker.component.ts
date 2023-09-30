/**
 * @(#)ng-date-picker.component.ts Sept 05, 2023
 *
 * @author Aakash Kumar
 */
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
import { DEFAULT_DATE_OPTION_ENUM } from './constant/date-filter-enum';
import { DEFAULT_DATE_OPTIONS } from './data/default-date-options';
import { ISelectDateOption } from './model/select-date-option';

@Component({
  selector: 'ng-date-picker',
  templateUrl: './ng-date-picker.component.html',
  styleUrls: ['./ng-date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgDatePickerComponent implements OnInit {
  isDateOptionList: boolean = false;
  isCustomRange: boolean = false;

  @Input() selectedDates!: DateRange<Date>;
  @Input() dateFormat: string = 'dd/MM/yyyy';
  @Output() onDateSelectionChanged: EventEmitter<DateRange<Date>>;
  @Output() dateListOptions: EventEmitter<ISelectDateOption[]>;

  private _dateDropDownOptions: ISelectDateOption[] = [];

  constructor(private cdref: ChangeDetectorRef) {
    this.onDateSelectionChanged = new EventEmitter<DateRange<Date>>();
    this.dateListOptions = new EventEmitter<ISelectDateOption[]>();
  }

  @Input()
  set dateDropDownOptions(defaultDateList: ISelectDateOption[]) {
    this._dateDropDownOptions = DEFAULT_DATE_OPTIONS.concat(defaultDateList);
  }

  get dateDropDownOptions(): ISelectDateOption[] {
    return this._dateDropDownOptions ?? [];
  }

  ngOnInit(): void {
    if (!this._dateDropDownOptions.length) {
      this._dateDropDownOptions = DEFAULT_DATE_OPTIONS;
    }
    this.dateListOptions.emit(this.dateDropDownOptions);
  }

  /**
   * This method toggles the visibility of default date option's List.
   */
  toggleDateOptionSelectionList(): void {
    this.isDateOptionList = !this.isDateOptionList;
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
    this.onDateSelectionChanged.emit(this.selectedDates);
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
}
