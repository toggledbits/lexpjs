# lexpjs

*lexpjs* is a Lightweight EXPression parser and evaluator for JavaScript. It is intended to be functional replacement for the use of `eval()`, which can present significant security issues.

*lexpjs* supports simple mathemtical expressions for addition, subtraction, multiplication,
division, modulus, bitwise operations, and logical operations. It has a small library of
built-in functions (abs, cos, sin, floor, ceil, round, etc.). The syntax is common "infix" expression notation, very similar to JavaScript itself.

Through a passed-in context table, *lexpjs* supports named variables, and custom functions.
See the documentation below for how to implement these.

*lexpjs* is offered under the [MIT License](/LICENSE).

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
is an object containing pre-defined symbol (variable) names and definable functions. See `get_context()` below.

`run()` returns the result of the expression evaluation as an array, one value for each subexpression in the parsed string (see "Syntax" above).
If evaluation fails, an exception is thrown.

Example (browser):

```
import * as lexpjs from './lexp.js';

var pp = lexpjs.compile("8*8");
console.log(lexpjs.run(pp));  // prints 64

pp = lexpjs.compile("8 * range");
var rr = lexpjs.run(pp); // throws ReferenceError because "range" is not defined
```

### `evaluate( expressionString [, executionContext ] )`

The `evaluate()` function performs the work of `compile()` and `run()` in one step. The function result (or exception thrown)
is the same as that for `run()` above (and in fact `evaluate()` is implemented simply as `return run( compile( expressionString ), executionContext )`).

```
var rr = lexpjs.evaluate("floor(3.1415*100)"); // rr would be 314
```

### `get_context( [variables] )`

Creates a context to house and preserve local variables, defined functions, etc. If several expressions need to be
evaluated, and the results from each shared with the next, creating a context first and passing it to each `evaluate()`
or `run()` call will facilitate this sharing.

The optional parameter `variables` is an object containing key/value pairs of predefined variables and their values.

Consider the following:

```
var cc = lexpjs.get_context( { pi: 3.14159265, name: "alpha" } )
console.log( lexpjs.evaluate( "area=pi * 4 * 4", cc );
console.log( lexpjs.evaluate( "'Half the area is ' + area / 2" );
```

This will print two lines:

    50.2654824
    Half the area is 25.1327412

Notice in the above example that the context has carried the computed area from the first `evaluate()` call into the second.

### `define_var( context, name, value )`

Variables can be created in a context by passing them in to `get_context()`, or they can be created or modified after by calling `define_var()`. The arguments should be obvious: `context` is the context in which to make the assignment (previously created by get_context()), and the `name` and `value` are the name and value of the variable, respectively.

### `define_func_impl( context, name, func )`

Special/custom functions needed by your expressions can be defined on a context by calling `define_func_impl()`. The `func` parameter is simply a reference to a function that takes the context in which the call is being made followed by the arguments your expression function needs; the implementation must return a value.

```
// Custom functions defined using four common JavaScript syntaxes.
var cc = lexpjs.get_context();

/* By passing a reference to a function */
function r2d( ctx, radians ) {
    return radians * 180.0 / Math.PI;
}
lexpjs.define_func_impl( cc, 'rad_to_deg', r2d );

/* By passing a closure */
lexpjs.define_func_impl( cc, 'deg_to_rad', function( ctx, deg ) {
    return deg * Math.PI / 180.0;
});

/* By passing arrow function */
lexpjs.define_func_impl( cc, 'square', ( ctx, value ) => { return value * value; } );
```

The context in which the call is made will be the context in which the function is referenced and the call is *made*, not necessarily that at which the function was *defined*. A function defined in global scope but called from a descendent scope will have the descendent scope passed as its argument here. The context is passed for reentrancy in your application, as a handle, and is not intended to be used to access local variables or variables in other scopes; this latter possibility should be avoided (i.e. your function should be passed all values it needs to function).

Your function may return any primitive type, `null`, `Infinity`, `NaN`, or an array or object containing any of these. If the return value is `undefined`, `null` will be substituted. Your function may **not** return any other type, including function, user-defined class or instance, `RegExp`, `Promise`, `Map` or `Set` (or descendents), etc. Basically, if it can't be represented natively in JSON, it's not valid to return from your function.

Your function must check its own arguments for validity, if necessary. Any exception thrown by your function will be passed through unmodified.

> NOTE: Functions can also be defined using expression syntax as further documented below (see the `define` statement in *Statements*).

## Expressions Syntax

