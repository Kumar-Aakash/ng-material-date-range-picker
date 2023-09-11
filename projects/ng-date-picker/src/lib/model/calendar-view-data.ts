import { DateRange } from '@angular/material/datepicker';

export class CalendarViewData {
  startDate!: Date;
  minDate!: Date;
  selectedDates!: DateRange<Date>;
}
