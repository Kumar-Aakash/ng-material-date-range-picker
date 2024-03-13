import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';

import { DatePickerSettings } from './models/date-picker-settings.model';
import { Subject } from 'rxjs';
import { DateRangePickerLabels } from './models/date-range-picker-labels.model';
import { DatePickerConstant } from './constants/date-picker.constant';
import moment from 'moment';
import { DateTimeParser } from './models/datetime-parser.model';
import { DateRange } from '@angular/material/datepicker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy, AfterViewInit {
  /** @ignore - Ignore property for docs in storybook */
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private timezoneDate: string | undefined;
  title = 'exogroup-date-range-picker';
  panelOpenState = false;

    /** Set default timezone to moment DON'T TOUCH ORDER THIS timezone @Input SHOULD BE THE FIRST */
  @Input() set timezone(timezone: string) {
    if (timezone) {
      this._timezone = timezone;
      this.timezoneDate = new Date().toLocaleString('en', { timeZone: timezone });
    }
  }
  get timezone(): string {
    return <string>this._timezone;
  }
    /** Flag to notify the component to reset the dates to default configuration */
  @Input() set resetDates(reset: boolean) {
    this._resetDates = reset;

    if (reset) {
      this.daterangepickerOptions.startDate = this.thisMonthStartDate;
      this.daterangepickerOptions.endDate = this.thisMonthEndDate;
      this.onDatesUpdated();
      this.isDatesUpdatedFromInput = true;
      this.resetDates = false;
    }
  }
  get resetDates(): boolean {
    return <boolean>this._resetDates;
  }

    /** set filter name for number range picker */
  @Input() dateRangeLabel: any;

    /**
     * Range Picker preset labels - displayed on top of the picker window
     * Use this input to provide translations, if not defined the labels will not display
     */
  @Input() set labels(labels: DateRangePickerLabels) {
    this._labels = labels;

    this.loadTranslations();
  }

  get labels(): DateRangePickerLabels {
    return <DateRangePickerLabels>this._labels;
  }

    /** Max date allowed for range picker*/
  @Input() set maxDate(maxDate: moment.Moment) {
    this._maxDate = maxDate;
    this.updateDateRangeLimits(DatePickerConstant.dateTypes.max, this._maxDate);
  }
  get maxDate(): moment.Moment {
    return <moment.Moment>this._maxDate;
  }

    /** Min date allowed for range picker*/
  @Input() set minDate(minDate: moment.Moment) {
    this._minDate = minDate;
    this.updateDateRangeLimits(DatePickerConstant.dateTypes.min, this._minDate);
  }
  get minDate(): moment.Moment {
    return <moment.Moment>this._minDate;
  }

    /** Start date for range picker*/
  @Input() set startDate(startDate: moment.Moment) {
    this._startDate = startDate;
    this.updateDefaultDates(DatePickerConstant.dateTypes.start, this._startDate);
  }
  get startDate(): moment.Moment {
    return <moment.Moment>this._startDate;
  }

    /** End date for range picker*/
  @Input() set endDate(endDate: moment.Moment) {
    this._endDate = endDate;
    this.updateDefaultDates(DatePickerConstant.dateTypes.end, this._endDate);
  }

    /** Flag for disable date-range-picker*/
  @Input() disabled = false;

    /** set flag for open modal after view init */
  @Input() openAfterViewInit = false;

  get endDate(): moment.Moment {
    return <moment.Moment>this._endDate;
  }

    /** Send event with selected date range */
  @Output() dateRange = new EventEmitter<{ dateFrom: string; dateTo: string; label: string | null | undefined; }>();

  @Input() isFullWidth: boolean | undefined;

  private _resetDates: boolean | undefined;
  private _labels: DateRangePickerLabels | undefined;
  private _maxDate: moment.Moment | undefined;
  private _minDate: moment.Moment | undefined;
  private _startDate: moment.Moment | undefined;
  private _endDate: moment.Moment | undefined;
  private _timezone: string | undefined;

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
  applyLabel = 'Apply';

  currentLabel: string | null | undefined;

  currentValue: string | null | undefined;

  selectedDates: DateRange<Date> | undefined;

  isSettingsLoaded = false;

  constructor(
    private translate: TranslateService,
) {
    this.daterangepickerOptions = new DatePickerSettings(new Date(), new Date());
    this.loadTranslations();
  }

  ngAfterViewInit(): void {
    // setTimeout(() => this.openAfterViewInit && this.pickerDirective.open());
}

  /** @ignore - Ignore for docs in storybook */
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Set the picker input label, update the range picker values and send event emitter with the range selected
   */
  onDatesUpdated(): void {
    // (this.datepickerForm.get('selected') as AbstractControl).patchValue({
    //   startDate: this.daterangepickerOptions.startDate,
    //   endDate: this.daterangepickerOptions.endDate,
    // });
  }

  /**
   * Toggle date picker on calendar icon click
   */
  onOpenDatepicker(): void {
    // this.pickerDirective.toggle();
  }

  /**
   * Load default date picker settings
   */
  private loadDatePickerSettings(): void {
    this.daterangepickerOptions.options = {
      format: 'YYYY-MM-DD',
      displayFormat: 'YYYY-MM-DD',
      firstDay: 1,
      applyLabel: this.applyLabel?.toUpperCase(),
    };
    if (!this.timezoneDate) {
      this.timezoneDate = DateTimeParser.getBaseDate().format();
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
      this.daterangepickerOptions.startDate = this.lastSevenDaysDate;
      this.daterangepickerOptions.endDate = this.todaysDate;
    }
    // Default settings
    this.daterangepickerOptions.showApplyButton = true;
    this.daterangepickerOptions.showCancelButton = true;
    this.daterangepickerOptions.showCustomRangeLabel = true;
    this.daterangepickerOptions.showCancelButton = true;
    this.daterangepickerOptions.showDropdowns = true;
    this.daterangepickerOptions.showRangeLabelOnInput = true;
    this.daterangepickerOptions.keepCalendarOpeningWithRange = false;
    this.daterangepickerOptions.alwaysShowCalendars = true;
    // Set range labels when provided
    if (this.labels) {
      this.daterangepickerOptions.ranges = {
        [this.labels.today]: [ this.todaysDate, this.todaysDate ],
        [this.labels.yesterday]: [ this.yesterdayDate, this.yesterdayDate ],
        [this.labels.lastSevenDays]: [ this.lastSevenDaysDate, this.todaysDate ],
        [this.labels.lastThirtyDays]: [ this.lastThirtyDaysDate, this.todaysDate ],
        [this.labels.thisMonth]: [ this.thisMonthStartDate, this.thisMonthEndDate ],
        [this.labels.lastMonth]: [ this.lastMonthStartDate, this.lastMonthEndDate ],
      };
    }

    this.isSettingsLoaded = true;
  }

  /**
   * Update date range limits
   *
   * @param type
   *
   * @param date
   */
  private updateDateRangeLimits(type: string, date?: moment.Moment): void {
      if (type === DatePickerConstant.dateTypes.min) {
      this.daterangepickerOptions.minDate = date?.toDate() || moment(this.timezoneDate).subtract(1, 'year').toDate();
    }
    if (type === DatePickerConstant.dateTypes.max) {
      this.daterangepickerOptions.maxDate = date?.toDate() || moment(this.timezoneDate).toDate();
    }
  }

  /**
   * Update date default
   *
   * @param type
   *
   * @param date
   */
  private updateDefaultDates(type: string, date?: moment.Moment): void {
      if (type === DatePickerConstant.dateTypes.start) {
      this.daterangepickerOptions.startDate = date || this.thisMonthStartDate;
    }
    if (type === DatePickerConstant.dateTypes.end) {
      this.daterangepickerOptions.endDate = date || this.thisMonthEndDate;
    }
    // if (this.datepickerForm) {
    //   this.onDatesUpdated();
    // }

    this.isDatesUpdatedFromInput = true;
  }

  /**
   * Fix for date picker owerflows right border of page
   */
  editDateRangePickerPosition(): void {
    const clientWidth = document.body.clientWidth;
    const datepicker = Array.from(document.getElementsByClassName('md-drppicker')) as HTMLElement[];
    const datepickerInputField = Array.from(document.getElementsByClassName('exo-date-range-picker')) as HTMLElement[];

    datepicker.forEach((element, index) => {
      const datepickerWidth = element.getBoundingClientRect().width;
      const datepickerPositionX = datepickerInputField[index].getBoundingClientRect().x;
      if (datepickerPositionX > clientWidth - datepickerWidth) {
        const margin = -(datepickerWidth - (clientWidth - datepickerPositionX) + 10);
        element.style.marginLeft = margin + 'px';
      }
    });
  }

  private loadTranslations(): void {
    this.translate.get([
      'Apply', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
      'Sep', 'Oct', 'Nov', 'Dec', 'Custom range',
    ])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(translMessages => {
        this.applyLabel = translMessages.Apply;

        this.loadDatePickerSettings();
        // if (!this.datepickerForm) {
        //   this.datepickerForm = this.fb.group({
        //     selected: [{
        //       startDate: this.daterangepickerOptions.startDate,
        //       endDate: this.daterangepickerOptions.endDate,
        //     }],
        //   });
        //
        //   this.datepickerForm.valueChanges
        //     .pipe(takeUntil(this.ngUnsubscribe))
        //     .subscribe(formValue => {
        //       const { startDate, endDate } = formValue.selected;
        //       const formattedDateFrom = startDate.format('YYYY-MM-DD');
        //       const formattedDateTo = endDate.format('YYYY-MM-DD');
        //
        //       if (this.currentLabel === undefined) {
        //         this.currentLabel = 'Last 7 Days';
        //       }
        //
        //       this.dateRange.emit({ dateFrom: formattedDateFrom, dateTo: formattedDateTo, label: this.currentLabel });
        //     });
        // }

        this.onDatesUpdated();
      });
  }
}
