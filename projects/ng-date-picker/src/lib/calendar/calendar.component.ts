/**
 * @(#)calendar.component.scss Sept 07, 2023
 *
 * Custom Calendar Component that manages two side-by-side
 * month views with support for date range selection, hover
 * highlighting, and navigation controls.
 *
 * @author Aakash Kumar
 */
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  Renderer2,
  signal,
  ViewChild,
} from '@angular/core';
import { DateRange, MatCalendar } from '@angular/material/datepicker';
import { ActiveDate } from '../model/active-date.model';
import {
  getDateOfNextMonth,
  getFirstDateOfNextMonth,
  overrideActiveDateSetter,
} from '../utils/date-picker-utilities';
import { ACTIVE_DATE_DEBOUNCE } from '../constant/date-filter-const';

@Component({
  standalone: false,
  selector: 'lib-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent implements AfterViewInit {
  firstViewStartDate = signal(new Date());
  secondViewStartDate = signal(getDateOfNextMonth(this.firstViewStartDate()));
  secondViewMinDate = signal(
    getFirstDateOfNextMonth(this.firstViewStartDate())
  );

  @Input() minDate!: Date;
  @Input() maxDate!: Date;

  @ViewChild('firstCalendarView') firstCalendarView!: MatCalendar<Date>;
  @ViewChild('secondCalendarView') secondCalendarView!: MatCalendar<Date>;

  private _selectedDates!: DateRange<Date> | null;
  private isAllowHoverEvent: boolean = false;
  private cdref = inject(ChangeDetectorRef);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  /**
   * Updates the selected date range and synchronizes both calendar views.
   */
  @Input()
  set selectedDates(selectedDates: DateRange<Date> | null) {
    this._selectedDates = selectedDates;
    if (!selectedDates || !(selectedDates.start && selectedDates.end)) return;

    const startDate = selectedDates.start ?? new Date();
    const endDate = selectedDates.end;
    this.firstViewStartDate.set(startDate);
    this.secondViewMinDate.set(getFirstDateOfNextMonth(startDate));
    const computedEndDate =
      startDate.getMonth() === endDate.getMonth()
        ? getDateOfNextMonth(endDate)
        : endDate;
    this.secondViewStartDate.set(computedEndDate);
  }

  get selectedDates() {
    return this._selectedDates;
  }

  /**
   * Lifecycle hook that is called after Angular has fully initialized
   * the component's view (and child views).
   *
   * Used here to attach hover events and register active date change
   * listeners once the calendar views are available in the DOM.
   */
  ngAfterViewInit(): void {
    this.attachHoverEvent('firstCalendarView');
    this.attachHoverEvent('secondCalendarView');
    this.registerActiveDateChangeEvents();
  }

  /**
   * Handles month selection in the first view.
   *
   * @param event - Selected month date
   */
  monthSelected(viewName: string) {
    if (viewName === 'secondCalendarView') {
      this.removeDefaultFocus(this);
    }
    this.attachHoverEvent(viewName);
  }

  /**
   * Updates the selected date range when a date is clicked.
   *
   * @param date - Date clicked by the user
   */
  updateDateRangeSelection(date: Date | null): void {
    const selectedDates = this.selectedDates;
    if (
      !selectedDates ||
      (selectedDates.start && selectedDates.end) ||
      (selectedDates.start && date && selectedDates.start > date)
    ) {
      this._selectedDates = new DateRange<Date>(date, null);
      this.isAllowHoverEvent = true;
    } else {
      this.isAllowHoverEvent = false;
      this._selectedDates = new DateRange<Date>(selectedDates.start, date);
    }
    this.cdref.markForCheck();
  }

  /**
   * Registers event handlers for active date changes on both calendar views.
   *
   * This method overrides the default `activeDate` property setter of each
   * calendar view to ensure custom handlers are executed whenever the
   * active date changes.
   */
  private registerActiveDateChangeEvents(): void {
    overrideActiveDateSetter(
      this.firstCalendarView,
      this.cdref,
      this.onFirstViewActiveDateChange.bind(this)
    );
    overrideActiveDateSetter(
      this.secondCalendarView,
      this.cdref,
      this.onSecondViewActiveDateChange.bind(this)
    );
  }

  /**
   * Handles the event when the active date of the first calendar view changes.
   *
   * @param activeDate - Object containing `previous` and `current` date values.
   */
  private onFirstViewActiveDateChange(activeDate: ActiveDate): void {
    const handler = this.isPrevious(activeDate)
      ? () => this.handleFirstViewPrevEvent(activeDate)
      : () => this.handleFirstViewNextEvent(activeDate.current);

    // Delay execution because active date event fires before view update
    setTimeout(handler, ACTIVE_DATE_DEBOUNCE);
  }

  /**
   * Handles the event when the active date of the second calendar view changes.
   *
   * @param activeDate - Object containing `previous` and `current` date values.
   */
  private onSecondViewActiveDateChange(activeDate: ActiveDate): void {
    this.attachHoverEvent('secondCalendarView');
  }

  /**
   * Handles the "next" navigation event for the first calendar view.
   *
   * @param currDate - The currently active date in the first calendar view.
   * @param force - Optional flag that can be used to enforce updates (not used in current logic).
   */
  private handleFirstViewNextEvent(currDate: Date, force?: boolean): void {
    if (this.firstCalendarView.currentView.toLocaleLowerCase() !== 'month') {
      return;
    }
    this.attachHoverEvent('firstCalendarView');
    const nextMonthDate = getFirstDateOfNextMonth(currDate);
    let secondViewActiveDate = this.secondCalendarView.activeDate;
    if (nextMonthDate < secondViewActiveDate) {
      this.secondViewMinDate.set(nextMonthDate);
      this.attachHoverEvent('secondCalendarView');
      return;
    }
    secondViewActiveDate = getDateOfNextMonth(currDate);
    this.secondViewMinDate.set(nextMonthDate);
    this.secondCalendarView.activeDate = secondViewActiveDate;
    this.cdref.detectChanges();
  }

  /**
   * Handles the "previous" navigation event for the first calendar view.
   *
   * @param activeDate - Object containing `previous` and `current` date values.
   */
  private handleFirstViewPrevEvent(activeDate: ActiveDate): void {
    if (this.firstCalendarView.currentView.toLocaleLowerCase() !== 'month') {
      return;
    }
    this.secondViewMinDate.set(getFirstDateOfNextMonth(activeDate.current));
    this.attachHoverEvent('firstCalendarView');
    this.attachHoverEvent('secondCalendarView');
  }

  /**
   * Checks whether the previous date is greater than the current date.
   *
   * @param activeDate - Object containing `previous` and `current` date values.
   * @returns `true` if the previous date is later than the current date, otherwise `false`.
   */
  private isPrevious(activeDate: ActiveDate): boolean {
    return activeDate.previous > activeDate.current;
  }

  /**
   * Attaches hover events to all date cells in the first view.
   */
  private attachHoverEvent(viewId: string) {
    const nodes = this.el.nativeElement.querySelectorAll(
      `#${viewId} .mat-calendar-body-cell`
    );
    setTimeout(() => this.addHoverEvents(nodes), ACTIVE_DATE_DEBOUNCE);
  }

  /**
   * Removes active focus from the second view.
   *
   * @param classRef - Reference to this component
   */
  private removeDefaultFocus(classRef: CalendarComponent): void {
    setTimeout(() => {
      const btn: HTMLButtonElement[] =
        classRef.el.nativeElement.querySelectorAll(
          '#secondCalendarView button.mat-calendar-body-active'
        );
      if (btn?.length) {
        btn[0].blur();
      }
    }, 1);
  }

  /**
   * Updates the selection range dynamically on hover.
   *
   * @param date - Hovered date
   */
  private updateSelectionOnMouseHover(date: Date): void {
    const selectedDates = this.selectedDates;
    if (selectedDates?.start && date && selectedDates.start < date) {
      const dateRange: DateRange<Date> = new DateRange<Date>(
        selectedDates.start,
        date
      );
      this.firstCalendarView.selected = dateRange;
      this.secondCalendarView.selected = dateRange;
      this.firstCalendarView['_changeDetectorRef'].markForCheck();
      this.secondCalendarView['_changeDetectorRef'].markForCheck();
      this.isAllowHoverEvent = true;
    }
  }

  /**
   * Attaches hover events to given nodes to update range selection.
   *
   * @param nodes - Date cell nodes
   */
  private addHoverEvents(nodes: any): void {
    if (!nodes) {
      return;
    }
    Array.from(nodes).forEach((button) => {
      this.renderer.listen(button, 'mouseover', (event) => {
        if (this.isAllowHoverEvent) {
          const date = new Date(event.target['ariaLabel']);
          this.updateSelectionOnMouseHover(date);
        }
      });
    });
    this.firstCalendarView['_changeDetectorRef'].markForCheck();
    this.secondCalendarView['_changeDetectorRef'].markForCheck();
  }
}