lexpjs's expression syntax is similar to the "infix" expression syntax used by most common languages (C, Java, JavaScript, etc.). The simplest expression is simply a numeric constant, such as `1234`. This is a complete expression, the result value of which is 1234. Negative numbers begin with a `-` sign, such as `-1234`. Numbers may have decimal points and decimal digits: `-12.34`. Numbers may also be given in scientific format: `1.234e3` is equal to 1234 (1.234 x 10<sup>3</sup>). Hexadecimal integers may be entered by prefixing with `0x`; for example, `0x20` is decimal 32. Likewise binary integers can be prefixed with `0b`, and octal with `0o`.

Strings are represented as characters surrounded by matching double-quotes ("), single quotes ('), or back-ticks (\`).

Boolean values *true* and *false* are represented by the reserved words `true` and `false`, respectively.

The reserved word `null` evaluates to the *null* value (basically means "no value").

*Identifiers* are names that represent values. An identifier must begin with an upper- or lowercase alphabetic character, and may follow with any combination of alphanumeric characters and underscore. Thus `myLastSignal` is a valid identifier, but `023lastSignal` is not, and nor is `just another name!`.

*Functions* are identifiers followed by a paren-enclosed list of expressions as its arguments (or empty for no arguments). The maximum value of a series of numbers, for example, can be found using the `max` function like this: `max( 1, -2, pi, lastElement )`.

The expression language includes a set of *operators*. Multiplication is performed by `*`, so that `3 * 4` yields 12. Division uses `/`, while addition and subtraction use `+` and `-`, respectively, as one might expect. The full list of operators is given below, in order of *precedence*. Operators with higher precedence are performed before operators with lower precedence, so that expressions like `3 + 4 * 2` yield 11, not 14. The precedence of mathemetical operators follows the Order of Operations we are taught in elementary school. Precedence can be controlled using parentheses, so per the previous example, the result 14 could be arrived at using `(3 + 4) * 2`.

String concatenation is performed using the `+` operator; if either operand is a string, the result will be a concatenated string in which the non-string operand was converted to its string representation (i.e. `"123" + 456` results in the string `"123456"`). The *null* value is coerced to an empty string (so `null + "abc"` results in `"abc"`).

In addition to the mathematical operators, there are *relational operators*: `==`, `!=`, `>`, `>=`, `<` and `<=` all return *true* if their operands are equal, not equal, etc. In addition, the two special relational operators `===` and `!==` check equality/inequality not just of value, but of data type, such that `"3" == 3` is *true*, but `"3" === 3` is *false* (because the left operand is string type, and the right a number).

> Note that equality/inequality comparison of arrays or objects (non-primitive types), such as `array1 == array2` does *not* perform a "deep inspection" of the array/object and is effectively not a valid comparison for most practical purposes. Rather, it determines if the two operands are *the same object in memory* (as JavaScript does), and thus is most likely *false* and not truly a relevant comparison. Specifically, the following expressions are expected to be false: `[1,2,3] == [1,2,3]`, `{ abc:1, def:2 } == { abc:1, def:2 }` because although they are equivalent in terms of their contents, they are not, in fact, the same object in memory. The more complex `s=[1,2,3], t=s, s == t` is *true*, however, because `s` and `t` do refer to the same object in memory.

The *boolean operators* are `&&` for *and* and `||` for *or*, such that `false && true` is *false* and `false || true` is *true*. The `!` unary boolean operator negates its right-side operand, so `!true` is *false*.

The *bitwise operators*, following "C" (and Java, and JavaScript, and others) are `&` for bitwise AND, `|` for bitwise OR, and `^` for exclusive-OR (XOR).

The *array element accessor* is square brackets `[]` and should contain the array index. Arrays in expressions are zero-based, so the first element of an array is `[0]`. If the index given is less than 0, a runtime error occurs. If the index is positive or zero but off the end of the array, *null* is returned.

The *member access operator* "dot" (`.`) is used to traverse objects. For example, referring to the power state of an entity contain in an object may be `entity.attributes.power_switch.state`, which starts with the entity object, drops to the list of attributes within it, and then the "power_switch" capability within the attributes, and finally to the "state" value. The right-side operand of the dot operator must be an identifier, so it may not contain special characters. If a member name contains any non-identifier characters, the array access syntax can be used with a string: `entity.attributes['forbidden-name'].value`.

The *ternary operator* pair `? :` common to C, C++ and Java (and others) is available: `<boolean> ? <true-expression> : <false-expression>`. If the boolean expression given is *true*, the true expression is evaluated; otherwise, the false expression is evaluated.

The *coalesce operators*, borrowed from C#, are `??`, `?#`, `?.` and `?[`. Coalesce operators help handle *null* values in the middle of complex expressions more gracefully. For example, `value ?? 0` will result in the value of the variable `value` if it is not *null*, but if it is *null*, will yield 0. The *numeric coalesce* operator `?#` provides a quick test if the left operand is (or can be) a number (integer or real), and if so returns the numeric value; if not, it returns the right operand (which can be any type). The *access coalesce* operators are used for object member and array element access: if an identifier `struct` is intended to hold an object, but turns out to be *null*, a reference to `struct.name` in an expression would throw a runtime evaluation error; using `struct?.name` will instead result in *null* with no exception thrown. This is convenient because you can carry it `down?.a?.long?.list?.of?.member?.names` without crashing if something is undefined. Likewise if `beans` was intended to be an array but ended up *null*, the expression `beans[2]` would throw an error, while `beans?[2]` would result in *null*.

The `in` operator is used to establish if an object contains a specified key (e.g. `key in obj`) or an array contains an element at the given index (e.g. `15 in arr`). It is important to note that this operator works on *keys* only, not values, and in particular, cannot be used to search an array for a value (i.e. `4 in [ 4, 5, 6 ]` is *false*). To find an array element, use the `indexOf()` function. The `first` statement can be used to find a value in an object.

The `..` range operator produces an array containing all integers from the left operand to the right, so `3..6` results in `[3,4,5,6]`. A `for`-style counting loop can be implemented using `each` with the range operator as its operand: `each i in 0..9: <statement>` would execute `<statement>` 10 times.

Multiple expressions can be chained together by separating them with a comma. The result of a chained expression is the last expression evaluated.

The following is the list of operators supported in order from lowest precedence to highest. Operators on the same line have equal precedence and are evaluated
[left-associative](https://en.wikipedia.org/wiki/Operator_associativity) (from left to right) unless otherwise indicated:

* `=` (assignment, right associative)
* `?` (ternary operator first)
* `:` (ternary operator second)
* `??` (coalesce) and `?#` (coalesceNaN)
* `||` (logical OR)
* `&&` (logical AND)
* `|` (bitwise OR)
* `^` (bitwise XOR)
* `&` (bitwise AND)
* `==`, `===`, `!=`, `!==` (equality/inequality, non-associative)
* `in` (presence of key/index in object/array, non-associative)
* `<`, `<=`, `>`, `>=` (comparison, non-associative)
* `..` (range opreator integers from..to)
* `<<`, `>>` (bit shift)
* `+`, `-`
* `*`, `/`, `%` (mod)
* `**` (power, right associative)
* `-` (unary minus)
* `!` (not/negation, right-associative)
* `.`, `?.`, `?[` (member access)

## Data Types

The data types known to lexpjs are boolean, number, string, array, object, and the following special type/values (both a type and a value):

* `null`, which basically is used to mean "no value";
* `NaN`, which stands for "Not a Number", which results when a conversion to number fails (e.g. `5 * "hello"` or `int( 'what is this?' )`;
* `Infinity`, which results from division by zero and other similar math failures.

Arrays and objects can be constructed and used on the fly: `[ 5, 99, 23, 17 ]` constructs a four-element array, while `{ name: 'spot', type: 'dog', weight: 33 }` constructs an object.

## Statements

The expression language has a couple of "lightweight statements" that function as a hybrid of a statement and an expression. These are:

* `each <element-identifier> [, <element-identifier> ] in <array-or-object-expression>: <body-expression>` &mdash; the `each` statement will iterate over the given array or object (or expression resulting in an array or object), each time placing an array value or object element in the named variable (and the key or index in the second named variable, if given), and then execute the body expression. The body expression result, if non-`null`, is pushed to an array that forms the `each` expression result. For example, `each num of [ 4,7,33 ]: num * 2` will return an array `[ 8, 14, 66 ]`, while `each v,k in { "alpha": 1, "beta": 2 }: k` will return `["alpha", "beta"]`.
* `first <element-identifier> [, <element-identifier> ] in <array-or-object> with <test-expression> [ : <result-expression> ]` &mdash; the `first` statement will search through the elements of an array or object (top level, no traversal) and return the first value that for which `<test-expression>` is *true* (or [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy)). The result is the value matched, unless the optional `: <result-expression>` clause is given, in which case the result will be that of the expression. Example: `first val,key in devices with val.type=="window": val.name + ' ' + key` will find the first device in an array or map (object) of device objects for which the device object key *type* is *window*, and rather than return the device object, return the device name and key as a space-separated string.
* `do <statement-list> done` &mdash; since the limited syntax of `each` allows only a single statement to be executed, the `do...done` statement creates a statement block that appears to `each` as a single statement, thus allowing multiple statements to be executed within the loop. The standard multi-statement result rule applies: the result of the statement block is the result produced by the last expression in the block.
* `if <conditional> then <true-expression> else <false-expression> endif` &mdash; Introduced for users uncomfortable with the ternary operator (`?:`) syntax, this "traditional" *if...then* form was added. The true and false expressions may be any expression, including a `do...done` block enclosing multiple expressions. Note that when writing `else if` for multiple conditions, each `if` starts a new `if` block and must have a matching `endif`:

        # The following is incorrect:
        if a > 5
          then "high range"
          else if a > -5
            then "nominal"
          else "lo range"     <--- ambiguous else
        endif

        # Should be:
        if a > 5
          then "high range"
          else
            if a > -5
              then "nominal"
              else "lo range"
            end if                  <-- for the inner if
        end if                      <-- for the outer if

* `case when <conditional-expr-1>: <true-expression-1> [ when <conditional-expr-n>: <true-expression-n> ]* [ else <default-expression> ] end` &mdash;
Sometimes `if` statements need to make multiple tests, and the `if` statement and ternary operator can become very difficult to write and follow later.
To make things tidier, the `case` statement evaluates a series of `when` conditions; the first `<conditional-expression>` that is `true` will cause the statement
to return the value of its matching `<true-expression>`. If none is `true`, the `<default-expression>` result is returned if an `else` clause is present,
or `null` otherwise. The `<true-expressions>` and `<default-expression>` may be any expression, including assignments or block statements (even another `case` statement). Example below; lines and spacing for clarity only.

        case
          when tempF < 65: "it's cold in here!"
          when tempF < 76: "we're comfortable"
          when tempF < 85: "it's a bit warm in here!"
          else "we need to cool this place down!"
        end

* `define <functionName>( <args...> ) <expression>` &mdash; defines a function named `<functionName>` that returns the evaluated `<expression>`. Arguments passed to the function will be received as `<args...>`, which must be a comma-separated list of identifiers. Example: `define square(a) a*a` defines a function that returns the square of a single value passed to it received in the variable `a`; the function result is the result of the expression (no `return` statement is required or exists in this syntax). If multiple expressions are required for the implementation of the function, enclose them in a `do ... done` block.

### Scope of Statements

The expression language has some rudimentary scoping like most programming languages. Variables defined in the *interior expressions* of the above statements will be local to the statement and not available outside the statement.

For example, given this expression (an iterator):

    each v in [1,2,3,4,5,6]: a=v

One might assume at first glance that this iterator assigns each value of the array to `a`, and when the statement ends `a` will be available to the next expression with the value 6. The former is true, but not the latter: `a` is not available outside of the `each` expression. When making assignments to variables, the language will see if the target identifier is defined in any accessible scope, and if it is not defined in any scope, it is created in the current (lowest) scope. So, if you wish to preserve a value computed in the interior of such an expression, define the variable outside the statement first, like this:

    a=0, each v in [1,2,3,4,5,6]: a=v

Now `a` will have a value of 6, because it was defined outside the statement, so assignments made within the statement target the exterior variable.

This behavior can be explicitly controlled through the use of the `global` and `local` keywords used as a prefix to an assignment. The `global` keyword will assure that the named identifier is assigned in global scope, and the `local` keyword assures that the name identifier is assigned in the current scope (which could be the global scope or a descendent).

```
a = 1   # this is the global scope, so a is created as a global
b = 0   # this creates b in global scope
do
    # This "DO" block has its own scope (child of the global scope)
    local a = 2  # this sets a local variable a to 2; the global a is still 1
    global a = a * 4  # this sets global a to local a * 4 (so 8)
    a = a * 2  # since local a exists, local a is now 16
    b = a  # this sets global b to local a's value of 16
done
# global a is now 8
# local a is now 16
```

Note that the `global` and `local` keywords can only be used as a modifier to the left-side of an assignment. One cannot, for example, say `global a = local a * 2` to set global `a` to twice local `a`'s value. That's invalid syntax.

One more thing to think about... the topmost/outermost scope, the global scope, is local to itself, so in the global scope, the following statements all have the same effect of creating `a` in global scope:

```
a = 0        # When in global scope and a is undefined, the default scope is the global scope
local a = 0  # When in global scope, the local scope is the global scope
global a = 0 # Specifying global scope is redundant when in global scope
```

> NOTE: The use of the `global` keyword in particular will allow you to do things that are considered "bad style." For example, you can define a function or have a deeply nested statement that "communicates" with other expressions by setting variables in global scope. This is regarded as bad style because it can be difficult to figure out why global variables are changing (the changes are buried deep in other statements) and it may reduce the reusability of functions and expressions. There are many treatises on global variables in programming languages available on the web.

## Pre-defined Functions

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
* `min/max( ... )` &mdash; returns the smallest/largest value of its arguments; if an argument is an array, the array is scanned; non-numeric values are ignored, so these functions return *null* unless at least one number (type) value is found;
* `isNaN( various )` &mdash; returns true if the argument is `NaN`, or if it would be if conversion was attempted (e.g. `isNaN( 'not a number' )` is *true*, but `isNaN( '123' )` is *false*).
* `isInfinity( value )` &mash; returns true if the argument is `Infinity`, as would result in, for example, division by zero.

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
* `typeof( various )` &mdash; returns the data type of the argument. While JavaScript reports arrays and `null` as *object*s, *lexpjs* reports them more specifically as *array* and *null* respectively.

### Date/Time Handling Functions

* `time( [iso-date-string] | [ year [, month [, day [, hour [, minute [, second ]]]]]] | [ dateparts-obj ] )` &mdash; returns the current time if no arguments are given. If an [ISO 8601 date string](https://en.wikipedia.org/wiki/ISO_8601) is given, it is parsed; if an object of the same form that is returned by `dateparts()` is given, the date is constructed from those parts; otherwise the arguments are assumed to be numeric and a date/time is constructed using as many parts as are provided (in the order shown). The result is always a Unix Epoch time in milliseconds. See additional notes below.
* `dateparts( [time] )` &mdash; returns an object with keys `year`, `month`, `day`, `hour`, `minute`, `second`, `millis`, and `weekday` (0-6, where 0=Sunday) for the given `time`, or the current time if not given.

Important notes with respect to date handling (currently; this will evolve):

* All time functions operate in the local time and timezone set for the runtime. There are currently no UTC functions.
* Where *month* is an argument (`time()`) or return value (`dateparts()`), there is a configuration flag in the code for whether months should numbered 0-11 (like JavaScript) or 1-12 (for hoomans); the *lexpjs* default is **1** (months 1-12), and all examples assume this.
* When passing a `dateparts`-form object (i.e. an object with keys `year`, `month`, etc.) into `time()`, a missing key is assumed to be 0 except `year` (which is assumed to be the current year), and `month` and `day` which are assumed to be 1. An offset date can be computed by adjusting the values in the object by the offset required. For example, fifteen days before March 1, 2022 can be found with `{ year: 2022, month: 3, day: -14 }` (-14 = 1 - 15). Five hours and 8 minutes before the current time could be written as `t=dateparts(), t.hour=t.hour-5, t.minute=t.minute-8, time(t)`. Using this form of date offset computation (rather than simply subtracting 18,480,000 milliseconds from the current time in milliseconds) accounts for changes in DST, leap seconds, or leap days occurring during the offset interval.

### Array/Object Handling Functions

* `len( array )` &mdash; returns the number of elements in the array;
* `keys( object )` &mdash; returns, as an array, the keys in the given object;
* `values( object )` &mdash; returns, as an array, the values in the given object;
* `clone( various )` &mdash; returns a (deep) copy of its argument; this is particularly useful for arrays and objects;
* `join( array, joinstring )` &mdash; returns a string with the elements of `array` converted to strings and joined by `joinstring` (e.g. `join([4,6,8], ":")` results in the string "4:6:8", while `join([9], ":")` would be simply "9");
* `list( ... )` &mdash; returns an array of its argument; this is legacy syntax (i.e. `list(5,7,9)` is the same as writing `[5,7,9]`, so this function is now obsolete and may be removed later);
* `indexOf( array, value )` &mdash; if *value* is present in *array*, the index (>=0) is returned; otherwise -1 is returned;
* `count( array )` &mdash; returns the number of non-null elements of *array*;
* `sum( array )` &mdash; returns the sum of non-null elements of *array*; note that only a single argument, which must be an array, is accepted;
* `median( array )` &mdash; returns the [statistical median](https://en.wikipedia.org/wiki/Median) of the elements of *array*;
* `slice( array, start, end )` &mdash; returns a new array containing the elements of *array* from *start* (zero-based) to, but not including, *end*;
* `insert( array, pos, newElement )` &mdash; inserts *newElement* into *array* before *pos* (zero-based); the array is modified in place and is also returned as the function value;
* `remove( array, pos [ , numRemove ] )` &mdash; removes elements from *array* starting at *pos*; if *numRemove* is not given, only the one element at *pos* is removed, otherwise *numRemove* elements are removed from the array; the array is modified in place and also returned as the function value;
* `push( array, value [ , maxlen ] )` &mdash; appends *value* at the end of *array*; if *maxlen* is given, elements are removed from the head of the array to limit its length to *maxlen* elements; the array is modified in place and also returned as the function value;
* `unshift( array, value [ , maxlen ] )` &mdash; insert *value* at the beginning of *array*; if *maxlen* is given, elements are removed from the end of the array to limit its length to *maxlen* elements; the array is modified in place and also returned as the function value;
* `pop( array )` &mdash; removes the last element of *array* and returns it; returns `null` if *array* is empty; the array is modified in place;
* `shift( array )` &mdash; removes the first element of *array* and returns it; returns `null` if *array* is empty; the array is modified in place;
* `arrayConcat( a, b )` &mdash; returns a new array that is the concatenation of *a* and *b*; for example, `arrayConcat( [1,2,3], [1,3,5] )` returns `[1,2,3,1,3,5]`;
* `arrayIntersection( a, b )` &mdash; returns a new array containing all values in array *a* that are also in array *b*; for example, `arrayIntersection( [1,2,3], [1,3,5] )` returns `[1,3]`;
* `arrayDifference( a, b )` &mdash; returns a new array containing all values of array *a* that do not appear in array *b*; for example, `arrayDifference( [1,2,3], [1,3,5] )` returns `[2]`;
* `arrayExclusive( a, b )` &mdash; returns a new array containing all values of the arrays *a* and *b* that appear only in either, but not both (this is often referred to as the *symmetric difference*); for example, `arrayExclusive( [1,2,3], [1,3,5] )` returns `[2,5]`;
* `arrayUnion( a, b )` &mdash; returns a new array containing all values of the arrays *a* and *b*; for example, `arrayUnion( [1,2,3], [1,3,5] )` returns `[1,2,3,5]`;
* `sort( array [, comparison] )` &mdash; sort the given array, returning a new array (the given array is not modified). The array to be sorted may contain data of any type. The default sort is a case-sensitive ascending string sort (so the array is assumed to contain strings, and if it contains any other type the values are coerced to strings prior to comparison). To sort differently (e.g. descending, numeric, etc.), `comparison` can be given as the either the name of a defined function taking two arguments as the values to be compared, or an expression that compares the local variables `$1` and `$2` (defined by the `sort()` function as it runs). In either case, the result *must* be an integer: 0 if the two values are equal; less than 0 (e.g. -1) if the first value sorts before the second; or greater than zero (e.g. 1) if the first value sorts after the second. The comparison must be stable: given two values, it must return the same result every time it runs. Do not apply randomness or other heuristics to the comparison, as this can lead to long runtimes or even infinite loops in the attempt to sort.
* `isArray( various )` &mdash; returns *true* if the argument is an array (of any length);
* `isObject( various )` &mdash; returns *true* if the argument is an object;

### Conversion Functions

* `hex( num )` &mdash; returns the hexadecimal (string) representation of the numeric argument (or "NaN" if non-numeric);
* `toJSON( various )` &mdash; returns the argument as a JSON-formatted object (string);
* `parseJSON( json )` &mdash; returns the data represented the (parsed) JSON string argument;
* `btoa( str )` &mdash; returns the Base64-encoded representation of the string argument;
* `atob( str )` &mdash; returns a string containing the decoded Base64 argument (string).
* `urlencode( string )` &mdash; URL-encodes the given string.
* `urldecode( string )` &mdash; URL-decodes the given string.

### Reserved Words

As a result of the syntax, the following words are reserved and may not be used as identifiers or function names: `true, false, null, each, in, first, of, with, if, then, else, endif, do, done, define, and, or, not, NaN, Infinity`. Note that keywords and identifiers are case-sensitive, so while `each` is not an acceptable identifier, `Each` or `EACH` would be.

<small>Updated 2021-Feb-12 (22043)</small>
