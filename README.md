# lexpjs

*lexpjs* is a Lightweight EXPression parser and evaluator for JavaScript. It is intended to be functional replacement for the use of `eval()`, which can present significant security issues.

*lexpjs* supports simple mathemtical expressions for addition, subtraction, multiplication,
division, modulus, bitwise operations, and logical operations. It has a small library of
built-in functions (abs, cos, sin, floor, ceil, round, etc.). The syntax is common "infix" expression notation, very similar to JavaScript itself.

Through a passed-in context table, *lexpjs* supports named variables, and custom functions.
See the documentation below for how to implement these.

*lexpjs* is offered under GPL 3.0.

## Known Issues ##

* *lexpjs* uses a UMD wrapper for compatibility with node, CommonJS, AMD, etc., but it has not been tested in all of these environments.

## Bug Reports and Contributions ##

I like bug reports. I like help. I like making things better. If you have suggestions or bug reports
please use use [GitHub Issues](https://github.com/toggledbits/lexpjs/issues). If you have a
contribution, have at it! Please try to follow the coding style to keep it consistent, and use spaces
rather than tabs (4 space indenting). Please use the develop branch as the origin for your new branch
and changes.

## The Basics ##

### `compile( expressionString )`

The `compile()` function accepts a single argument, the string the containing the expression to be parsed.
If parsing of the expression succeeds, the function returns a JavaScript object containing the parse tree
that is used as input to `run()` later. If parsing fails, the function throws an exception.

Example (node.js):

```
const lexpjs = require( "./lexp.js" );

try {
    pp = lexp.compile('2 + 3 * 4 + 5");
} catch (e) {
    console.log("Parsing failed:", e);
}
...
```

### `run( parsedResult [, executionContext ] )`

The `run()` function executes the parsed expression. It takes an optional `executionContext` argument, which
is an object containing pre-defined symbol names and definable functions.

`run()` returns the result of the expression evaluation as an array, one value for each subexpression in the parsed string (see "Syntax" above).
If evaluation fails, an exception is thrown.

Example (browser):

```
import * as lexpjs from './lexp.js';

var context = { median: 50 };
var pp = lexpjs.compile("8 * range");
var rr = lexpjs.run(pp);
// In runtime, this example throws ReferenceError because "range" is not defined in "context"
```

As of this version, *lexpjs* does not allow you to modify variables or create new ones during evaluation.

### `evaluate( expressionString [, executionContext ] )`

The `evaluate()` function performs the work of `compile()` and `run()` in one step. The function result (or exception thrown)
is the same as that for `run()` above (and in fact `evaluate()` is implemented simply as `return run( compile( expressionString ), executionContext )`).

```
var context = { minval: 25, maxval: 77 };
var rr = lexpjs.evaluate("minval+(maxval-minval)/2", context);
// rr would be 51
```

## Pre-defined Symbols ##

The context passed to `evaluate()` and `run()` is used to define named symbols (variables) and custom functions
that can be used in expressions. We've seen in the above examples for these functions how that works.
For variables, it's simple a matter of defining an element with the value to be used:

```
var context = {
    "pi": Math.PI,  // get the value from the JS Math object
    "minrange": 0,
    "maxrange": 100
};
```

Variables can also use dotted notation to traverse a tree of values in the context. Let's expand our previous
context like this:

```
context.device = {
    "class": "motor",
    "info": {
        "location": "MR1-15-C02",
        "specs": {
            "manufacturer": "Danfoss",
            "model": "EM5-18-184T",
            "frame": "T",
            "voltage": "460",
            "hp": "5"
        }
    }
};
```

In expressions, the `device.class` would result in the string "motor". The voltage of the motor is accessed with the expression `device.info.specs.voltage`.

## Custom Functions ##

You can define custom functions for your expressions by defining them in the context passed to `run()` or
`evaluate()`.

It's pretty straightforward to do. Your custom function must be implemented by a JavaScript function. The function is passed
as many arguments as are parsed in the expression. Your function is responsible for checking the validity of the number and
types of arguments passed.

Let's say we want to create a function to convert degrees to radians. The math for that is pretty easy.
It's the value in degrees times "pi" and divided by 180. As a function, it might look like this:

```
function toRadians( degrees ) {
    return degrees * Math.PI / 180;
}
```

To make that a function that your expressions could use, you need to put it into the context that's passed
to `run()`, which is done like this:

```
/* First, set up an empty context, and the container _func for custom functions */
var context = {};
context._func = {};

/* Now define a custom function */
context._func.toradians = function( degrees ) {
    return degrees * Math.PI / 180;
};
```

Now, when you run an expression that makes reference to your `toradians` function, it is called by *lexpjs* and the
result value is used in the remainder of the expression. For example, `cos(toradians(45))` would return `0.707106...`

Although we have used an anonymous function in this example, there is no reason you could not separately
define a named function, and simply use a reference to the function name in the context assignment, like
this:

```
var context = { _func: {}, ... } // ... means other declarations for context elements

// Now define and add our function to the context
function toRadians(degrees) {
    return degrees * Math.PI / 180;
end
context._func.toradians = toRadians;
context._func.degToRad = toRadians;
```

The premise here is simple, if it's not already clear enough. The evaluator will simply look in your passed
context for any name that it doesn't recognize as one of its predefined functions.
If it finds an element with a key equal to the name, the value is assumed to be a function it can call.

Note in the above example that we declared our function with an uppercase letter "R" in the name,
but when we made the context assignment to "toradians", the context element key is all lower case. This means that
any expression would also need to use all lower case. The name used in evaluation is the name of the *key* in `__func`,
not the actual name of the actual function (if it has one).
As a further example, `degToRad` is also defined
as an expression function that is implemented by `toRadians()`, showing that there's no required parity between
the name used in the expression context and the name of the function implementing it.

## Expressions Syntax

lexpjs's expression syntax is similar to the "infix" expression syntax used by most common languages (C, Java, JavaScript, etc.). The simplest expression is simply a numeric constant, such as `1234`. This is a complete expression, the result value of which is 1234. Negative numbers begin with a `-` sign, such as `-1234`. Numbers may have decimal points and decimal digits: `-12.34`. Numbers may also be given in scientific format: `1.234e3` is equal to 1234 (1.234 x 10<sup>3</sup>). Hexadecimal integers may be entered by prefixing with `0x`; for example, `0x20` is decimal 32. Likewise binary integers can be prefixed with `0b`, and octal with `0o`.

Strings are represented as characters surrounded by matching double-quotes ("), single quotes ('), or back-ticks (\`).

Boolean values *true* and *false* are represented by the reserved words `true` and `false`, respectively.

The reserved word `null` evaluates to the *null* value (basically means "no value").

*Identifiers* are names that represent values. An identifier must begin with an upper- or lowercase alphabetic character, and may follow with any combination of alphanumeric characters and underscore. Thus `myLastSignal` is a valid identifier, but `023lastSignal` is not, and nor is `just another name!`.

*Functions* are identifiers followed by a paren-enclosed list of expressions as its arguments (or empty for no arguments). The maximum value of a series of numbers, for example, can be found using the `max` function like this: `max( 1, -2, pi, lastElement )`.

The expression language includes a set of *operators*. Multiplication is performed by `*`, so that `3 * 4` yields 12. Division uses `/`, while addition and subtraction use `+` and `-`, respectively, as one might expect. The full list of operators is given below, in order of *precedence*. Operators with higher precedence are performed before operators with lower precedence, so that expressions like `3 + 4 * 2` yield 11, not 14. The precedence of mathemetical operators follows the Order of Operations we are taught in elementary school. Precedence can be controlled using parentheses, so per the previous example, the result 14 could be arrived at using `(3 + 4) * 2`.

In addition to the mathematical operators, there are *relational operators*: `==`, `!=`, `>`, `>=`, `<` and `<=` all return *true* if their operands are equal, not equal, etc. In addition, the two special relational operators `===` and `!==` check equality/inequality not just of value, but of data type, such that `"3" == 3` is *true*, but `"3" === 3` is *false* (because the left operand is string type, and the right a number).

The *boolean operators* are `&&` for *and* and `||` for *or*, such that `false && true` is *false* and `false || true` is *true*. The `!` unary boolean operator negates its right-side operand, so `!true` is *false*.

The *bitwise operators*, following "C" (and Java, and JavaScript, and others) are `&` for bitwise AND, `|` for bitwise OR, and `^` for exclusive-OR (XOR).

The *array element accessor* is square brackets `[]` and should contain the array index. Arrays in expressions are zero-based, so the first element of an array is `[0]`. If the index given is less than 0, a runtime error occurs. If the index is positive or zero but off the end of the array, *null* is returned.

The *member access operator* "dot" (`.`) is used to traverse objects. For example, referring to the power state of an entity may be `entity.attributes.power_switch.state`, which starts with an entity object, drops to the list of attributes within it, and the "power_switch" capability within the attributes, and finally to the "state" value. The right-side operand of the dot operator must be an identifier, so it may not contain special characters. If a member name contains any non-identifier characters, the array access syntax can be used: `entity.attributes['forbidden-name'].value`.

The *ternary operator* pair `? :` common to C, C++ and Java (and others) is available: `<boolean> ? <true-expression> : <false-expression>`. If the boolean expression given is *true*, the true expression is evaluated; otherwise, the false expression is evaluated.

The *coalesce operators*, borrowed from C#, are `??`, `?.` and `?[`. Coalesce operators help handle *null* values in the middle of complex expressions more gracefully. For example, `value ?? 0` will result in the value of the variable `value` if it is not *null*, but if it is *null*, will yield 0. Similarly, if an identifier `struct` is intended to hold an object, but turns out to be *null*, a reference to `struct.name` in an expression would throw a runtime evaluation error; using `struct?.name` will instead result in *null* with no exception thrown. This is convenient because you can carry it `down?.a?.long?.list?.of?.member?.names` without crashing if something is undefined. Likewise if `beans` was intended to be an array but ended up *null*, the expression `beans[2]` would throw an error, while `beans?[2]` would result in *null*.

The `in` operator is used to establish if an object contains a specified key (e.g. `key in obj`) or an array contains an element at the given index (e.g. `15 in arr`). It is important to note that this operator works on *keys* only, not values, and in particular, cannot be used to search an array for a value (i.e. `4 in [ 4, 5, 6 ]` is *false*). To find an array element, use the `indexOf()` function. The `first` statement can be used to find a value in an object.

Multiple expressions can be chained together by separating them with a comma. The result of a chained expression is the last expression evaluated.

The following is the list of operators supported in order from lowest to highest. Operators on the same line have equal precedence and are evaluated
[left-associative](https://en.wikipedia.org/wiki/Operator_associativity) (from left to right) unless otherwise indicated:

* `=` (assignment, right associative)
* `?` (ternary operator first)
* `:` (ternary operator second)
* `??` (coalesce)
* `||` (logical OR)
* `&&` (logical AND)
* `|` (bitwise OR)
* `^` (bitwise XOR)
* `&` (bitwise AND)
* `==`, `===`, `!=`, `!==` (equality/inequality, non-associative)
* `in` (presence of key/index in object/array, non-associative)
* `<`, `<=`, `>`, `>=` (comparison, non-associative)
* `<<`, `>>` (bit shift)
* `+`, `-`
* `*`, `/`, `%` (mod)
* `**` (power, right associative)
* `-` (unary minus)
* `!` (not/negation, right-associative)
* `.`, `?.`, `?[` (member access)

## Data Types

The data types known to lexpjs are boolean, number, string, array, object, and `null`. The special value `NaN` may also be returned by some operations, but has no matching keyword. The `isNaN()` function can be used to test for `NaN`.

Arrays and objects can be constructed and used on the fly: `[ 5, 99, 23, 17 ]` constructs a four-element array, while `{ name: 'spot', type: 'dog', weight: 33 }` constructs an object.

## Statements

The expression language has a couple of "lightweight statements" that function as a hybrid of a statement and an expression. These are:

* `each <element-identifier> of <array-or-object>: <expression>` &mdash; the `each` statement will iterate over the given array or object, placing a member in the named element identifier, and execute the expression. The result of the expression, if non-`null`, is pushed to an array that forms the expression result. For example, `each num of [ 4,7,33 ]: num * 2` will return an array `[ 8, 14, 66 ]`.
* `first <element-identifier> of <array-or-object> with <expression>` &mdash; the `first` state will search through the elements of an array or object (top level, no traversal) and return the first member that for which `<expression>` is true (or [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy)).
* `do <statement-list> done` &mdash; since the limited syntax of `each` allows only a single statement to be executed, the `do...done` statement creates a statement block that appears to `each` as a single statement, thus allowing multiple statements to be executed within the loop. The standard multi-statement result rule applies: the result of the statement block is the result produced by the last expression in the block.
* For users uncomfortable with the ternary operator syntax, an `if <conditional> then <true-expression> else <false-expression> endif` statement may be used. The true and false expressions may be a `do...done` block.

## Functions

I keep adding things as I need them or people ask, so [let me know](https://github.com/toggledbits/lexpjs/issues) if I'm missing what you need.

### Arithmetic Functions

* `abs( number )` &mdash; returns the absolute value of its argument;
* `sign( number )` &mdash; returns the sign of its argument: -1 if negative, 0 if zero, 1 if positive;
* `floor( number )` &mdash; returns the largest integer less than or equal to its argument;
* `ceil( number )` &mdash; returns the next integer greater than or equal to its argument;
* `round( number, precision )` &mdash; rounds `number` to `precision` decimal digits;
* `trunc( number )` &mdash; returns the integer portion of its argument (e.g. trunc(-3.4) is -3, where floor(-3.4) is 4);
* `cos/sin/tan( radians )` &mdash; trig operations;
* `log/exp( number )` &mdash; natural logarithm and exponential;
* `pow( base, power )` &mdash; raises `base` to the `power`th power (e.g. `pow(10,3)` is 1000);
* `sqrt( number )` &mdash; square root (of `number` > 0);
* `random()` &mdash; returns a random number greater than or equal to 0 and less than 1;
* `min/max( ... )` &mdash; returns the smallest/largest value of its arguments;
* `isNaN( various )` &mdash; returns true if the argument is non-numeric.

### String Handling Functions

* `len( string )` &mdash; returns the length of the string;
* `substr( string, start, length )` &mdash; returns the portion of the string from the `start`th character for `length` characters;
* `upper/lower( string )` &mdash; converts the string to upper/lower-case;
* `match( string, regexp [ , ngroup [ , flags ] ] )` &mdash; matches, if possible, the regular expression *regexp* to the *string*, and returns the matched string, or `null` if no match; if *ngroup* is given and the *regexp* contains groups, the matched part of that group is returned; if *flags* is "i", a case-insensitive match is done;
* `find( string, regexp [ , flags ] )` &mdash; like `match()`, but returns the index of the first character of the match, rather than the matched string, or -1 if no match; the meaning of (optional) *flags* is the same as for `match()`;
* `replace( string, regexp, replacement [ , flags ] )` &mdash; replaces the first substring matched by the regular expression *regexp* with the *replacement* string and returns the result; the optional *flags* (a string) may include "i" for case-insensitive search, and "g" for global replacement (all matches in *string* are replaced; combined would be "ig"); the `$` is a special character in the *replacement* string and follows the JavaScript semantics (for [`String.replace()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace)).
* `rtrim/ltrim/trim( string )` &mdash; removes whitespace from the right/left/both side(s) of the string;
* `split( string, regexp [, max ] )` &mdash; splits the string at the matching regular expression and returns an array (e.g. `split( "1,5,8", "," )` returns `["1","5","8"]`).

### Type Handling Functions

* `int( various )` &mdash; attempts conversion of its argument to an integer; returns `NaN` if the argument cannot be converted, otherwise, it returns the integer;
* `float( various )` &mdash; attempts conversion to a floating-point value;
* `bool( various )` &mdash; attempts conversion to `boolean`; in this expression language, the strings "0", "no", "off" and "false", the empty string, the number 0, and boolean *false* all result in *false*; otherwise, the result is *true*;
* `str( various )` &mdash; converts the argument to a string;
* `isnull( various )` &mdash; more a test than a conversion, returns *true* if the argument is `null`.

### Time Handling Functions

* `time( [ year [, month [, day [, hour [, minute [, second ]]]]]] )` &mdash; returns the current time if no arguments are given; otherwise a date/time is constructed using as many arguments as are provided; the result is a Unix Epoch time in milliseconds;
* `dateparts( [time] )` &mdash; returns an object with keys `year`, `month`, `day`, `hour`, `minute`, `second`, and `weekday` (0-6, 0=Sunday) for the given `time`, or the current time if not given.

Important notes with respect to date handling (currently; this will evolve):

* Where *month* is an argument (`time()`) or return value (`dateparts()`), there is a configuration flag in the code for whether months should numbered 0-11 (like JavaScript) or 1-12 (for hoomans); the *lexpjs* default is **1** (months 1-12).
* All time functions operate in the timezone set for the runtime. There are currently no UTC functions.

### Array/Object Handling Functions

* `len( array )` &mdash; returns the number of elements in the array;
* `keys( object )` &mdash; returns, as an array, the keys in the given object;
* `values( object )` &mdash; returns, as an array, the values in the given object;
* `join( array, joinstring )` &mdash; returns a string with the elements of `array` converted to strings and joined by `joinstring` (e.g. `join([4,6,8], ":")` results in the string "4:6:8", while `join([9], ":")` would be simply "9");
* `list( ... )` &mdash; returns an array of its argument; this is legacy syntax (i.e. `list(5,7,9)` is the same as writing `[5,7,9]`, so this function is now obsolete and may be removed later);
* `indexOf( array, value )` &mdash; if *value* is present in *array*, the index (>=0) is returned; otherwise -1 is returned;
* `count( array )` &mdash; returns the number of non-null elements of *array*;
* `sum( array )` &mdash; returns the sum of non-null elements of *array*; note that only a single argument, which must be an array, is accepted;
* `slice( array, start, end )` &mdash; returns a new array containing the elements of *array* from *start* (zero-based) to, but not including, *end*;
* `insert( array, pos, newElement )` &mdash; inserts *newElement* into *array* before *pos* (zero-based); the array is modified in place and is also returned as the function value;
* `remove( array, pos [ , numRemove ] )` &mdash; removes elements from *array* starting at *pos*; if *numRemove* is not given, only the one element at *pos* is removed, otherwise *numRemove* elements are removed from the array; the array is modified in place and also returned as the function value;
* `push( array, value [ , maxlen ] )` &mdash; appends *value* at the end of *array*; if *maxlen* is given, elements are removed from the head of the array to limit its length to *maxlen* elements; the array is modified in place and also returned as the function value;
* `unshift( array, value [ , maxlen ] )` &mdash; insert *value* at the beginning of *array*; if *maxlen* is given, elements are removed from the end of the array to limit its length to *maxlen* elements; the array is modified in place and also returned as the function value;
* `pop( array )` &mdash; removes the last element of *array* and returns it; returns `null` if *array* is empty; the array is modified in place;
* `shift( array )` &mdash; removes the first element of *array* and returns it; returns `null` if *array* is empty; the array is modified in place;
* `isArray( various )` &mdash; returns *true* if the argument is an array (of any length);
* `isObject( various )` &mdash; returns *true* if the argument is an object.

### Reserved Words

As a result of the syntax, the following words are reserved and may not be used as identifiers or function names: `true, false, null, each, in, first, with, if, then, else, endif, do, done, and, or, not, NaN`. Note that keywords and identifiers are case-sensitive, so while `each` is not an acceptable identifier, `Each` or `EACH` would be.

<small>Updated 2021-03-18</small>
