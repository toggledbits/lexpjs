# CHANGELOG for lexpjs

**NOTE:** In order to *build* lexpjs with Unicode-friendly identifiers enabled (if, for some reason, the included pre-built `lexp.js` file doesn't suit your needs), you first need to modify *jison-lex* to allow Unicode property escapes in its *RegExp*s. See the `grammar.jison` header for further guidance.

## 1.0.22307

* Improve `if...then...else...endif` with addition of `elif <cond> then <expr-list>` alternates.

## 22203

* Improve `time()` string parsing so that time-only strings (`HH:MM[:SS[.TTT]]`) are correctly parsed, and date-only strings are supported (within the limited of parsing of the JavaScript `Date` constructor, which handles many common forms). Time-only strings will be converted to the given time on the current date (in the current timezone). Date-only strings will return midnight as the time component (in the current timezone).

## Earlier versions

The CHANGELOG was first produced for version 22203; please refer to Github commit comments for details prior to this version.
