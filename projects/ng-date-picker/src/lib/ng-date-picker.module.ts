/**
 * @(#)ng-date-picker.module.ts Sept 05, 2023
 *
 * @author Aakash Kumar
 */
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { BrowserModule } from '@angular/platform-browser';
import { CalendarComponent } from './calendar/calendar.component';
import { NgDatePickerComponent } from './ng-date-picker.component';

@NgModule({
  declarations: [NgDatePickerComponent, CalendarComponent],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatAutocompleteModule,
    OverlayModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  exports: [NgDatePickerComponent],
})
export class NgDatePickerModule {}
