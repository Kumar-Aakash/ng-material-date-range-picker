import { DateRange } from '@angular/material/datepicker';
import { ISelectDateOption } from './select-date-option';

export interface SelectedDateEvent {
  range: DateRange<Date> | null;
  selectedOption: ISelectDateOption | null;
}
