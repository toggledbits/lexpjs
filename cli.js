#!/usr/bin/env node

const show_parsed = false;  /* Set true to see parsed expressions in output */

const lexp = require( './lexp' );

console.log( "lexp CLI, library version", lexp.version );
console.log( "Type CTRL-C or 'quit' to exit" );

var emap = function( key, value ) {
    if ( Number.isNaN( value ) ) {
        return "--NaN--";
    } else if ( value === Infinity || value === -Infinity ) {
        return `--${value.toString()}--`;
    }
    return value;
}

process.stdout.write( 'lexpjs> ' );

let ctx = lexp.get_context();

process.stdin.on( 'data', ( c ) => {
    c = c.toString().trim();
    if ( "quit" === c || "exit" === c ) {
        process.exit( 0 );
        return;
    }
    try {
        const cx = lexp.compile( c );
        if ( show_parsed ) {
            console.log(JSON.stringify(cx, emap, 4));
            console.log("Variable references:", lexp.get_vrefs( cx ));
        }
        let res = lexp.run( cx, ctx );
        console.log( "Result:", typeof(res), res );
    } catch ( err ) {
        console.log( err );
    }
    process.stdout.write( 'lexpjs> ' );
});
