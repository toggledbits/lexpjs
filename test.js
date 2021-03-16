var lexp = require("./lexp.js");
console.log(lexp);

var ctx = {
    __lvar: {},
    entity: {
        id: "house>123",
        name: "Some Switch",
        attributes: {
            power_switch: {
                state: true
            },
            position: {
                level: 0.1
            },
            volume: {
                level: 0.25
            }
        }
    },
    parameters: {
        amount: 0.13
    },
    arr: [
        { name: "Spot", type: "beagle" },
        { name: "Lucy", type: "shepherd" }
    ],
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
    , { expr: "99 && 44", expect: 44 }
    , { expr: "56 && 0", expect: 0 }
    , { expr: "0 && 55", expect: 0 }
    , { expr: "true || true", expect: true }
    , { expr: "true || false", expect: true }
    , { expr: "false || true", expect: true }
    , { expr: "false || false", expect: false }
    , { expr: "0 || 47", expect: 47 }
    , { expr: "43 || 0", expect: 43 }
    , { expr: "44 || 33", expect: 44 }
    , { expr: "!true", expect: false }
    , { expr: "!false", expect: true }
    , { expr: "true and true", expect: true }
    , { expr: "true and false", expect: false }
    , { expr: "false and true", expect: false }
    , { expr: "false and false", expect: false }
    , { expr: "true or true", expect: true }
    , { expr: "true or false", expect: true }
    , { expr: "false or true", expect: true }
    , { expr: "false or false", expect: false }
    , { expr: "not true", expect: false }
    , { expr: "not false", expect: true }

    , { expr: "0x40 | 0x04", expect: 0x44 }
    , { expr: "0x30 | 0x10", expect: 0x30 }
    , { expr: "0x40 & 0x04", expect: 0x00 }
    , { expr: "0x30 & 0x10", expect: 0x10 }
    , { expr: "~0x10", expect: ~0x10 }
    , { expr: "!0", expect: true }
    , { expr: "!1", expect: false }
    , { expr: "123 ?? 456", expect: 123 }
    , { expr: "123 ?? null", expect: 123 }
    , { expr: "null ?? 456", expect: 456 }
    , { expr: "t=0, 123 ?? (t=456)", expect: 123 }		/* test shortcut eval */
    , { expr: "t=0, 123 ?? (t=456), t", expect: 0 }		/* test shortcut eval */
    , { expr: "t=0, null ?? (t=456)", expect: 456 }		/* test shortcut eval */
    , { expr: "t=0, null ?? (t=456), t", expect: 456 }	/* test shortcut eval */
    , { expr: "true ? 123 : 456", expect: 123 }
    , { expr: "false ? 123 : 456", expect: 456 }
    , { expr: "[1,2,3]", Xxpect: [1,2,3] }
    , { expr: "{ alpha: 1, beta: 2, gamma: 3 }", Xxpect: { alpha: 1, beta: 2, gamma: 3 } }
    , { expr: "{ 'first': 'a', ['strange id']: 'b', 'Another Strange ID': 'voodoo' }", Xxpect: {} }

    , { expr: "1 in [ 5,6,4 ]", expect: true }	/* JS semantics: 1 is valid array index and existing member */
    , { expr: "4 in [ 5,6,4 ]", expect: false }	/* JS semantics: 4 is not valid array index/existing */
    , { expr: "1 in { one: 1, two: 2 }", expect: false }	/* in inspects keys, not values */
    , { expr: "2 in { one: 1, two: 2 }", expect: false }
    , { expr: "'one' in { one: 1, two: 2 }", expect: true }
    , { expr: "'two' in { one: 1, two: 2 }", expect: true }
    , { expr: "'three' in { one: 1, two: 2 }", expect: false }

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
    
    /* Null-conditional operators */
    , { expr: "entity?.id", expect: "house>123" }
    , { expr: "entity?.attributes" }
    , { expr: "entity?.attributes?.size?.octopus", expect: null }
    , { expr: "entity?.attributes?.size?.octopus ?? 99", expect: 99 }
    , { expr: "nontity?.id", expect: null }
    , { expr: "arr?[1]?.name", expect: "Lucy" }
    , { expr: "arg?[1]?.name", expect: null }
    , { expr: "arr[5]?.name", expect: null }

    /* Function tests */
    , { expr: "max(5,4,6*9)", expect: 54 }
    , { expr: "upper('hello')", expect: "HELLO" }
    , { expr: "lower('BYEBYE')", expect: "byebye" }
    , { expr: "ltrim('    abcde')", expect: "abcde" }
    , { expr: "rtrim('work     ')", expect: "work" }
    , { expr: "trim('       tight   ')", expect: "tight" }
    , { expr: "t='attributes',str(entity[t]['power_switch']['state'])", expect: "true" }
    , { expr: "round(3.14,0)", expect: 3 }
    , { expr: "round(3.98,0)", expect: 4 }
    , { expr: "round(3.14159265,3)", expect: 3.142 }
    , { expr: "round(-1.9)", expect: -2 }
    , { expr: "round(-1.3)", expect: -1 }
    , { expr: "time(2021,1,17)", expect: new Date(2021,0,17).getTime() }    /* Assumes FEATURE_MONTH_BASE == 1 (default) */
    , { expr: "dateparts(time(2021,1,17,3,4,5)).year", expect: 2021 }
    , { expr: "dateparts(time(2021,1,17,3,4,5)).month", expect: 1 }
    , { expr: "dateparts(time(2021,1,17,3,4,5)).day", expect: 17 }
    , { expr: "dateparts(time(2021,1,17,3,4,5)).hour", expect: 3 }
    , { expr: "dateparts(time(2021,1,17,3,4,5)).minute", expect: 4 }
    , { expr: "dateparts(time(2021,1,17,3,4,5)).second", expect: 5 }
    , { expr: "dateparts(time(2021,2,16,12,0,0)).weekday", expect: 2 }

    /* Conditional */
    , { expr: "if entity.attributes.power_switch.state then 1 else 0 endif", expect: 1 }
    , { expr: "if !entity.attributes.power_switch.state then 1 else 0 endif", expect: 0 }
    , { expr: "if entity.attributes.power_switch.state then 1 endif", expect: 1 }
    , { expr: "if !entity.attributes.power_switch.state then 1 endif", expect: null }

    /* Iteration */
    , { expr: "each item in [1,2,3,4,5]: 2*item" }
    , { expr: "each item in arr: item.name" }
    , { expr: "each item in keys(entity.attributes): item + '=' + entity.attributes[item]" }
    , { expr: "t=each item in 'hello': item + ' there', t?[0]", expect: "hello there" }
    , { expr: "t=0; each item in arr: do t=t+1; null done; t", expect: 2 }
    , { expr: "(first item in entity.attributes with !isnull(item?.level)).level == 0.1", expect: true }

    /* misc */
    , { expr: "1 ?? 0 & 4" }
    , { expr: "(1 ?? 0) & 4" }
    , { expr: "do 5, 6, 7, 8, 9 done", expect: 9 }
    , { expr: "'nice' # this is a comment", expect: "nice" }
    , { expr: "# this is a comment\n'hello'", expect: "hello" }
    , { expr: "([1,2,3])[1]", expect: 2 }
    , { expr: "min( 1, entity.attributes.volume.level - ( parameters.amount ?? 0.05 ) )" }
    , { expr: "t='off',({off:'OFF',on:'ON'})[t]", expect: "OFF" }
    , { expr: "first item in entity.attributes with (item?.level ?? 0) > 0.2" }
    , { expr: "modes={home:{hm:1,ac:'home'},away:{hm:2,ac:'away'},sleep:{hm:3,ac:'sleep'},smart1:{hm:4,ac:'smart1'}}, \
               (first item in modes with item.hm == 2).ac", expect: 'away' }
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
            console.log( "     Result:", res );
            if ( "undefined" !== typeof e.expect && res !== e.expect ) {
                console.log("**** Unexpected result; got", typeof res, res,", expected",typeof e.expect,e.expect);
                ++num_errors;
            }
        } catch ( err ) {
            console.log("**** Eval error:", err );
            console.log( JSON.stringify(ce) );
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
