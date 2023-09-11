/**
 * @(#)ng-date-picker.component.ts Sept 05, 2023
 *
 * @author Aakash Kumar
 */
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
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
  isDateSelectionOptionVisible: boolean = false;
  isCustomRange: boolean = false;
  _defaultDateList: ISelectDateOption[] = [];
  selectedDates!: DateRange<Date>;

  @Input()
  set defaultDateList(defaultDateList: ISelectDateOption[]) {
    this._defaultDateList = DEFAULT_DATE_OPTIONS.concat(defaultDateList);
  }

  get defaultDateList(): ISelectDateOption[] {
    return this._defaultDateList || [];
  }

  ngOnInit(): void {
    if (!this._defaultDateList.length) {
      this._defaultDateList = DEFAULT_DATE_OPTIONS;
    }
  }

  /**
   * This method toggles the visibility of default date option's List.
   */
  toggleDateSelectionOptions(): void {
    this.isDateSelectionOptionVisible = !this.isDateSelectionOptionVisible;
  }

  /**
   * This method update the date on specified option.
   *
   * @param option ISelectDateOption
   * @param input HTMLInputElement
   */
  updateSelection(option: ISelectDateOption, input: HTMLInputElement): void {
    // this.toggleDateSelectionOptions(item);

    if (option.optionKey !== DEFAULT_DATE_OPTION_ENUM.CUSTOM) {
      // this.updateDateOnOptionSelect(option, input);
    }
  }

  /**
   * This method toggles the custom date range selection view.
   */
  toggleCustomDateRangeView(): void {
    this.isCustomRange = !this.isCustomRange;
  }

  /**
   * This method update date if specified option is not custom range.
   *
   * @param option item
   * @param input input
   */
  private updateDateOnOptionSelect(
    option: ISelectDateOption,
    input: HTMLInputElement
  ): void {
    const currDate = new Date();
    let startDate: Date = new Date();
    let lastDate: Date = new Date();
    if (option.optionKey === DEFAULT_DATE_OPTION_ENUM.DATE_DIFF) {
      startDate.setDate(startDate.getDate() - option.dateDiff);
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
      startDate = new Date(currDate.getFullYear(), 1, 1);
    }
    console.log(startDate + ' : ' + lastDate);
  }

  private getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), 0).getDate();
  }
}
