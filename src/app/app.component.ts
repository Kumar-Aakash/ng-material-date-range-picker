import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import moment from 'moment';

import { DatePickerSettings } from './models/date-picker-settings.model';
import { DatePickerConstant } from './constants/date-picker.constant';
import { DateTimeParser } from './models/datetime-parser.model';
import { SelectedDateEvent } from '../../projects/ng-date-picker/src/lib/model/date-selection-event-data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private timezoneDate: string | undefined;
  dateFormat = 'YYYY-MM-DD';
  calendarIdentifier = 'exo-date-range-picker';

  /** Flag shows that dates been updated from inputs */
  isDatesUpdatedFromInput = false;
  todaysDate: moment.Moment | undefined;
  yesterdayDate: moment.Moment | undefined;
  lastSevenDaysDate: moment.Moment | undefined;
  lastThirtyDaysDate: moment.Moment | undefined;
  thisMonthStartDate: moment.Moment | undefined;
  thisMonthEndDate: moment.Moment | undefined;
  lastMonthStartDate: moment.Moment | undefined;
  lastMonthEndDate: moment.Moment | undefined;
  daterangepickerOptions: DatePickerSettings;
  isSettingsLoaded = false;

  constructor(private translate: TranslateService) {
    this.daterangepickerOptions = new DatePickerSettings(new Date(), new Date());
    this.loadTranslations();
  }

  /** @ignore - Ignore for docs in storybook */
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Set the picker input label, update the range picker values and send event emitter with the range selected
   */
  onDatesUpdated(event: SelectedDateEvent): void {
    console.log('changed dates', event);
    // then use the values
  }

  /**
   * Load default date picker settings
   */
  private loadDatePickerSettings(): void {
    if (!this.timezoneDate) {
      this.timezoneDate = DateTimeParser.getBaseDate('Europe/Lisbon').format();
    }

    this.todaysDate = moment(this.timezoneDate);
    this.yesterdayDate = moment(this.timezoneDate).subtract(1, 'day');
    this.lastSevenDaysDate = moment(this.timezoneDate).subtract(6, 'day');
    this.lastThirtyDaysDate = moment(this.timezoneDate).subtract(29, 'day');
    this.thisMonthStartDate = moment(this.timezoneDate).startOf('month');
    this.thisMonthEndDate = moment(this.timezoneDate).endOf('month');
    this.lastMonthStartDate = moment(this.timezoneDate).subtract(1, 'month').startOf('month');
    this.lastMonthEndDate = moment(this.timezoneDate).subtract(1, 'month').endOf('month');

    // dates enabled will start in the 1st of January of last year
    this.daterangepickerOptions.minDate = moment(new Date(this.timezoneDate),
      DatePickerConstant.usInputDateFormat).subtract(1, 'year').startOf('year').toDate();
    // dates enabled will end today
    this.daterangepickerOptions.maxDate = moment(new Date(this.timezoneDate),
      DatePickerConstant.usInputDateFormat).toDate();

    // if the date was updated from the input, we skip setting the start and end dates
    if (!this.isDatesUpdatedFromInput) {
      // initially loaded start date - set to begin of the current month
      this.daterangepickerOptions.startDate = this.lastSevenDaysDate.toDate();
      this.daterangepickerOptions.endDate = this.todaysDate.toDate();
    }

    this.daterangepickerOptions.locale = 'pt';
    this.daterangepickerOptions.timezone = 'Europe/Lisbon';

    this.isSettingsLoaded = true;
  }

  private loadTranslations(): void {
    this.translate.get([
      'Apply', 'Cancel', 'Date', 'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month', 'Custom range'
    ])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(translMessages => {
        this.daterangepickerOptions.labels = {
          inputLabel: translMessages['Date'],
          applyLabel: translMessages['Apply'],
          cancelLabel: translMessages['Cancel'],
          todayLabel: translMessages['Today'],
          yesterdayLabel: translMessages['Yesterday'],
          last7daysLabel: translMessages['Last 7 Days'],
          last30daysLabel: translMessages['Last 30 Days'],
          thisMonthLabel: translMessages['This Month'],
          lastMonthLabel: translMessages['Last Month'],
          customRangeLabel: translMessages['Custom range'],
        }

        this.loadDatePickerSettings();
      });
  }
}
