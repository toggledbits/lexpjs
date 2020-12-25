var lexp = require("./lexp.js");
console.log(lexp);

var ctx = {
    __lvar: {},
    entity: {
        id: "house>123",
        name: "Some Switch",
        attributes: {
            "power_switch.state": true
        }
    },
    pi: 3.14159265
};

var test_expr = [
      { expr: "0", expect: 0 }
    , { expr: "\n\n\n\t\t1\t\t\n\n\r", expect: 1 }
    , { expr: "99221", expect: 99221 }
    , { expr: "-2", expect: -2 }
    , { expr: "0x40", expect: 64 }
    , { expr: "0xff", expect: 255 }
    , { expr: "0b1011", expect: 11 }
    , { expr: "0o177", expect: 127 }
    , { expr: "2.0", expect: 2.0 }
    , { expr: "2.75", expect: 2.75 }
    , { expr: "-5.0", expect: -5.0 }
    , { expr: "-4.88", expect: -4.88 }
    , { expr: "1e2", expect: 100 }
    , { expr: "1e-3", expect: 0.001 }
    , { expr: '"Hello"', expect: "Hello" }
    , { expr: "'There'", expect: "There" }
    , { expr: "`lexpjs`", expect: "lexpjs" }
    , { expr: "true", expect: true }
    , { expr: "false", expect: false }
    , { expr: "null", expect: null }
    , { expr: "pi", expect: ctx.pi }
    , { expr: "2**16", expect: 65536 }
    , { expr: "4*7", expect: 28 }
    , { expr: "5*0", expect: 0 }
    , { expr: "0*9", expect: 0 }
    , { expr: "350/7", expect: 50 }
    , { expr: "352%5", expect: 2 }
    , { expr: "357%5", expect: 2 }
    , { expr: "350%5", expect: 0 }
    , { expr: "65-8", expect: 57 }
    , { expr: "-5-6", expect: -11 }
    , { expr: "2+2", expect: 4 }
    , { expr: "-4+10", expect: 6 }
    , { expr: "4>>2", expect: 1 }
    , { expr: "2<<6", expect: 128 }
    , { expr: "-1 < 0", expect: true }
    , { expr: "-1 < 34", expect: true }
    , { expr: "-1 < -5", expect: false }
    , { expr: "-1 < -1", expect: false }
    , { expr: "-1 <= -5", expect: false }
    , { expr: "-1 <= -1", expect: true }
    , { expr: "1 > 4", expect: false }
    , { expr: "1 > 0", expect: true }
    , { expr: "1 > 1", expect: false }
    , { expr: "2 >= 1", expect: true }
    , { expr: "2 >= 2", expect: true }
    , { expr: "2 >= 3", expect: false }
    , { expr: "1 === 1", expect: true }
    , { expr: "1 === 2", expect: false }
    , { expr: "1 !== 2", expect: true }
    , { expr: "2 !== 2", expect: false }
    , { expr: "1 == '1'", expect: true }
    , { expr: "1 != '1'", expect: false }
    , { expr: "1 == '2'", expect: false }
    , { expr: "1 != '2'", expect: true }
    , { expr: "0b1100 ^ 0b1001", expect: 5 }
    , { expr: "true && true", expect: true }
    , { expr: "true && false", expect: false }
    , { expr: "false && true", expect: false }
    , { expr: "false && false", expect: false }
    , { expr: "true || true", expect: true }
    , { expr: "true || false", expect: true }
    , { expr: "false || true", expect: true }
    , { expr: "false || false", expect: false }
    , { expr: "0x40 | 0x04", expect: 0x44 }
    , { expr: "0x30 | 0x10", expect: 0x30 }
    , { expr: "0x40 & 0x04", expect: 0x00 }
    , { expr: "0x30 & 0x10", expect: 0x10 }
    , { expr: "~0x10", expect: ~0x10 }
    , { expr: "!true", expect: false }
    , { expr: "!false", expect: true }
    , { expr: "!0", expect: true }
    , { expr: "!1", expect: false }
    , { expr: "123 ?? 456", expect: 123 }
    , { expr: "123 ?? null", expect: 123 }
    , { expr: "null ?? 456", expect: 456 }
    , { expr: "true ? 123 : 456", expect: 123 }
    , { expr: "false ? 123 : 456", expect: 456 }
    , { expr: "[1,2,3]", Xxpect: [1,2,3] }
    , { expr: "{ alpha: 1, beta: 2, gamma: 3 }", Xxpect: { alpha: 1, beta: 2, gamma: 3 } }
    , { expr: "{ first: 'a', ['strange id']: 'b' }", Xxpect: {} }

    /* Assignment test, two steps */
    , { expr: "t = 'soul stone'", expect: "soul stone" }
    , { expr: "t", expect: "soul stone" }

    /* "PEMDAS" tests */
    , { expr: "( 4 + 5 ) + 6", expect: 15 }
    , { expr: "( 4 * 5 ) + 6", expect: 26 }
    , { expr: "( 4 + 5 ) * 6", expect: 54 }
    , { expr: "( 4 + 5 ) / 6", expect: 9/6 }
    , { expr: "1 + (2 + (3 + (4 + (5 + (6 + ( 7 ))))))", expect: 28 }
    , { expr: "3 * 2**4", expect: 48 }
    , { expr: "2 ** 4 ** 2", expect: 65536 } /* right association, so 2 ** 16 = 65536, not 16 ** 2 = 256 */
    , { expr: "3 * 8 / 12", expect: 2 }
    , { expr: "27 / 3 * 4", expect: 36 }
    , { expr: "4 * 8 + 2", expect: 34 }
    , { expr: "4 - 8 * 2", expect: -12 }
    
    /* Function tests */
    , { expr: "upper('hello')", expect: "HELLO" }
    , { expr: "lower('BYEBYE')", expect: "byebye" }
];

var exp = '"Hello",{},{alpha:1,beta:2,["not.valid.name"]:3},t=[9,5,1],join(t,"::"),time(),x=2*y=2*z=3,x,y,z,(9)';

console.log("Expression:",exp);
var t1 = Date.now();
console.log(lexp.evaluate(exp, ctx));
console.log("Parse time:",Date.now()-t1,"ms");

var num_errors = 0;
test_expr.forEach( function( e ) {
    console.log("Test expression: ", e.expr);
    var ce, res;
    try {
        ce = lexp.compile( e.expr );
        try {
            res = lexp.run( ce, ctx );
            if ( !Array.isArray(res) ) {
                console.log("**** Invalid return data",typeof res,res);
                ++num_errors;
            } else if ( "undefined" !== typeof e.expect && res[0] !== e.expect ) {
                console.log("**** Unexpected result; got",typeof res[0],res[0],", expected",typeof e.expect,e.expect);
                console.log("     Full result:", res);
                ++num_errors;
            } else {
                console.log( "     Result:", res[0] );
            }
        } catch ( err ) {
            console.log("**** Eval error:", err );
            ++num_errors;
        }
    } catch ( err ) {
        console.log( "**** Compile error:", err );
        ++num_errors;
    }
});
console.log("Errors:", num_errors);
if ( 0 !== num_errors ) {
    process.exit( 1 );
}