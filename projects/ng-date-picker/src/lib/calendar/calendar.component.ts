/**
 * @(#)calendar.component.scss Sept 07, 2023

 * @author Aakash Kumar
 */

import {
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
export class CalendarComponent {
  firstCalendarViewData!: CalendarViewData;
  secondCalendarViewData!: CalendarViewData;
  @Input() selectedDates!: DateRange<Date>;

  @ViewChild('firstCalendarView') firstCalendarView!: MatCalendar<Date>;
  @ViewChild('secondCalendarView') secondCalendarView!: MatCalendar<Date>;

  constructor(private cdref: ChangeDetectorRef) {
    this.initFirstCalendar();
    this.initSecondCalendar();
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
      moment(selectedDates.start).isAfter(date)
    ) {
      this.selectedDates = new DateRange<Date>(date, null);
    } else {
      this.selectedDates = new DateRange<Date>(selectedDates.start, date);
    }
    this.cdref.markForCheck();
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
