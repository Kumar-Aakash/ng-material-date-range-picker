import { DateRange } from '@angular/material/datepicker';
import { ISelectDateOption } from './select-date-option.model';

export interface SelectedDateEvent {
  range: DateRange<Date> | null;
  selectedOption: ISelectDateOption | null;
  /**
   * Human-readable expression for the range start: the user's own input (e.g.
   * `now-7d`) when editing, the relative form of a day-diff option, otherwise
   * the absolute formatted date. `null` when the selection is cleared.
   */
  startExpr: string | null;
  /** Human-readable expression for the range end. See {@link startExpr}. */
  endExpr: string | null;
}
