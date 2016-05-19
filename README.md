# lexpjs
lexpjs is a Lightweight EXPression parser and evaluator for JavaScript.

Lexpjs supports simple mathemtical expressions for addition, subtraction, multiplication,
division, modulus, bitwise operations, and logical operations. It has a small library of
built-in functions (abs, cos, sin, floor, ceil, round, etc.).

Through a passed-in context table, lexpjs supports named variables, and custom functions.
See the documentation below for how to implement these.

Lexpjs is offered under GPL 3.0.

## Known Issues ##

* Variables defined in the evaluation context can be read by the evaluator, but there is no facility to change
values or create new variables during expression evaluation (i.e. there is not assignment operation/statement).
The "=" operator is currently used for equality comparison, but this may change in future and you are advised 
not to use it for comparisons. [repository issue #1](https://github.com/toggledbits/lexpjs/issues/1)

* Lexpjs has been tested under [requirejs](https://github.com/requirejs/requirejs). It has not been tested with other
loaders. Reports on success or failure would be appreciated--make your comment in an issue in this repository.

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

This is a very rough BNF for the parser:

```
<expression> ::= <number>
               | <string>
               | <variable-name>
               | <function-name> "(" <argument-list> ")"
               | <expression> <binary-operator> <expression>
               | <unary-operator> <expression>
               | "(" <expression> ")"
               
<argument-list> ::= "" | <expression-list>
                  
<expression-list> ::= <expression> [ "," <expression-list> ]

<unary-operator> ::= "-" | "+" | "!"

<binary-operator> ::= "+" | "-" | "*" | "/" | "%"
                    | "&" | "|" | "^"
                    | "<" | "<=" | ">" | ">=" | "==" | "=" | "<>" | "!="

<number> ::= <decimal-integer>
           | "0x" <hexadecimal-integer>
           | "0b" <binary-integer>
           | "0" <octal-integer>
           | <decimal-rational-number>
         
<string> ::= "'" <characters> "'"
           | '"' <characters> '"'
           
<variable-name> ::= <letter> { <letter> | <digit> | "_" | "." }

<function-name> ::= <letter> { <letter> | <digit> | "_" }
```

## The Basics ##

Lexpjs is designed to be run under [requirejs](https://github.com/requirejs/requirejs) or similar loader.

### compile( expressionString ) ###

The `compile()` function accepts a single argument, the string the containing the expression to be parsed.
If parsing of the expression succeeds, the function returns a JavaScript Array containing the parse tree 
that is used as input to `run()` later. If parsing fails, the function throws an exception.

Example: 

```
require('lexp', function('lexp') {
    try {
        pp = lexp.compile('2 + 3 * 4 + 5");
    } catch (e) {
        console.log("Parsing failed: " + e.message);
    }
    ...
});
```

### run( parsedResult [, executionContext ] ) ###

The `run()` function executes the parsed expression. It takes an optional `executionContext` argument, which 
is a table containing variable names and functions.

`run()` returns the result of the expression evaluation. The result is always a primitive type (number or string)
if the evaluation is successful. If it fails, an exception is thrown.

Example:

```
var context = { "median": "50" };
var pp = lexp.compile("8 * range");
var rr = lexp.run(pp); 
// In runtime, this example throws ReferenceError because "range" is not defined in "context"
```

As of this version, Lexpjs does not allow you to modify variables or create new ones during evaluation.

### evaluate( expressionString [, executionContext ] ) ###

The `evaluate()` function performs the work of `compile()` and `run()` in one step. The function result
is the value of the parsed and evaluated expression, unless a parsing or evaluation error occurs, in which
case an exception is thrown.

```
var context = { "minval": 25, "maxval": 77 };
var rr = lexp.evaluate("minval+(maxval-minval)/2", context);
// rr would be 51
```

## User-defined Variables ##

The context passed to `evaluate()` and `run()` is used to define named variables and custom functions
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

In expressions, the `device.class` would be the value "motor". Referring simply to `device`, however, would return a runtime
evaluation error. The voltage of the motor is referenced by the name `device.info.specs.voltage` in an expression.

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
local context = {
    "toradians": function( degrees ) {
        return degrees * Math.PI / 180;
    }
};
```

Now, when you run an expression that makes reference to your `toradians` function, it is called by lexpjs and the
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
but when we made the context assignment, the context element key is all lower case. This means that 
any expression would also need to use all lower case. The name used in evaluation is the name of the key,
not the actual name of the actual function. 
As a further example, `degToRad` is also defined
as an expression function that is implemented by `toRadians()`, showing that there's no required parity between
the name used in the expression context and the name of the function implementing it.
