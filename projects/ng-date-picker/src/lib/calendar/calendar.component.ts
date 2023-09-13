/**
 * @(#)calendar.component.scss Sept 07, 2023

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
  ViewChild,
} from '@angular/core';
import { DateRange, MatCalendar } from '@angular/material/datepicker';
import { CalendarViewData } from './../model/calendar-view-data';
import * as moment from 'moment';

@Component({
  selector: 'lib-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent implements AfterViewInit {
  firstCalendarViewData!: CalendarViewData;
  secondCalendarViewData!: CalendarViewData;
  @Input() selectedDates!: DateRange<Date>;

  @ViewChild('firstCalendarView') firstCalendarView!: MatCalendar<Date>;
  @ViewChild('secondCalendarView') secondCalendarView!: MatCalendar<Date>;

  constructor(
    private cdref: ChangeDetectorRef,
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.initFirstCalendar();
    this.initSecondCalendar();
  }

  ngAfterViewInit(): void {
    this.addFirstCalendarButtonEvents();
  }

  /**
   * This method handles first calendar view month selection.
   *
   * @param event Date
   */
  monthSelected(event: Date) {
    this.secondCalendarView._goToDateInView(event, 'year');
    this.handleFirstCalendarNextEvent(this, true);
  }

  /**
   * This method updates the date selection range.
   *
   * @param date Date
   */
  updateDateRangeSelection(date: Date | null) {
    const selectedDates = this.selectedDates;
    if (
      !selectedDates ||
      (selectedDates.start && selectedDates.end) ||
      (selectedDates.start && date && selectedDates.start > date)
    ) {
      this.selectedDates = new DateRange<Date>(date, null);
    } else {
      this.selectedDates = new DateRange<Date>(selectedDates.start, date);
    }
    this.cdref.markForCheck();
  }

  /**
   * This method handles First calendar prev button event.
   * @param classRef CalendarComponent
   */
  private handleFirstCalDatePrevEvent(classRef: CalendarComponent): void {
    const leftDateCalender = classRef.firstCalendarView;
    if (leftDateCalender.currentView.toLocaleLowerCase() === 'month') {
      const date: Date = new Date(leftDateCalender['_clampedActiveDate']);
      classRef.secondCalendarView.minDate =
        classRef.getFirstDateOfNextMonth(date);
      classRef.cdref.markForCheck();
    }
  }

  /**
   * This method handle the next button event.
   *
   * @param classRef CalendarComponent
   * @param isForced boolean
   */
  private handleFirstCalendarNextEvent(
    classRef: CalendarComponent,
    isForced = false
  ): void {
    const firstCalendar = classRef.firstCalendarView;
    if (firstCalendar.currentView.toLocaleLowerCase() === 'month' || isForced) {
      const date: Date = new Date(firstCalendar['_clampedActiveDate']);
      const nextMonthDate = classRef.getFirstDateOfNextMonth(date);
      classRef.secondCalendarView.minDate = nextMonthDate;
      classRef.secondCalendarView._goToDateInView(nextMonthDate, 'month');
      setTimeout(() => {
        const btn: HTMLButtonElement[] =
          classRef.el.nativeElement.querySelectorAll(
            '#secondCalendarView button.mat-calendar-body-active'
          );
        if (btn?.length) {
          btn[0].blur();
        }
      }, 1);
      classRef.cdref.markForCheck();
    }
  }

  /**
   * This method attaches next and prev events on buttons.
   *
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
   * This method attach the next and prev events on specified nodes.
   *
   * @param nodes any
   * @param handler Function
   */
  private attachClickEvent(nodes: any, handler: Function): void {
    if (nodes) {
      Array.from(nodes).forEach((button) => {
        this.renderer.listen(button, 'click', () => {
          handler(this);
        });
      });
    }
  }

  /**
   * This method initialize data for first calendar view.
   */
  private initFirstCalendar(): void {
    this.firstCalendarViewData = new CalendarViewData();
    this.firstCalendarViewData.startDate = new Date();
  }

  /**
   * This method initialize data for second calendar view.
   */
  private initSecondCalendar(): void {
    const currDate = new Date();
    this.secondCalendarViewData = new CalendarViewData();
    this.secondCalendarViewData.minDate =
      this.getFirstDateOfNextMonth(currDate);
    currDate.setMonth(currDate.getMonth() + 1);
    this.secondCalendarViewData.startDate = currDate;
  }

  /**
   * This method returns the next months first date.
   *
   * @param currDate Date
   * @returns Date
   */
  private getFirstDateOfNextMonth(currDate: Date): Date {
    return new Date(currDate.getFullYear(), currDate.getMonth() + 1, 1);
  }
}
