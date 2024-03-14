import moment from 'moment';
import { LabelsConfig } from '../../../projects/ng-date-picker/src/lib/model/labels-config.model';

export interface Range {
  [label: string]: [moment.Moment, moment.Moment];
}

export class DatePickerSettings {
  constructor(
    public minDate: Date,
    public maxDate: Date,
    public startDate?: moment.Moment | undefined,
    public endDate?: moment.Moment | undefined,
    public locale?: string,
    public labels?: LabelsConfig | undefined
  ) {
    // do nothing
  }
}
