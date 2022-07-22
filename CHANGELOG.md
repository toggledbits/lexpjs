# CHANGELOG for lexpjs

## 22203

* Improve `time()` string parsing so that time-only strings (`HH:MM[:SS[.TTT]]`) are correctly parsed, and date-only strings are supported (within the limited of parsing of the JavaScript `Date` constructor, which handles many common forms). Time-only strings will be converted to the given time on the current date (in the current timezone). Date-only strings will return midnight as the time component (in the current timezone).

## Earlier versions

The CHANGELOG was first produced for version 22203; please refer to Github commit comments for details prior to this version.
