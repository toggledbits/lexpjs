# lexpjs

*lexpjs* is a Lightweight EXPression parser and evaluator for JavaScript. It is intended to be functional replacement for the use of `eval()`, which can present significant security issues.

*lexpjs* supports simple mathemtical expressions for addition, subtraction, multiplication,
division, modulus, bitwise operations, and logical operations. It has a small library of
built-in functions (abs, cos, sin, floor, ceil, round, etc.). The syntax is common "infix" expression notation, very similar to JavaScript itself.

Through a passed-in context table, *lexpjs* supports named variables, and custom functions.
See the documentation below for how to implement these.

*lexpjs* is offered under GPL 3.0.

## Known Issues ##

* Lexp uses a UMD wrapper for compatibility with node, CommonJS, AMD, etc., but it has not been tested in all of these environments.

## Bug Reports and Contributions ##

I like bug reports. I like help. I like making things better. If you have suggestions or bug reports
please use use [GitHub Issues](https://github.com/toggledbits/lexpjs/issues). If you have a
contribution, have at it! Please try to follow the coding style to keep it consistent, and use spaces
rather than tabs (4 space indenting). Please use the develop branch as the origin for your new branch
and changes.

Also, if you're making a feature enhancement contribution, consider looking at my [Luaxp project](https://github.com/toggledbits/luaxp) as well,
and see if the same enhancement would be appropriate there. Since the Lua implementation is born of the
JavaScript one, I think it would be an interesting exercise to try and keep them as close functionally
as possible.

## Syntax ##

As *lexpjs* now uses [Jison](http://zaa.ch/jison/) to generate its parser, the file `grammar.jison` can be examined for syntax. The TL;DR version is that it's pretty close to JavaScript expressions, as one might think, without the hazards of using `eval()`.

An expression string given to *lexpjs* may contain multiple comma-separated subexpressions. Each subexpression will be evaluated, and the result is always an array containing as many results as there were subexpressions. This can be handy, as the use of assignments to variables as containers for temporary/interstitial values can simplify an otherwise very complex string if it was written as a single expression, or, for example, permit the re-use of a calculated value several times in the same calculation.

## The Basics ##

### compile( expressionString ) ###

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

### run( parsedResult [, executionContext ] ) ###

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

### evaluate( expressionString [, executionContext ] ) ###

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
/* First, set up an empty context, and the container __func for custom functions */
var context = {};
context.__func = {};

/* Now define a custom function */
context.__func.toradians = function( degrees ) {
    return degrees * Math.PI / 180;
};
```

Now, when you run an expression that makes reference to your `toradians` function, it is called by *lexpjs* and the
result value is used in the remainder of the expression. For example, `cos(toradians(45))` would return `0.707106...`

Although we have used an anonymous function in this example, there is no reason you could not separately
define a named function, and simply use a reference to the function name in the context assignment, like
this:

```
var context = { ... } // other declarations for context elements

// Now define and add our function to the context
function toRadians(degrees) {
    return degrees * Math.PI / 180;
end
context.toradians = toRadians;
context.degToRad = toRadians;
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

## Intrinsic Functions

The library of intrinsic functions is not meant to perfectly mirror the functions available in JavaScript. The following are defined:

* `abs( value )` - Return the absolute value of its numeric argument.
* `sign( value )` - Return the sign (-1, 0, or 1) for the given numeric argument.
* `floor( value )` - Return the closest integer equal to or lower than the given numeric argument (e.g. `floor(4.2)==4`, `floor(3.999)=3`, `floor(-4.5)==-5`).
* `ceil( value )` - Return the closest integer equal to or greater than the given numeric argument.
* `round( value, ndec )` - Round the given value to `ndec` decimal places.
* `trunc( value )` - Truncate the decimals of the given value. It is different from `floor()` in that `trunc(-0.123)==0` where `floor(-0.123)=-1`.
* `cos/sin/tan( value )` - Trig functions; pass-throughs to their respective `Math` functions.
* `log/exp( value )` - Pass-throughs to `Math.log()` and `Math.exp()` respectively.
* `pow( num, power )` - Returns `num` raised to the `power`th power (e.g. `pow(2,8)==256`).
* `sqrt( num )` - Returns the square root of the given positive, non-zero real number.
* `min/max( num [, ...] )` - Returns the minimum/maximum of its arguments. `null` values are ignored.
* `len( string_or_array )` - Returns the length of the given string or array.
* `substr( string, start [, end] )` - Returns a substring of `string` starting with the `start`th character (0=first), and ending at `end`th; if `end` is not given, the entire remainder of the string is returned.
* `upper/lower( string )` - Return the given string converted to all upper/lower case.
* `match( s, p [, n] )` - Finds pattern (regular expression) `p` in string `s` and returns the matched substring. If the pattern contains groups, the optional `n` parameter may be provided to return the string matching the `n`th group (default is 0, the entire matched string).
* `find( s, p )` - Return the index of the pattern `p` in string `s`, or -1 if it is not found.
* `replace( s, p, r )` - Find all occurrences of pattern `p` in string `s` and replace them with string `r`.
* `int( value )` - Convert, if possible, the given value to an integer (passthrough to `parseInt()`. Returns `NaN` if invalid.
* `float( value )` - Convert, if possible, the given value to a Number (passthrough to `parseFloat()`. Returns `NaN` if invalid.
* `str( value )` - Converts the given value to a string. This is primarily to make the '+' operator deterministic and safe.
* `time()` - Returns the current time in milliseconds since the Epoch (e.g. `Date.now()`).
* `dateparts( time )` - Returns an object containing the various components of the given time. Keys are `year`, `month`, `day`, `hour`, `minute`, `second`, and `weekday` (0=Sunday, 1=Monday, ..., 6=Saturday).
* `isNaN( value )` - Returns `true` if the passed value is `NaN`, otherwise false.
* `isnull( value )` - Returns `true`if the passed value is `null`, otherwise false.
* `if( condExpression, trueExpression [, falseExpression] )` - Evaluates `condExpression` and, if *true*, returns the result of `trueExpression`; otherwise it returns the result of `falseExpression` if given, or `null` if not given.
* `isArray( arg )` - Returns *true* if the given item is an array.
* `isObject( arg )` - Returns *true* if the given item is an object (and not null).
* `keys( obj )` - Returns an array of the keys of object `obj`.
* `values( obj )` - Returns an array of the values of object `obj`.
* `join( array, string )` - Returns a string with all elements of `array` joined by `string` (e.g. `join({3,5,7}, ':')=="3:5:7"`).
* `indexOf( array, val )` - Returns the index of `val` in array, or -1 if not present.

I keep adding things as I need them or people ask, so let me know if I'm missing what you need.
