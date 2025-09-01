# CHANGELOG for lexpjs

**NOTE:** In order to *build* lexpjs with Unicode-friendly identifiers enabled (if, for some reason, the included pre-built `lexp.js` file doesn't suit your needs), you first need to modify *jison-lex* to allow Unicode property escapes in its *RegExp*s. See `README-lexer.md` for details.

## 1.0.25244

* Grammar: Make `??` and `?#` operators right-associative. This follows *C#* and makes more sense in practical use.
* Simplify implementation of `?#` operator (mostly to improve readability).
* Enforce stricter rules for assignments to array and object elements &mdash; no longer allows mixed array/object values.
* More tests.
* Add regular expression comparison for a test that is expected to throw an error, so a part of the message can be matched to make sure it's the expected error, rather than having to match the entire error string, which may contain runtime data that can't be predicted.
* CLI test tool now prints parsed result, controlled by `show_parsed` constant at head of script.
* Expose the runtime's min and max integer and floating point values as global variables `MAXINT, MININT, MAXFLOAT, MINFLOAT`.

## 1.0.25090

* Tighten definition of arg_list for function definitions, and simplify resulting atom (remove unnecessary wrapper atoms).
* When using semicolon as a statement separator, allow before end of block (i.e. prior to DONE in a DO...DONE), and at EOF, to more closely match C/C++/Java/JavaScript semantics. As of this version, semicolon is now the preferred statement separator.

## 1.0.25083

* Allow direct initialization of object with dereferenced keys, like `key='delta', obj={[delta]: '767'}`

## 1.0.24329

* Improve handling of `time(year,month,day,hour,min,sec,msec)`. Two or more (integer) arguments may be specified, any of which may be *null*. A *null* for a time component is evaluated as 0 (zero). A *null* year, month, or day argument uses the current year, month, or day, respectively. For example, `time(null,null,1)` produces the Epoch time for (local) midnight of the first day of the current month of the current year. The effect of arguments outside their "normal" range is inherited from the *JavaScript* `Date()` object. For example, `time(null,13,1)` returns January 1 of next year (i.e. 13=12+1, so the result is one month after month 12 of the current year).

## 1.0.24287

* Fix a number of lint-ish issues in the code (style, best practices, etc.).
* Although `define_vars()` was implements in 24262, it was not exposed/exported. Is now.

## 1.0.24274

* Add `constrain()` and `scale()` functions.

## 1.0.24262

* Add `isvalue()` function, returns *false* for `null` and `NaN`, *true* for everything else.
* Add `define_vars( ctx, vars )` function to create local variables on given context from key/value pairs of an *Object*.
* Add optional `vars` third argument to `push_context()` to create local vars at time subcontext is created.

## 1.0.24143

* Unparseable time string given to `time()` now returns `NaN` rather than throwing exception (i.e. behave like *JavaScript*).

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
