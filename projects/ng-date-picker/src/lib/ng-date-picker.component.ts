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
import { ISelectDateOption } from './model/select-date-option';
import { DEFAULT_DATE_OPTIONS } from './data/default-date-options';

@Component({
  selector: 'ng-date-picker',
  templateUrl: './ng-date-picker.component.html',
  styleUrls: ['./ng-date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgDatePickerComponent implements OnInit {
  isDateSelectionOptionVisible: boolean = false;
  _defaultDateList: ISelectDateOption[] = [];

  @Input()
  set defaultDateList(defaultDateList: ISelectDateOption[]) {
    this._defaultDateList = DEFAULT_DATE_OPTIONS.concat(defaultDateList);
  }

  get defaultDateList(): ISelectDateOption[] {
    return this._defaultDateList || [];
  }

  constructor() {}

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

  // updateSelection(item: RangeList, input: HTMLInputElement): void {
  //   this.toggleVisibility(item);
  //   if (item.value !== dateRangeList.customRange) {
  //     this.updateDateOnMenuSelection(item, input);
  //   }
  // }
}
