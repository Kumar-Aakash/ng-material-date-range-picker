# Changelog
## [2.3.0] - 2025-09-18
### Added
- Introduced **Signals** for managing state changes.

### Enhanced
- Improved handling of the **second view** for better user experience.

### Fixed
- Start date not showing in the first view when selecting a custom range.
- Fixed hover issues on second view.
- Fixed Custom range not visible properly.
- Resolved flickering issues in the date picker.
- Fixed Custom Button issue on static calendar.

### Breaking Changes
- Renamed `DEFAULT_DATE_OPTION_ENUM` to `DATE_OPTION_TYPE`.
- Replaced `optionKey` with `optionType` in `ISelectDateOption`.

## [2.2.9] - 2025-08-21
- Added support for displaying the selected date range in a specified date format on the calendar.  
- Added a button to for suffix icons. 

## [2.2.8] - 2024-08-29
- Supported control on cdkConnectedOverlayPositions.
- Added staticOptionId - to set id for static options
- Added dynamicOptionId - to set id for dynamic options
- Bugfixes

## [2.2.7] - 2024-08-22
- Supported control on cdkConnectedOverlayOpen.
- Bugfixes

## [2.2.6] - 2024-08-15
- Supported cloned dates.

## [2.2.5] - 2024-08-14
- Bugfixes
- Added support to show selected option label.

## [2.2.4] - 2024-06-16
- Bugfixes
- Added clear functionality.

## [2.2.3] - 2024-03-24
- Bugfixes
- Custom option selection on specifying the selected dates.

## [2.2.2] - 2024-03-23
- Added changes to show default dates in input box.
- Supported default option on init.
- Fixed bug on last month selection.

## [2.2.1] - 2024-03-16
- Fixed issue on second calendar view.

## [2.2.0] - 2024-03-14
- Added min and max date support.
- Exposed Id for dropdown and calendar.
- Exposed option to control default options.
- Supported default date selection based on default option selection.
- Added backdrop click operations on calendar.
- Added Dynamic Label Feature For Input Field. 

## [2.1.0] - 2024-01-01
- Exposed Enum.
- Exposed positioning attributes for cdkConnectedOverlay
- Fixed bugs bugs around conflicting css with bootstrap.
- Added attributes for to show options list as static list.
- Fixed position related bugs for static position.

## [2.0.0] - 2023-12-08
- Upgraded Angular 16 to Angular 17 Version
- Replaced existing directives with Angular 17 directives
- Updated readme file.
