import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
} from '@angular/core';
import {
  MatCalendar,
  MatCalendarView,
  MatDatepickerIntl,
  MatMonthView,
  MatMultiYearView,
  MatYearView,
  yearsPerPage
} from '@angular/material/datepicker';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MatDateFormats,
} from '@angular/material/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

let calendarHeaderId = 1;

@Component({
  selector: 'lib-date-picker-header',
  templateUrl: './date-picker-header.component.html',
  styleUrls: ['./date-picker-header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatSelectModule],
})
export class DatePickerHeaderComponent<D> implements OnDestroy {
  private _destroyed = new Subject<void>();
  private _id = `mat-calendar-header-${calendarHeaderId++}`;
  _periodButtonLabelId = `${this._id}-period-label`;

  constructor(
    private _intl: MatDatepickerIntl,
    public _calendar: MatCalendar<D>,
    private _dateAdapter: DateAdapter<D>,
    @Inject(MAT_DATE_FORMATS) private _dateFormats: MatDateFormats,
    cdr: ChangeDetectorRef,
  ) {
    _calendar.stateChanges.pipe(takeUntil(this._destroyed)).subscribe(() => cdr.markForCheck());
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  /** The display text for the current calendar view. */
  get periodButtonText(): string {
    if (this._calendar.currentView == 'month') {
      return this._dateAdapter
        .format(this._calendar.activeDate, this._dateFormats.display.monthYearLabel)
        .toLocaleUpperCase();
    }
    if (this._calendar.currentView == 'year') {
      return this._dateAdapter.getYearName(this._calendar.activeDate);
    }

    return this._intl.formatYearRange(...this._formatMinAndMaxYearLabels());
  }

  /** The aria description for the current calendar view. */
  get periodButtonDescription(): string {
    if (this._calendar.currentView === 'month') {
      return this._dateAdapter
        .format(this._calendar.activeDate, this._dateFormats.display.monthYearLabel)
        .toLocaleUpperCase();
    }
    if (this._calendar.currentView === 'year') {
      return this._dateAdapter.getYearName(this._calendar.activeDate);
    }

    // Format a label for the window of years displayed in the multi-year calendar view. Use
    // `formatYearRangeLabel` because it is TTS friendly.
    return this._intl.formatYearRangeLabel(...this._formatMinAndMaxYearLabels());
  }

  /** The `aria-label` for changing the calendar view. */
  get periodButtonLabel(): string {
    return this._calendar.currentView == 'month'
      ? this._intl.switchToMultiYearViewLabel
      : this._intl.switchToMonthViewLabel;
  }

  /** The label for the previous button. */
  get prevButtonLabel(): string {
    return {
      'month': this._intl.prevMonthLabel,
      'year': this._intl.prevYearLabel,
      'multi-year': this._intl.prevMultiYearLabel,
    }[this._calendar.currentView];
  }

  /** The label for the next button. */
  get nextButtonLabel(): string {
    return {
      'month': this._intl.nextMonthLabel,
      'year': this._intl.nextYearLabel,
      'multi-year': this._intl.nextMultiYearLabel,
    }[this._calendar.currentView];
  }

  /** Handles user clicks on the period label. */
  currentPeriodClicked(): void {
    this._calendar.currentView = this._calendar.currentView == 'month' ? 'multi-year' : 'month';
  }

  /** Handles user clicks on the previous button. */
  previousClicked(): void {
    this._calendar.activeDate =
      this._calendar.currentView == 'month'
        ? this._dateAdapter.addCalendarMonths(this._calendar.activeDate, -1)
        : this._dateAdapter.addCalendarYears(
          this._calendar.activeDate,
          this._calendar.currentView == 'year' ? -1 : -yearsPerPage,
        );
  }

  /** Handles user clicks on the next button. */
  nextClicked(): void {
    this._calendar.activeDate =
      this._calendar.currentView == 'month'
        ? this._dateAdapter.addCalendarMonths(this._calendar.activeDate, 1)
        : this._dateAdapter.addCalendarYears(
          this._calendar.activeDate,
          this._calendar.currentView == 'year' ? 1 : yearsPerPage,
        );
  }

  /** Whether the previous period button is enabled. */
  previousEnabled(): boolean {
    if (!this._calendar.minDate) {
      return true;
    }
    return (
      !this._calendar.minDate || !this._isSameView(this._calendar.activeDate, this._calendar.minDate)
    );
  }

  /** Whether the next period button is enabled. */
  nextEnabled(): boolean {
    return (
      !this._calendar.maxDate || !this._isSameView(this._calendar.activeDate, this._calendar.maxDate)
    );
  }

  /** Whether the two dates represent the same view in the current view mode (month or year). */
  private _isSameView(date1: D, date2: D): boolean {
    if (this._calendar.currentView == 'month') {
      return (
        this._dateAdapter.getYear(date1) == this._dateAdapter.getYear(date2) &&
        this._dateAdapter.getMonth(date1) == this._dateAdapter.getMonth(date2)
      );
    }
    if (this._calendar.currentView == 'year') {
      return this._dateAdapter.getYear(date1) == this._dateAdapter.getYear(date2);
    }
    // Otherwise we are in 'multi-year' view.
    return this.isSameMultiYearView(
      this._dateAdapter,
      date1,
      date2,
      this._calendar.minDate,
      this._calendar.maxDate,
    );
  }

  /**
   * Format two individual labels for the minimum year and maximum year available in the multi-year
   * calendar view. Returns an array of two strings where the first string is the formatted label
   * for the minimum year, and the second string is the formatted label for the maximum year.
   */
  private _formatMinAndMaxYearLabels(): [minYearLabel: string, maxYearLabel: string] {
    // The offset from the active year to the "slot" for the starting year is the
    // *actual* first rendered year in the multi-year view, and the last year is
    // just yearsPerPage - 1 away.
    const activeYear = this._dateAdapter.getYear(this._calendar.activeDate);
    const minYearOfPage =
      activeYear -
      this.getActiveOffset(
        this._dateAdapter,
        this._calendar.activeDate,
        this._calendar.minDate,
        this._calendar.maxDate,
      );
    const maxYearOfPage = minYearOfPage + yearsPerPage - 1;
    const minYearLabel = this._dateAdapter.getYearName(
      this._dateAdapter.createDate(minYearOfPage, 0, 1),
    );
    const maxYearLabel = this._dateAdapter.getYearName(
      this._dateAdapter.createDate(maxYearOfPage, 0, 1),
    );

    return [minYearLabel, maxYearLabel];
  }

  getActiveOffset<D>(
    dateAdapter: DateAdapter<D>,
    activeDate: D,
    minDate: D | null,
    maxDate: D | null,
  ): number {
    const activeYear = dateAdapter.getYear(activeDate);
    return this.euclideanModulo(activeYear - this.getStartingYear(dateAdapter, minDate, maxDate), yearsPerPage);
  }

  getStartingYear<D>(
    dateAdapter: DateAdapter<D>,
    minDate: D | null,
    maxDate: D | null,
  ): number {
    let startingYear = 0;
    if (maxDate) {
      const maxYear = dateAdapter.getYear(maxDate);
      startingYear = maxYear - yearsPerPage + 1;
    } else if (minDate) {
      startingYear = dateAdapter.getYear(minDate);
    }
    return startingYear;
  }

  /** Gets remainder that is non-negative, even if first number is negative */
  euclideanModulo(a: number, b: number): number {
    return ((a % b) + b) % b;
  }

  isSameMultiYearView<D>(
    dateAdapter: DateAdapter<D>,
    date1: D,
    date2: D,
    minDate: D | null,
    maxDate: D | null,
  ): boolean {
    const year1 = dateAdapter.getYear(date1);
    const year2 = dateAdapter.getYear(date2);
    const startingYear = this.getStartingYear(dateAdapter, minDate, maxDate);
    return (
      Math.floor((year1 - startingYear) / yearsPerPage) ===
      Math.floor((year2 - startingYear) / yearsPerPage)
    );
  }
}
