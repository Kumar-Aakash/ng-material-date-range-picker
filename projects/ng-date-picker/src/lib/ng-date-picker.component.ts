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
  computed,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { DateRange } from '@angular/material/datepicker';
import { SelectedDateEvent } from '../public-api';
import { CalendarComponent } from './calendar/calendar.component';
import { DATE_OPTION_TYPE } from './constant/date-filter-const';
import { DEFAULT_DATE_OPTIONS } from './data/default-date-options';
import { ISelectDateOption } from './model/select-date-option.model';
import {
  getClone,
  getDateString,
  getDateWithOffset,
  getDaysInMonth,
  getFormattedDateString,
  getRelativeExpr,
  isSameDay,
  parseDateByFormat,
  resetOptionSelection,
  selectCustomOption,
} from './utils/date-picker-utilities';
import { parseHumanDate } from './utils/human-date-parser';

@Component({
  standalone: false,
  selector: 'ng-date-range-picker',
  templateUrl: './ng-date-picker.component.html',
  styleUrls: ['./ng-date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgDatePickerComponent implements OnInit, AfterViewInit {
  public isDateOptionList: boolean = false;
  public isCustomRange: boolean = false;
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
  /**
   * When true, the main input shows the human-readable expressions
   * (e.g. `now-7d - now`) instead of the absolute date range. If
   * `displaySelectedLabel` is also true, the label takes priority.
   */
  @Input() displaySelectedExpression = false;
  /**
   * When true, the custom-range footer shows two editable Material inputs
   * (start / end) that accept dates in `dateFormat`, ISO 8601 durations
   * (`p7d`), or date math (`now-7d`). When false, a read-only label is shown.
   */
  @Input() enableEditableDates = false;
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

  private _dateOptions: WritableSignal<ISelectDateOption[]> = signal([]);
  visibleOptions = computed(() =>
    this._dateOptions().filter((op) => op.isVisible)
  );

  /**
   * Reactive form backing the editable start/end inputs. Each control accepts
   * a `dateFormat` date, an ISO 8601 duration, or a date-math expression; the
   * group is invalid when either value is unparseable or start is after end.
   */
  editableForm = new FormGroup(
    {
      start: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, (c) => this.validateDateControl(c)],
      }),
      end: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, (c) => this.validateDateControl(c)],
      }),
    },
    { validators: (g) => this.validateRange(g) }
  );

  // The raw expressions the user last committed via the editable inputs, kept
  // so human-language input (e.g. `now-7d`) is shown again instead of being
  // replaced by an absolute date - but only while it still resolves to the
  // current range (see populateEditableForm).
  private editableExpr: { start: string; end: string } | null = null;

  constructor() {}

  @Input()
  set dateDropDownOptions(defaultDateList: ISelectDateOption[]) {
    const options = [
      ...(this.enableDefaultOptions ? getClone(DEFAULT_DATE_OPTIONS) : []),
      ...(defaultDateList ?? []),
    ];
    this._dateOptions.set(options);
  }

  get dateDropDownOptions(): ISelectDateOption[] {
    return this._dateOptions() ?? [];
  }

  ngOnInit(): void {
    if (this.isDefaultInitRequired()) {
      this.initDefaultOptions();
    }
    this.dateListOptions.emit(this.dateDropDownOptions);
  }

  ngAfterViewInit(): void {
    this.updateDefaultDatesValues();
  }

  /**
   * Toggles the visibility of the default date option list.
   * If the custom range panel is open, closes it instead.
   *
   * @param event Optional MouseEvent triggering the toggle.
   */
  toggleDateOptionSelectionList(event?: MouseEvent): void {
    event?.preventDefault();
    event?.stopImmediatePropagation();

    if (this.isCustomRange) {
      this.isCustomRange = false;
      return;
    }
    if (this.isDateOptionList) {
      this.isDateOptionList = false;
      return;
    }
    // When the active selection is a custom range, reopen straight into the
    // custom-range view instead of the options list.
    const selectedOption = this.dateDropDownOptions.find((o) => o.isSelected);
    if (selectedOption?.optionType === DATE_OPTION_TYPE.CUSTOM) {
      this.isCustomRange = true;
      this.populateEditableForm();
      return;
    }
    this.isDateOptionList = true;
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

    if (this.isCustomRange) {
      resetOptionSelection(this.dateDropDownOptions);
      selectCustomOption(this.dateDropDownOptions);
      this.syncOptionSelection();
      this.isCustomRange = false;
    }

    const start = selectedDates?.start ?? new Date();
    const end = selectedDates?.end ?? new Date();
    this.updateSelectedDates(input, start, end, null);
  }

  /**
   * Updates the selection when a specific date option is clicked.
   *
   * @param option The selected date option.
   * @param input The HTML input element to update with selected dates.
   */
  updateSelection(option: ISelectDateOption, input: HTMLInputElement): void {
    this.isDateOptionList = false;
    this.isCustomRange = option.optionType === DATE_OPTION_TYPE.CUSTOM;
    if (this.isCustomRange) {
      resetOptionSelection(this.dateDropDownOptions);
      selectCustomOption(this.dateDropDownOptions);
      this.populateEditableForm();
    } else {
      resetOptionSelection(this.dateDropDownOptions, option);
      this.updateDateOnOptionSelect(option, input);
    }
    this.syncOptionSelection();
    this.cdref.markForCheck();
  }

  /**
   * Re-emits the options signal after an in-place selection change so the
   * OnPush views (bound to the `visibleOptions` computed) reliably reflect the
   * new `isSelected` state - the same notification the initial signal `set`
   * provides.
   */
  private syncOptionSelection(): void {
    this._dateOptions.update((options) => [...options]);
  }

  /**
   * Toggles the custom date range selection view visibility.
   */
  toggleCustomDateRangeView(): void {
    this.isCustomRange = !this.isCustomRange;
    if (this.isCustomRange) {
      this.populateEditableForm();
    }
  }

  /**
   * Parses a single editable input value, accepting either a `dateFormat`
   * date or one of the human formats (ISO 8601 duration, date math).
   *
   * @param value - The raw input string.
   * @returns The parsed Date, or `null` if it cannot be parsed.
   */
  private parseInputValue(value: string): Date | null {
    const trimmed = value?.trim();
    if (!trimmed) {
      return null;
    }
    return parseDateByFormat(trimmed, this.dateFormat) ?? parseHumanDate(trimmed);
  }

  /**
   * Validator for a single editable date control: valid when the value parses
   * to a date. Empty values are left to the `required` validator.
   */
  private validateDateControl(control: AbstractControl): ValidationErrors | null {
    const value = (control.value ?? '').trim();
    if (!value) {
      return null;
    }
    return this.parseInputValue(value) ? null : { invalidDate: true };
  }

  /**
   * Group validator ensuring the parsed start date is not after the end date.
   */
  private validateRange(group: AbstractControl): ValidationErrors | null {
    const start = this.parseInputValue(group.get('start')?.value ?? '');
    const end = this.parseInputValue(group.get('end')?.value ?? '');
    if (start && end && start > end) {
      return { rangeOrder: true };
    }
    return null;
  }

  /**
   * Commits the editable inputs to the calendar so the views and the Apply
   * action reflect the typed values. No-op when editing is disabled or the
   * form is invalid.
   *
   * @param calendar - The calendar component instance from the template.
   */
  commitEditableDates(calendar: CalendarComponent): void {
    if (!this.enableEditableDates || this.editableForm.invalid) {
      return;
    }
    const startRaw = this.editableForm.controls.start.value.trim();
    const endRaw = this.editableForm.controls.end.value.trim();
    const start = this.parseInputValue(startRaw);
    const end = this.parseInputValue(endRaw);
    if (!start || !end) {
      return;
    }
    // Remember exactly what the user typed so the expression (e.g. `now-7d`)
    // survives a reopen instead of being shown as a resolved absolute date.
    this.editableExpr = { start: startRaw, end: endRaw };
    calendar.selectedDates = new DateRange<Date>(start, end);
    this.cdref.markForCheck();
  }

  /**
   * Reflects a calendar (date-click) selection in the editable inputs as
   * absolute dates. A calendar pick is an explicit absolute selection, so any
   * remembered expression is cleared and the inputs show formatted dates.
   *
   * @param range - The range emitted by the calendar.
   */
  onCalendarSelectionChange(range: DateRange<Date>): void {
    if (!this.enableEditableDates) {
      return;
    }
    this.editableExpr = null;
    this.editableForm.setValue({
      start: range.start ? getDateString(range.start, this.dateFormat) : '',
      end: range.end ? getDateString(range.end, this.dateFormat) : '',
    });
    this.cdref.markForCheck();
  }

  /**
   * Commits the editable inputs and applies the range, closing the panel -
   * the same as clicking Apply. Used for the Enter key. No-op when editing is
   * disabled or the form is invalid, so Enter never closes with bad input.
   *
   * @param input - The main date input element to update.
   * @param calendar - The calendar component instance from the template.
   */
  applyEditableDates(input: HTMLInputElement, calendar: CalendarComponent): void {
    if (!this.enableEditableDates || this.editableForm.invalid) {
      return;
    }
    this.commitEditableDates(calendar);
    this.updateCustomRange(input, calendar.selectedDates);
  }

  /**
   * Pre-fills the editable inputs from the current selection: relative
   * expressions for a day-diff option (e.g. `now-7d` .. `now`), otherwise the
   * absolute formatted dates.
   */
  private populateEditableForm(): void {
    if (!this.enableEditableDates) {
      return;
    }
    const range = this.selectedDates;
    if (range?.start && range?.end) {
      const option =
        this.dateDropDownOptions.find((o) => o.isSelected) ?? null;
      this.editableForm.setValue(
        this.resolveDisplayExpr(range.start, range.end, option)
      );
    } else {
      this.editableForm.setValue({ start: '', end: '' });
    }
  }

  /**
   * Resolves the human-readable start/end expressions for a range. Prefers the
   * user's own committed expression (when it still resolves to this range),
   * then the relative form of a day-diff option, and finally the absolute
   * formatted dates. Shared by the editable inputs and the emitted event.
   *
   * @param start - Range start date.
   * @param end - Range end date.
   * @param opt - The associated date option, if any.
   * @returns The start and end expression strings.
   */
  private resolveDisplayExpr(
    start: Date,
    end: Date,
    opt: ISelectDateOption | null
  ): { start: string; end: string } {
    if (this.editableExpr && this.exprMatchesDates(this.editableExpr, start, end)) {
      return { start: this.editableExpr.start, end: this.editableExpr.end };
    }
    const optionExpr = getRelativeExpr(opt);
    if (optionExpr) {
      return optionExpr;
    }
    return {
      start: getDateString(start, this.dateFormat),
      end: getDateString(end, this.dateFormat),
    };
  }

  /**
   * Checks whether a saved expression still resolves (to day precision) to the
   * given dates, so a stale expression is not reused after the range changed
   * by other means.
   */
  private exprMatchesDates(
    expr: { start: string; end: string },
    start: Date,
    end: Date
  ): boolean {
    const exprStart = this.parseInputValue(expr.start);
    const exprEnd = this.parseInputValue(expr.end);
    return (
      !!exprStart &&
      !!exprEnd &&
      isSameDay(exprStart, start) &&
      isSameDay(exprEnd, end)
    );
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
    this.syncOptionSelection();
    this.clearDateInput();
    this.cdref.markForCheck();
    const selectedDateEventData: SelectedDateEvent = {
      range: null,
      selectedOption: null,
      startExpr: null,
      endExpr: null,
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
    switch (option.optionType) {
      case DATE_OPTION_TYPE.DATE_DIFF:
        startDate.setDate(startDate.getDate() + (option.dateDiff ?? 0));
        break;

      case DATE_OPTION_TYPE.LAST_MONTH:
        currDate.setMonth(currDate.getMonth() - 1);
        startDate = new Date(currDate.getFullYear(), currDate.getMonth(), 1);
        lastDate = new Date(
          currDate.getFullYear(),
          currDate.getMonth(),
          getDaysInMonth(currDate)
        );
        break;

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
        break;

      case DATE_OPTION_TYPE.MONTH_TO_DATE:
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

    const expr = this.resolveDisplayExpr(start, end, opt);
    const rangeLabel = `${getDateString(
      start,
      this.dateFormat
    )} - ${getDateString(end, this.dateFormat)}`;

    if (this.displaySelectedLabel && opt?.optionLabel) {
      input.value = opt.optionLabel;
    } else if (this.displaySelectedExpression) {
      input.value = `${expr.start} - ${expr.end}`;
    } else {
      input.value = rangeLabel;
    }

    this.onDateSelectionChanged.emit({
      range,
      selectedOption:
        this.dateDropDownOptions.find((o) => o.isSelected) ?? null,
      startExpr: expr.start,
      endExpr: expr.end,
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
      this._dateOptions().find(
        (option) => option.optionType === DATE_OPTION_TYPE.CUSTOM
      )!.isSelected = true;
      input.value = getFormattedDateString(this.selectedDates, this.dateFormat);
      this.cdref.detectChanges();
      return;
    }

    const selectedOptions = this._dateOptions().find(
      (option) => option.isSelected
    );

    if (
      selectedOptions &&
      selectedOptions.optionType !== DATE_OPTION_TYPE.CUSTOM
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
  private isDefaultInitRequired(): boolean {
    return this.enableDefaultOptions && !this._dateOptions.length;
  }

  /**
   * Initializes the default date options with the selected index.
   */
  private initDefaultOptions(): void {
    const options = getClone<ISelectDateOption[]>(DEFAULT_DATE_OPTIONS).map(
      (opt, idx) => ({
        ...opt,
        isSelected: idx === this.selectedOptionIndex,
      })
    );
    this._dateOptions.set(options);
  }
}
