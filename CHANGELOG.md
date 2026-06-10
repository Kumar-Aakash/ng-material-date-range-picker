# Changelog

## [6.2.0] - 2026-06-10
- supported auto select predefined date option from date range.
- Added `ndp-` class prefix to replace all `custom-` prefixs. `custom-` is deprecated and may be removed in a future version.
- Added `parseHumanDate` for parsing human-readable dates: date math (`now-7d`), ISO 8601 durations (`p7d`), and optional natural language via `setNaturalLanguageParser` (e.g. `chrono-node`).
- Added `enableEditableDates` to edit the custom range through two inputs that accept a `dateFormat` date or the expressions above, with validation.
- Added `displaySelectedExpression` to show the relative expressions (e.g. `now-7d - now`) in the main input.
- `onDateSelectionChanged` (`SelectedDateEvent`) now also emits `startExpr` / `endExpr`.
- Fixed the selected option not showing as highlighted when reopening the dropdown.

## [6.1.0] - 2026-05-04
- Added support for single date selection

## [6.0.0] - 2026-01-12
- Upgraded from Angular 20 to Angular 21
- Upgraded from Angular Material 20 to Angular Material 21

