import { Input, Component, ViewChild } from '@angular/core';
import { DateRange, MatCalendar } from '@angular/material/datepicker';
import { CalendarViewData } from './../model/calendar-view-data';
/**
 * @(#)calendar.component.scss Sept 07, 2023

 * @author Aakash Kumar
 */

@Component({
  selector: 'lib-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent {
  firstCalendarViewData!: CalendarViewData;
  secondCalendarViewData!: CalendarViewData;
  @Input() selectedDates!: DateRange<Date>;

  @ViewChild('firstCalendarView') firstCalendarView!: MatCalendar<Date>;
  @ViewChild('secondCalendarView') secondCalendarView!: MatCalendar<Date>;
}
