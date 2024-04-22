import { LabelsConfig } from '../../../projects/ng-date-picker/src/lib/model/labels-config.model';

export class DatePickerSettings {
  constructor(
    public minDate: Date,
    public maxDate: Date,
    public startDate?: Date | undefined,
    public endDate?: Date | undefined,
    public locale?: string,
    public labels?: LabelsConfig | undefined,
    public timezone?: string | undefined
  ) {
    // do nothing
  }
}
