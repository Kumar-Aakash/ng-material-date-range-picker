import { DateRange } from '@angular/material/datepicker';
import { ISelectDateOption } from './select-date-option.model';

export interface SelectedDateEvent {
  range: DateRange<Date> | null;
  selectedOption: ISelectDateOption | null;
}
