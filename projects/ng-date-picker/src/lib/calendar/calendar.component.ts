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
  Input,
  Renderer2,
  signal,
  ViewChild,
} from '@angular/core';
import { DateRange, MatCalendar } from '@angular/material/datepicker';
import {
  getDateOfNextMonth,
  getFirstDateOfNextMonth,
} from '../utils/date-picker-utilities';

@Component({
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
  private _selectedDates!: DateRange<Date> | null;
  @Input() minDate!: Date;
  @Input() maxDate!: Date;
  private isAllowHoverEvent: boolean = false;

  @ViewChild('firstCalendarView') firstCalendarView!: MatCalendar<Date>;
  @ViewChild('secondCalendarView') secondCalendarView!: MatCalendar<Date>;

  constructor(
    private cdref: ChangeDetectorRef,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

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

  ngAfterViewInit(): void {
    this.addFirstCalendarButtonEvents();
    this.attachHoverEventOnFirstViewDates();
    this.attachHoverEventOnSecondViewDates();
    this.addSecondCalendarButtonEvents();
  }

  /**
   * Attaches hover events to all date cells in the second view.
   */
  attachHoverEventOnSecondViewDates() {
    const nodes = this.el.nativeElement.querySelectorAll(
      '#secondCalendarView .mat-calendar-body-cell'
    );
    setTimeout(() => this.addHoverEvents(nodes), 200);
  }

  /**
   * Handles month selection in the second view.
   *
   * @param event - Selected month date
   */
  secondViewMonthSelected(event: Date) {
    this.removeDefaultFocus(this);
    setTimeout(() => {
      this.attachHoverEventOnSecondViewDates();
    }, 300);
  }

  /**
   * Handles month selection in the first view.
   *
   * @param event - Selected month date
   */
  monthSelected(event: Date) {
    this.secondCalendarView._goToDateInView(event, 'year');
    setTimeout(() => this.handleFirstCalendarNextEvent(this, true), 1);
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
      this.selectedDates = new DateRange<Date>(date, null);
      this.isAllowHoverEvent = true;
    } else {
      this.isAllowHoverEvent = false;
      this.selectedDates = new DateRange<Date>(selectedDates.start, date);
    }
    this.cdref.markForCheck();
  }

  /**
   * Handles the first calendar's "previous" button click.
   *
   * @param classRef - Reference to this component
   */
  private handleFirstCalDatePrevEvent(classRef: CalendarComponent): void {
    const leftDateCalender = classRef.firstCalendarView;
    if (leftDateCalender.currentView.toLocaleLowerCase() === 'month') {
      const date: Date = new Date(leftDateCalender['_clampedActiveDate']);
      classRef.secondViewMinDate.set(getFirstDateOfNextMonth(date));
      classRef.cdref.markForCheck();
    }
    classRef.attachHoverEventOnFirstViewDates();
  }

  /**
   * Attaches hover events to all date cells in the first view.
   */
  private attachHoverEventOnFirstViewDates() {
    const nodes = this.el.nativeElement.querySelectorAll(
      '#firstCalendarView .mat-calendar-body-cell'
    );
    setTimeout(() => this.addHoverEvents(nodes), 200);
  }

  /**
   * Handles the first calendar's "next" button click.
   *
   * @param classRef - Reference to this component
   * @param isForced - Whether to force navigation
   */
  private handleFirstCalendarNextEvent(
    classRef: CalendarComponent,
    isForced = false
  ): void {
    const firstCalendar = classRef.firstCalendarView;
    if (firstCalendar.currentView.toLocaleLowerCase() === 'month' || isForced) {
      const date: Date = new Date(firstCalendar['_clampedActiveDate']);
      const nextMonthDate = getFirstDateOfNextMonth(date);
      classRef.secondViewMinDate.set(getFirstDateOfNextMonth(nextMonthDate));
      classRef.secondCalendarView._goToDateInView(nextMonthDate, 'month');
      classRef.removeDefaultFocus(classRef);
      classRef.cdref.markForCheck();
    }
    setTimeout(() => {
      classRef.attachHoverEventOnFirstViewDates();
      classRef.attachHoverEventOnSecondViewDates();
    }, 300);
  }

  /**
   * Removes active focus from the second view.
   *
   * @param classRef - Reference to this component
   */
  removeDefaultFocus(classRef: CalendarComponent): void {
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
   * Attaches "next" and "previous" button events in the first calendar view.
   */
  private addFirstCalendarButtonEvents(): void {
    const monthPrevBtn = this.el.nativeElement.querySelectorAll(
      '#firstCalendarView .mat-calendar-previous-button'
    );
    const monthNextBtn = this.el.nativeElement.querySelectorAll(
      '#firstCalendarView .mat-calendar-next-button'
    );
    this.attachClickEvent(monthPrevBtn, this.handleFirstCalDatePrevEvent);
    this.attachClickEvent(monthNextBtn, this.handleFirstCalendarNextEvent);
  }

  /**
   * Attaches "next" and "previous" button events in the second calendar view.
   */
  private addSecondCalendarButtonEvents(): void {
    const monthPrevBtn: any[] = this.el.nativeElement.querySelectorAll(
      '#secondCalendarView .mat-calendar-previous-button'
    );
    const monthNextBtn: any[] = this.el.nativeElement.querySelectorAll(
      '#secondCalendarView .mat-calendar-next-button'
    );
    if (!monthPrevBtn || !monthNextBtn) {
      return;
    }
    this.attachClickEvent(monthPrevBtn, this.attachHoverEventOnSecondViewDates);
    this.attachClickEvent(monthNextBtn, this.attachHoverEventOnSecondViewDates);
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
  }

  /**
   * Attaches click events to given nodes for navigation.
   *
   * @param nodes - Navigation button nodes
   * @param handler - Event handler function
   */
  private attachClickEvent(nodes: any, handler: Function): void {
    if (!nodes) {
      return;
    }
    Array.from(nodes).forEach((button) => {
      this.renderer.listen(button, 'click', () => {
        handler(this);
      });
    });
  }
}
