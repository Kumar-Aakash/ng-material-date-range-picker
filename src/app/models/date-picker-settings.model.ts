import moment from 'moment';
import { LocaleConfig } from '../../../projects/ng-date-picker/src/lib/model/locale-config.model';

export interface Range {
  [label: string]: [moment.Moment, moment.Moment];
}

export class DatePickerSettings {
  constructor(
    public minDate: Date,
    public maxDate: Date,
    public startDate?: moment.Moment | undefined,
    public endDate?: moment.Moment | undefined,
    public options?: LocaleConfig,
    public ranges?: Range,
    public alwaysShowCalendars?: boolean,
    public showDropdowns?: boolean,
    public autoApplyChanges?: boolean,
    public closeOnAutoApply?: boolean,
    public showRanges?: boolean,
    public showApplyButton?: boolean,
    public showCancelButton?: boolean,
    public locale?: boolean,
    public showCustomRangeLabel?: boolean,
    public keepCalendarOpeningWithRange?: boolean,
    public showRangeLabelOnInput?: boolean,
    public autoUpdateInput?: boolean,
    public showWeekNumbers?: boolean,
    public showClearButton?: boolean,
  ) {
    // do nothing
  }
}
