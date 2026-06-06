/**
 * Human-readable timedelta / date parsing utilities.
 *
 * Three independent parsers plus a public entry point that combines them:
 *  1. {@link parseIso8601Duration} - ISO 8601 durations (`P7D`, `PT1H30M`),
 *     strict uppercase as required by the spec.
 *  2. {@link parseDateMath} - Grafana/Elasticsearch style date math (`now-7d`).
 *  3. {@link parseNaturalLanguage} - natural language (`7 days ago`) via a
 *     parser the host app registers with {@link setNaturalLanguageParser}
 *     (typically `chrono-node`). No parser registered means this step is a
 *     no-op, so the library never depends on `chrono-node` directly.
 *
 * {@link parseHumanDate} tries all three and accepts lowercase ISO durations.
 */

/**
 * A calendar duration parsed from an ISO 8601 duration string.
 * Each field defaults to 0 when its component is absent.
 */
export interface Duration {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Options for {@link parseHumanDate}.
 */
export interface ParseHumanDateOptions {
  /** Reference "now" used to resolve relative expressions. Defaults to `new Date()`. */
  base?: Date;
  /**
   * Direction applied to a bare ISO 8601 duration: `-1` resolves it to the
   * past (`base - duration`, e.g. "last 7 days"), `1` to the future.
   * Defaults to `-1` to match this picker's "Last N days" vocabulary.
   */
  durationSign?: 1 | -1;
  /**
   * Whether to fall back to the registered natural-language parser.
   * Defaults to `true`. Has no effect if no parser was registered.
   */
  useNaturalLanguage?: boolean;
}

// ISO 8601 duration. Designators are uppercase per spec; `M` is months before
// the `T` separator and minutes after it. Fractions allow `.` or `,`.
// The `(?!$)` guards reject the degenerate `P` and `PT` strings.
const ISO_8601_DURATION =
  /^P(?!$)(?:(\d+(?:[.,]\d+)?)Y)?(?:(\d+(?:[.,]\d+)?)M)?(?:(\d+(?:[.,]\d+)?)W)?(?:(\d+(?:[.,]\d+)?)D)?(?:T(?!$)(?:(\d+(?:[.,]\d+)?)H)?(?:(\d+(?:[.,]\d+)?)M)?(?:(\d+(?:[.,]\d+)?)S)?)?$/;

// Date math: `now` followed by zero or more `±N<unit>` operations.
// Units: y=year, M=month, w=week, d=day, h=hour, m=minute, s=second.
const DATE_MATH = /^now((?:[+-]\d+[yMwdhms])*)$/;
const DATE_MATH_OP = /([+-])(\d+)([yMwdhms])/g;

/**
 * Parses a strict, uppercase ISO 8601 duration string into a {@link Duration}.
 *
 * Spec-compliant: designators must be uppercase, so `P7D` parses but `p7d`
 * does not. Use {@link parseHumanDate} if you need lenient (lowercase) input.
 *
 * @param input - Candidate ISO 8601 duration, e.g. `P1Y2M10DT2H30M`.
 * @returns The parsed duration, or `null` if the string is not a valid duration.
 */
export function parseIso8601Duration(input: string): Duration | null {
  const match = ISO_8601_DURATION.exec(input);
  if (!match) {
    return null;
  }
  const num = (value: string | undefined): number =>
    value === undefined ? 0 : parseFloat(value.replace(',', '.'));
  return {
    years: num(match[1]),
    months: num(match[2]),
    weeks: num(match[3]),
    days: num(match[4]),
    hours: num(match[5]),
    minutes: num(match[6]),
    seconds: num(match[7]),
  };
}

/**
 * Applies a single date-math unit to a date, returning a new Date.
 * Date-level units use calendar-aware setters; the caller guarantees `unit`.
 */
function applyUnit(date: Date, unit: string, amount: number): Date {
  const result = new Date(date.getTime());
  switch (unit) {
    case 'y':
      result.setFullYear(result.getFullYear() + amount);
      break;
    case 'M':
      result.setMonth(result.getMonth() + amount);
      break;
    case 'w':
      result.setDate(result.getDate() + amount * 7);
      break;
    case 'd':
      result.setDate(result.getDate() + amount);
      break;
    case 'h':
      result.setHours(result.getHours() + amount);
      break;
    case 'm':
      result.setMinutes(result.getMinutes() + amount);
      break;
    case 's':
      result.setSeconds(result.getSeconds() + amount);
      break;
  }
  return result;
}

/**
 * Applies a {@link Duration} to a base date, returning a new Date.
 *
 * Calendar units (years, months, weeks, days) use Date setters and are
 * therefore truncated to integers; sub-day units (hours, minutes, seconds)
 * are applied as milliseconds and preserve fractional values.
 *
 * @param base - The date to offset from.
 * @param duration - The duration to apply.
 * @param sign - `1` to add (future), `-1` to subtract (past). Defaults to `1`.
 * @returns A new Date offset from `base`.
 */
export function addDuration(base: Date, duration: Duration, sign: 1 | -1 = 1): Date {
  let result = new Date(base.getTime());
  result = applyUnit(result, 'y', sign * duration.years);
  result = applyUnit(result, 'M', sign * duration.months);
  result.setDate(result.getDate() + sign * (duration.weeks * 7 + duration.days));
  const subDayMs =
    (duration.hours * 3600 + duration.minutes * 60 + duration.seconds) * 1000;
  result.setTime(result.getTime() + sign * subDayMs);
  return result;
}

/**
 * Parses a Grafana/Elasticsearch style date-math expression into a Date.
 *
 * Supports `now` optionally followed by `±N<unit>` operations applied left to
 * right, e.g. `now`, `now-7d`, `now-1M+15d`. Units: `y M w d h m s`
 * (note `M` = month, `m` = minute). Snapping (`/d`) is not supported.
 *
 * @param input - The date-math expression.
 * @param base - Reference "now". Defaults to `new Date()`.
 * @returns The resolved Date, or `null` if the expression is not date math.
 */
export function parseDateMath(input: string, base: Date = new Date()): Date | null {
  const match = DATE_MATH.exec(input);
  if (!match) {
    return null;
  }
  let result = new Date(base.getTime());
  const operations = match[1];
  DATE_MATH_OP.lastIndex = 0;
  let op: RegExpExecArray | null;
  while ((op = DATE_MATH_OP.exec(operations)) !== null) {
    const sign = op[1] === '-' ? -1 : 1;
    const amount = parseInt(op[2], 10);
    result = applyUnit(result, op[3], sign * amount);
  }
  return result;
}

/**
 * Signature of a natural-language date parser, matching `chrono-node`'s
 * `parseDate(text, ref)` export.
 */
export type NaturalLanguageParser = (text: string, ref?: Date) => Date | null;

// A parser registered by the host app via `setNaturalLanguageParser`. The
// library never imports `chrono-node` itself, keeping it a truly optional
// dependency that works the same in browser, SSR, and Node builds.
let registeredParser: NaturalLanguageParser | null = null;

/**
 * Registers a natural-language parser (typically `chrono-node`'s `parseDate`)
 * for {@link parseNaturalLanguage} / {@link parseHumanDate} to use.
 *
 * The consumer imports the package themselves, so their bundler resolves it
 * and this library never references it directly. Call with `null` to disable.
 *
 * @example
 * import * as chrono from 'chrono-node';
 * setNaturalLanguageParser((text, ref) => chrono.parseDate(text, ref));
 *
 * @param parser - The parser to use, or `null` to disable.
 */
export function setNaturalLanguageParser(
  parser: NaturalLanguageParser | null
): void {
  registeredParser = parser;
}

/**
 * Parses natural language (`7 days ago`, `next friday`) using the parser
 * registered via {@link setNaturalLanguageParser}.
 *
 * @param input - The natural-language date expression.
 * @param base - Reference date the parser resolves against. Defaults to `new Date()`.
 * @returns The parsed Date, or `null` if no parser is registered or the text
 *          could not be parsed.
 */
export function parseNaturalLanguage(
  input: string,
  base: Date = new Date()
): Date | null {
  if (!registeredParser) {
    return null;
  }
  try {
    return registeredParser(input, base) ?? null;
  } catch {
    return null;
  }
}

/**
 * Public entry point: parses a human-readable date/duration expression into a
 * concrete Date by trying, in order, date math, ISO 8601 duration, then
 * natural language via the registered parser.
 *
 * Unlike {@link parseIso8601Duration}, this accepts lowercase ISO durations
 * (`p7d`) by upper-casing the input before the ISO attempt.
 *
 * @param input - The expression, e.g. `now-7d`, `P7D`, `p7d`, `3 weeks ago`.
 * @param options - See {@link ParseHumanDateOptions}.
 * @returns The parsed Date, or `null` if nothing matched.
 */
export function parseHumanDate(
  input: string,
  options: ParseHumanDateOptions = {}
): Date | null {
  const base = options.base ?? new Date();
  const durationSign = options.durationSign ?? -1;
  const useNaturalLanguage = options.useNaturalLanguage ?? true;

  const trimmed = input?.trim();
  if (!trimmed) {
    return null;
  }

  // 1. Date math (`now-7d`) - unambiguous and cheap.
  const fromDateMath = parseDateMath(trimmed, base);
  if (fromDateMath) {
    return fromDateMath;
  }

  // 2. ISO 8601 duration - upper-cased so lowercase input is accepted here.
  const duration = parseIso8601Duration(trimmed.toUpperCase());
  if (duration) {
    return addDuration(base, duration, durationSign);
  }

  // 3. Natural language via the registered parser, if any.
  if (useNaturalLanguage) {
    return parseNaturalLanguage(trimmed, base);
  }

  return null;
}
