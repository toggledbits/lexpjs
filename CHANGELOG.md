# CHANGELOG for lexpjs

**NOTE:** In order to *build* lexpjs with Unicode-friendly identifiers enabled (if, for some reason, the included pre-built `lexp.js` file doesn't suit your needs), you first need to modify *jison-lex* to allow Unicode property escapes in its *RegExp*s. See `README-lexer.md` for details.

## 1.0.23321

* Fix degenerate case of `case` statement with a single `when` and an `else` (which is really an `if` made complex).

## 1.0.23297

* Add `range()` function with more flexibility than short-cut range operator (`..`).

## 1.0.23296

* Add `asin()`, `acos()`, `atan()` and `atan2()`, which function identically to their JavaScript `Math` library counterparts.
* Add `pi` (lowercase) as reserved word; gives the value of `Math.PI`.
* Test function extended to allow function for expected result (i.e. function returns boolean `true` for valid expression result, `false` otherwise).

## 1.0.23055

* Add `quote()` function

## 1.0.22347

* Resolve what I feel to be an inconsistency in JavaScript's implementation of `isNaN()`. In JS, if you pass `null`, the result is *false*, but passing `null` to `parseInt()` or `parseFloat()` will return `NaN`. I think these should behave consistently, so I've modified *lexpjs*' `isNaN()` to return *true* when its argument is `null` (i.e. `null` is not a number). The JS behavior was discovered/verified in *nodejs* 16.13.1 and Chrome browser 108.0.5359.98.

## 1.0.22307

* Improve `if...then...else...endif` with addition of `elif <cond> then <expr-list>` alternates.

## 22203

* Improve `time()` string parsing so that time-only strings (`HH:MM[:SS[.TTT]]`) are correctly parsed, and date-only strings are supported (within the limited of parsing of the JavaScript `Date` constructor, which handles many common forms). Time-only strings will be converted to the given time on the current date (in the current timezone). Date-only strings will return midnight as the time component (in the current timezone).

## Earlier versions

The CHANGELOG was first produced for version 22203; please refer to Github commit comments for details prior to this version.
