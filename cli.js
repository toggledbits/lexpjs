#!/usr/bin/env node

const lexp = require( './lexp' );

console.log( "lexp CLI, library version", lexp.version );
console.log( "Type CTRL-C or 'quit' to exit" );

process.stdout.write( 'lexpjs> ' );

let ctx = lexp.get_context();

process.stdin.on( 'data', ( c ) => {
    c = c.toString().trim();
    if ( "quit" === c || "exit" === c ) {
        process.exit( 0 );
        return;
    }
    try {
        let res = lexp.evaluate( c, ctx );
        console.log( "Result:", typeof(res), res );
    } catch ( err ) {
        console.log( err );
    }
    process.stdout.write( 'lexpjs> ' );
});
