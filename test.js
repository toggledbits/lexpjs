const version = 21314;

const verbose = false;  // If true, all tests and results printed; otherwise just errors.

var lexp = require("./lexp.js");
// console.log(lexp);

var ctx = lexp.get_context( {
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
});

var test_expr = [
      { expr: '"Hello"', expect: "Hello" }
    , { expr: "'There'", expect: "There" }
    , { expr: "`lexpjs`", expect: "lexpjs" }
    , { expr: "`This is \\`fine\\``", expect: "This is `fine`" }
    , { expr: '"So \\"is\\" this"', expect: "So \"is\" this" }
    , { expr: "'\\t\\n'", expect: "\t\n" }
    , { expr: "`I'm a little \\\n\t\tteapot`", expect: "I'm a little teapot" }
    , { expr: '"he\\x40\\u0041llo\\u{000021} " + ' + "'there' + `\\nagain`", expect: "he@Allo! there\nagain" }
    , { expr: "# Evaluate the string as best we can\n1 + 1\n# That's it; that's the expression.", expect: 2 }
    , { expr: "'\\t\\\\t\\z\\.'", expect: "\t\\tz." }
    , { expr: "\n\n\n\t\t1\t\t\n\n\r", expect: 1 }

    , { expr: "0", expect: 0 }
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
    , { expr: "(-4)>>2", expect: -1 }
    , { expr: "16>>>3", expect: 2 }
    , { expr: "(-16)>>>3", expect: 536870910 }      /* Assuming unsigned 32-bit integer */
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

    , { expr: "`red` + `blue`", expect: "redblue" }
    , { expr: "null + `blue`", expect: "blue" }
    , { expr: "`red` + null", expect: "red" }

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
    , { expr: "3..6", expect: [3,4,5,6] }
    , { expr: "6..3", expect: [6,5,4,3] }
    , { expr: "0.5..2.6", expect: [0,1,2] }
    , { expr: "123 ?? 456", expect: 123 }
    , { expr: "123 ?? null", expect: 123 }
    , { expr: "null ?? 456", expect: 456 }
    , { expr: "t=0, 123 ?? (t=456)", expect: 123 }      /* test shortcut eval */
    , { expr: "t=0, 123 ?? (t=456), t", expect: 0 }     /* test shortcut eval */
    , { expr: "t=0, null ?? (t=456)", expect: 456 }     /* test shortcut eval */
    , { expr: "t=0, null ?? (t=456), t", expect: 456 }  /* test shortcut eval */
    , { expr: "123 ?# null", expect: 123 }
    , { expr: "'123' ?# null", expect: 123 }
    , { expr: "'fox' ?# 'hound'", expect: 'hound' }
    , { expr: "null ?# 'deer'", expect: 'deer' }
    , { expr: "true ?# 'elk'", expect: 'elk' }
    , { expr: "(1/0) ?# 'rabbit'", expect: 'rabbit' }
    , { expr: "true ? 123 : 456", expect: 123 }
    , { expr: "false ? 123 : 456", expect: 456 }
    , { expr: "[1,2,3]", expect: [1,2,3] }
    , { expr: "([9,8,7,6])[2]", expect: 7 }
    , { expr: "[1,2,3] == [1,2,3]", expect: false }     /* because different objects in memory */
    , { expr: "s=[1,2,3], t=s, s==t", expect: true }    /* because same object in memory */
    , { expr: "{ alpha: 1, beta: 2, gamma: 3 }", expect: { alpha: 1, beta: 2, gamma: 3 } }
    , { expr: "{ 'first': 'a', ['strange id']: 'b', 'Another Strange ID': 'voodoo' }", expect: { first: 'a', 'strange id': 'b', 'Another Strange ID': 'voodoo' } }

    , { expr: "1 in [ 5,6,4 ]", expect: true }  /* JS semantics: 1 is valid array index and existing member */
    , { expr: "4 in [ 5,6,4 ]", expect: false } /* JS semantics: 4 is not valid array index/existing */
    , { expr: "1 in { one: 1, two: 2 }", expect: false }    /* in inspects keys, not values */
    , { expr: "2 in { one: 1, two: 2 }", expect: false }
    , { expr: "'one' in { one: 1, two: 2 }", expect: true }
    , { expr: "'two' in { one: 1, two: 2 }", expect: true }
    , { expr: "'three' in { one: 1, two: 2 }", expect: false }

    /* Assignment test, two steps */
    , { expr: "t = 'soul stone'", expect: "soul stone" }
    , { expr: "t", expect: "soul stone" }
    , { expr: "gem\u00b5se='gut',t=null,gem\u00b5se", expect: "gut" }

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

    /* Null arithmetic */
    , { expr: "1 + null", expect: 1 }
    , { expr: "4 * null", expect: 0 }
    , { expr: "4 / null", expect: Infinity }
    , { expr: "null / 4", expect: 0 }

    /* Null-conditional/coalescing operators */
    , { expr: "entity?.id", expect: "house>123" }
    , { expr: "entity?.attributes" }
    , { expr: "entity?.attributes?.size?.octopus", expect: null }
    , { expr: "entity?.attributes?.size?.octopus ?? 99", expect: 99 }
    , { expr: "nontity?.id", expect: null }
    , { expr: "arr?[1]?.name", expect: "Lucy" }
    , { expr: "arg?[1]?.name", expect: null }
    , { expr: "arr[5]?.name", expect: null }
    , { expr: "1 ?? 0 & 4" }
    , { expr: "(1 ?? 0) & 4" }

    /* Function tests */
    , { expr: "min(5,4,6*9)", expect: 4 }
    , { expr: "max(5,4,6*9)", expect: 54 }
    , { expr: "min( 7..-33 )", expect: -33 }
    , { expr: "max( 7..-33 )", expect: 7 }
    , { expr: "min( 1, 5, 6, [ 3, 0, 4, [ 9, -1 ] ] )", expect: -1 }
    , { expr: "max( 1, 5, 6, [ 3, 0, 4, [ 9, -1 ] ] )", expect: 9 }
    , { expr: "upper('hello')", expect: "HELLO" }
    , { expr: "lower('BYEBYE')", expect: "byebye" }
    , { expr: "ltrim('    abcde  ')", expect: "abcde  " }
    , { expr: "rtrim('   work     ')", expect: "   work" }
    , { expr: "trim('       tight   ')", expect: "tight" }
    , { expr: "t='attributes',str(entity[t]['power_switch']['state'])", expect: "true" }
    , { expr: "floor(3.8)", expect: 3 }
    , { expr: "floor(-3.8)", expect: -4 }
    , { expr: "ceil(3.8)", expect: 4 }
    , { expr: "ceil(-3.8)", expect: -3 }
    , { expr: "trunc(3.8)", expect: 3 }
    , { expr: "trunc(-3.8)", expect: -3 }
    , { expr: "round(3.14,0)", expect: 3 }
    , { expr: "round(3.98,0)", expect: 4 }
    , { expr: "round(3.14159265,3)", expect: 3.142 }
    , { expr: "round(-1.9)", expect: -2 }
    , { expr: "round(-1.3)", expect: -1 }
    , { expr: "int('123')", expect: 123 }
    , { expr: "t=int('123'), isNaN(t)", expect: false }
    , { expr: "t=int('abc'), isNaN(t)", expect: true }
    , { expr: "int('0x40')", expect: 64 }
    , { expr: "bool(0)", expect: false }
    , { expr: "bool(1)", expect: true }
    , { expr: "bool(null)", expect: false }         /* null is false-y */
    , { expr: "bool(``)", expect: false }           /* empty string is false-y */
    , { expr: "bool('hello')", expect: true }       /* non-empty string is truthy */
    , { expr: "bool('yes')", expect: true }         /* the word "YES" is explicitly truthy */
    , { expr: "bool('true')", expect: true }        /* as is the word "TRUE" */
    , { expr: "bool('no')", expect: false }         /* but string "no" is false-y */
    , { expr: "bool('off')", expect: false }        /* and "off" is false-y */
    , { expr: "bool('false')", expect: false }      /* and of course, "false" is false-y */
    , { expr: "bool('1')", expect: true }           /* string "1" is explicitly truthy */
    , { expr: "bool(Infinity)", expect: true }
    , { expr: "bool(NaN)", expect: false }
    , { expr: "isNaN('123')", expect: false }
    , { expr: "isNaN('abc')", expect: true }
    , { expr: "isNaN(NaN)", expect: true }
    , { expr: "isInfinity(123)", expect: false }
    , { expr: "isInfinity(1/0)", expect: true }
    , { expr: "isInfinity(null)", expect: false }
    , { expr: "isInfinity(Infinity)", expect: true }
    , { expr: "isInfinity(-Infinity)", expect: true }
    , { expr: "time(2021,1,17)", expect: new Date(2021,0,17).getTime() }    /* Assumes FEATURE_MONTH_BASE == 1 (default) */
    , { expr: "typeof( dateparts().year ) ", expect: "number" }
    , { expr: "dateparts(time(2021,1,17,3,4,5)).year", expect: 2021 }
    , { expr: "dateparts(time(2021,1,17,3,4,5)).month", expect: 1 }
    , { expr: "dateparts(time(2021,1,17,3,4,5)).day", expect: 17 }
    , { expr: "dateparts(time(2021,1,17,3,4,5)).hour", expect: 3 }
    , { expr: "dateparts(time(2021,1,17,3,4,5)).minute", expect: 4 }
    , { expr: "dateparts(time(2021,1,17,3,4,5)).second", expect: 5 }
    , { expr: "dateparts(time(2021,2,16,12,0,0)).weekday", expect: 2 }
    , { expr: "match( 'The rain in Spain stays mainly in the plain.', 'rain' )", expect: "rain" }
    , { expr: "match( 'The rain in Spain stays mainly in the plain.', 'Sp(ai)n', 1 )", expect: "ai" }
    , { expr: "match( 'The rain in Spain stays mainly in the plain.', 'RAIN', 0, 'i' )", expect: "rain" }
    , { expr: "t='Does this work?', match( t, '\\st' )", expect: null }
    , { expr: "t='Does this work?', match( t, '\\\\st' )", expect: " t" }
    , { expr: "find( 'The rain in Spain stays mainly in the plain.', 'main' )", expect: 24 }
    , { expr: "find( 'The rain in Spain stays mainly in the plain.', 'RAIN', 'i' )", expect: 4 }
    , { expr: "replace( 'The quick brown fox', 'b[a-z]+', 'gray' )", expect: "The quick gray fox" }
    , { expr: "replace( 'The quick brown fox', 'o', 'A', 'ig' )", expect: "The quick brAwn fAx" }
    , { expr: "replace( 'Who hears the fishes when they cry?', 'w', 'Z', 'ig' )", expect: "Zho hears the fishes Zhen they cry?" }
    , { expr: "count( [ 1,5,9 ] )", expect: 3 }
    , { expr: "count( [ 1, null, 9, false, 0 ] )", expect: 4 }
    , { expr: "sum( [ 1,5,9 ] )", expect: 15 }
    , { expr: "sum( 56 )", expect: 0 } /* only accepts array */
    , { expr: "median( [9,2,5] )", expect: 5 }
    , { expr: "median( [9,2,5,7] )", expect: 6 }
    , { expr: "median( [ 4 ] )", expect: 4 }
    , { expr: "median( [ 6,4 ] )", expect: 5 }
    , { expr: "median( [] )", expect: null }
    , { expr: "concat( [1,2,3], [4,5,6] )", expect: [1,2,3,4,5,6] }
    , { expr: "slice( [10,20,30,40,50,60], 2, 3 )", expect: [ 30 ] }
    , { expr: "slice( [10,20,30,40,50,60], 3 )", expect: [ 40,50,60 ] }
    , { expr: "t=[10,20,30], insert( t, 1, 99 )", expect: [ 10,99,20,30 ] }
    , { expr: "t=[10,20,30], insert( t, 1, 99 ), t", expect: [ 10,99,20,30 ] }  /* confirm original array modified in place */
    , { expr: "t=[11,22,33,44,55,66], remove( t, 2 )", expect: [ 11, 22, 44, 55, 66 ] }
    , { expr: "t=[11,22,33,44,55,66], remove( t, 1, 3 )", expect: [ 11, 55, 66 ] }
    , { expr: "t=[11,22,33,44,55,66], remove( t, 1, 3 ), t", expect: [ 11, 55, 66 ] }    /* confirm original array modified in place */
    , { expr: "t=[ 'dog', 'cat' ], push( t, 'wombat' )", expect: [ 'dog', 'cat', 'wombat' ] }
    , { expr: "t=[ 'dog', 'cat' ], push( t, 'wombat' ), t", expect: [ 'dog', 'cat', 'wombat' ] } /* confirm modified in place */
    , { expr: "t=[ 'dog', 'cat' ], pop( t )", expect: "cat" }
    , { expr: "t=[ 'dog', 'cat' ], pop( t ), t", expect: [ "dog" ] }     /* confirm modified in place */
    , { expr: "t=[ 'dog', 'cat' ], unshift( t, 'wombat' )", expect: [ 'wombat', 'dog', 'cat' ] }
    , { expr: "t=[ 'dog', 'cat' ], unshift( t, 'wombat' ), t", expect: [ 'wombat', 'dog', 'cat' ] } /* confirm modified in place */
    , { expr: "t=[ 'dog', 'cat' ], shift( t )", expect: "dog" }
    , { expr: "t=[ 'dog', 'cat' ], shift( t ), t", expect: [ "cat" ] }     /* confirm modified in place */
    , { expr: "t=[1,2,3,4,5,6,7,8,9,10], push( t, 11, 4 )", expect: [ 8,9,10,11 ] }
    , { expr: "t=[1,2,3,4,5,6,7,8,9,10], unshift( t, 0, 5 )", expect: [ 0,1,2,3,4 ] }
    , { expr: "t=[9,7,5],s=t,push(s, 3),t", expect: [9,7,5,3] }
    , { expr: "t=[9,7,5],s=clone(t),push(s, 3),t", expect: [9,7,5] }
    , { expr: "s", expect: [9,7,5,3] }

    , { expr: "t=['dog','cat','rat'],u=['whale','shark','rat'],arrayConcat( t, u )", expect: [ 'dog','cat','rat','whale','shark','rat' ] }

    , { expr: "t=['dog','cat','rat'],u=['whale','shark','rat'],arrayIntersection( t, u )", expect: [ 'rat' ] }
    , { expr: "t=['dog','cat','rat'],u=['whale','shark','bat'],arrayIntersection( t, u )", expect: [] }
    , { expr: "t=['dog','cat','toad'],u=['toad','shark','whale'],arrayIntersection( t, u )", expect: [ 'toad' ] }

    , { expr: "t=['dog','cat','rat'],u=['whale','shark','rat'],arrayDifference( t, u )", expect: [ 'dog', 'cat' ] }
    , { expr: "t=['dog','cat','rat'],u=['cat','rat','dog'],arrayDifference( t, u )", expect: [] }
    , { expr: "t=['dog','cat','rat'],u=['whale','shark','bat'],arrayDifference( t, u )", expect: [ 'dog', 'cat', 'rat' ] }
    , { expr: "t=['dog','cat','toad'],u=['whale','shark','bat'],arrayDifference( t, u )", expect: [ 'dog', 'cat', 'toad' ] }

    , { expr: "t=['dog','cat','rat'],u=['whale','shark','rat'],arrayExclusive( t, u )", expect: [ 'dog', 'cat', 'whale', 'shark' ] }
    , { expr: "t=['dog','cat','rat'],u=['dog','cat','rat'],arrayExclusive( t, u )", expect: [] }
    , { expr: "t=['dog','cat','rat'],u=['whale','shark','bat'],arrayExclusive( t, u )", expect: [ 'dog', 'cat', 'rat', 'whale', 'shark', 'bat' ] }
    , { expr: "t=['dog','cat','toad'],u=['whale','shark','bat'],arrayExclusive( t, u )", expect: [ 'dog', 'cat', 'toad', 'whale', 'shark', 'bat' ] }

    , { expr: "t=['dog','cat','rat'],u=['whale','shark','rat'],arrayUnion( t, u )", expect: [ 'dog', 'cat', 'rat', 'whale', 'shark' ] }
    , { expr: "t=['dog','cat','rat'],u=['dog','cat','rat'],arrayUnion( t, u )", expect: [ 'dog', 'cat', 'rat' ] }
    , { expr: "t=[],u=['whale','shark','bat'],arrayUnion( t, u )", expect: [ 'whale', 'shark', 'bat' ] }

    , { expr: `t=btoa( "The rain in Spain stays mainly in the plain." )`, expect: "VGhlIHJhaW4gaW4gU3BhaW4gc3RheXMgbWFpbmx5IGluIHRoZSBwbGFpbi4=" }
    , { expr: `atob( t )`, expect: "The rain in Spain stays mainly in the plain." }
    , { expr: `t=atob( "SmVmZnJleSBFcHN0ZWluIGRpZG4ndCBraWxsIGhpbXNlbGYsIGFuZCBuZWl0aGVyIGRpZCBKb2huIE1jQWZlZS4=" )`, expect: "Jeffrey Epstein didn't kill himself, and neither did John McAfee." }
    , { expr: `btoa( t )`, expect: "SmVmZnJleSBFcHN0ZWluIGRpZG4ndCBraWxsIGhpbXNlbGYsIGFuZCBuZWl0aGVyIGRpZCBKb2huIE1jQWZlZS4=" }

    , { expr: `urlencode( 'This is a string %&*@(!.{}:/?' )`, expect: "This%20is%20a%20string%20%25%26*%40(!.%7B%7D%3A%2F%3F" }
    , { expr: `urldecode( 'This%20is%20a%20string%20%25%26*%40(!.%7B%7D%3A%2F%3F' )`, expect: "This is a string %&*@(!.{}:/?" }

    , { expr: `hex( 255 )`, expect: "ff" }
    , { expr: `hex( 65536 )`, expect: "10000" }

    , { expr: `typeof(true)`, expect: "boolean" }
    , { expr: `typeof(false)`, expect: "boolean" }
    , { expr: `typeof(null)`, expect: "null" }
    , { expr: `typeof(NaN)`, expect: "number" }
    , { expr: `typeof(Infinity)`, expect: "number" }
    , { expr: `typeof(0)`, expect: "number" }
    , { expr: `typeof(-123)`, expect: "number" }
    , { expr: `typeof(456)`, expect: "number" }
    , { expr: `typeof(3.14159265)`, expect: "number" }
    , { expr: `typeof(1e20)`, expect: "number" }
    , { expr: `typeof("dog and cat")`, expect: "string" }
    , { expr: `typeof([])`, expect: "array" }
    , { expr: `typeof({})`, expect: "object" }
    , { expr: `typeof(entity.attributes)`, expect: "object" }

    /* Conditional */
    , { expr: "if entity.attributes.power_switch.state then 1 else 0 endif", expect: 1 }
    , { expr: "if !entity.attributes.power_switch.state then 1 else 0 endif", expect: 0 }
    , { expr: "if entity.attributes.power_switch.state then 1 endif", expect: 1 }
    , { expr: "if !entity.attributes.power_switch.state then 1 endif", expect: null }

    /* Iteration */
    , { expr: "each item in [1,2,3,4,5]: 2*item", expect: [ 2,4,6,8,10 ] }
    , { expr: "each item,index in [1,2,3,4,5]: 3*index", expect: [ 0,3,6,9,12 ] }
    , { expr: "each v in null: true", expect: [] }
    , { expr: "each v in 123: v", expect: [ 123 ] }
    , { expr: "each v,k in { 'alpha': 1, 'beta': 2 }: k", expect: [ "alpha", "beta" ] }
    , { expr: "each v,k in [9,8,7,6]: k", expect: [ 0, 1, 2, 3 ] }
    , { expr: "each item in arr: item.name", expect: [ "Spot", "Lucy" ] }
    , { expr: "each item,key in entity.attributes: key", expect: [ "power_switch", "position", "volume" ] }
    , { expr: "each item in keys(entity.attributes): item + '=' + entity.attributes[item]" }
    , { expr: "t=each item in 'hello': item + ' there', t?[0]", expect: "hello there" }
    , { expr: "t=0; each item in arr: do t=t+1; null done; t", expect: 2 }
    , { expr: "each n in 1..3: [4,5,6]", expect: [ [4,5,6],[4,5,6],[4,5,6] ] }
    , { expr: "each n in 4..6: [n,n+1,n+2]", expect: [ [4,5,6],[5,6,7],[6,7,8] ] }
    , { expr: 'testArr = [ ["dog",1,{a:"b"}] , [1,"five",[]] , ["1","one",[1]] ], each element in testArr: indexOf(element,1)', expect: [ 1, 0, -1 ] }
    , { expr: "each n in 1..3: yyy=n, yyy", expect: null } /* scope of yyy is interior to each */
    , { expr: "t=[3,4],first m in t with m", expect: 3 }
    , { expr: "t=[3,4],first m in t with m<=4", expect: 3 }
    , { expr: "t=[3,4],first m in t with m>=4", expect: 4 }
    , { expr: "t=[3,4],first m in t with m>=6", expect: null }
    , { expr: "first v in null with true", expect: null }
    , { expr: "first v in 123 with true", expect: 123 }
    , { expr: "(first item in entity.attributes with !isnull(item?.level)).level == 0.1", expect: true }
    , { expr: "first item in entity.attributes with (item?.level ?? 0) > 0.2", expect: { level: 0.25 } }
    , { expr: "modes={home:{hm:1,ac:'home'},away:{hm:2,ac:'away'},sleep:{hm:3,ac:'sleep'},smart1:{hm:4,ac:'smart1'}}, \
               (first item in modes with item.hm == 2).ac", expect: 'away' }
    , { expr: "t=[7,23,3,4],first m in t with m<=4: 2*m", expect: 6, verbose:true }
    , { expr: "t=[1,0,3,4],first m in t with m>=4: 2*m", expect: 8, verbose:true }

    /* misc */
    , { expr: "do 5, 6, 7, 8, 9 done", expect: 9 }
    , { expr: "do yyy=444 done, yyy", expect: null }
    , { expr: "'nice' # this is a comment", expect: "nice" }
    , { expr: "# this is a comment\n'hello'", expect: "hello" }
    , { expr: "([1,2,3])[1]", expect: 2 }
    , { expr: "min( 1, entity.attributes.volume.level - ( parameters.amount ?? 0.05 ) )", expect: 0.12 }
    , { expr: "t='off',({off:'OFF',on:'ON'})[t]", expect: "OFF" }

    /* definable functions */
    , { expr: "define square(a) a*a, [ square(5), square(0), square(-5) ]", expect: [ 25, 0, 25 ] }
    , { expr: `define botch(q) '"'+str(q)+'"', botch('hello','there')`, expect: '"hello"' }
    , { expr: `define botch(q,p) '"'+str(q)+str(p)+'"', botch('hello')`, expect: '"hellonull"' }

    /* scope tests */
    , { expr: "xyzzy='', do global xyzzy='global' done, xyzzy", expect: "global" }
    , { expr: 'outer="outer", do local xyzzy="inner", outer=xyzzy done, xyzzy', expect: "global" }
    , { expr: 'outer', expect: 'inner' }

    , { expr: 'area=3.14159265*4*4' }
    , { expr: "'half the area is ' + area / 2" }

    /* Sorting with user-defined control expression or function */
    , { expr: 'sort( [ "e", "d", "b", "a", "c" ] )', expect: [ "a", "b", "c", "d", "e" ] }
    , { expr: 'define ff(a,b) a < b ? 1 : ( a == b ? 0 : -1 ), sort( [ "e", "d", "b", "a", "c" ], ff )', expect: [ "e", "d", "c", "b", "a" ] }
    , { expr: 'sort( [ "e", "d", "b", "a", "c" ], $1 < $2 ? 1 : ( $1 == $2 ? 0 : -1 ) )', expect: [ "e", "d", "c", "b", "a" ] }
    , { expr: 'sort( [ "e", "d", "b", "a", "c" ], 0 )', expect: [ "e", "d", "b", "a", "c" ] }
];

function compareArrays( a, b ) {
    let n = a.length;
    if ( n !== b.length ) {
        return false;
    }
    for ( let k=0; k<n; ++k ) {
        if ( typeof a[k] !== typeof b[k] ) {
            return false;
        }
        if ( Array.isArray( a[k] ) ) {
            if ( ! compareArrays( a[k], b[k] ) ) {
                return false;
            }
        } else if ( null !== a[k] && "object" === typeof a[k] ) {
            if ( ! compareObjects( a[k], b[k] ) ) {
                return false;
            }
        } else if ( a[k] !== b[k] ) {
            return false;
        }
    }
    return true;
}

function compareObjects( a, b ) {
    let ak = Object.keys( a ).sort();
    let bk = Object.keys( b ).sort();
    if ( !compareArrays( ak, bk ) ) {
        return false;
    }
    let n = ak.length;
    for ( let k=0; k<n; ++k ) {
        key = ak[ k ];
        if ( Array.isArray( a[key] ) ) {
            if ( ! Array.isArray( b[key] ) ) {
                return false;
            }
            if ( !compareArrays( a[key], b[key] ) ) {
                return false;
            }
        } else if ( null === a[key] ) {
            if ( null !== b[key] ) {
                return false;
            }
        } else if ( "object" === typeof a[key] ) {
            if ( "object" !== typeof b[key] ) {
                return false;
            }
            if ( !compareObjects( a[key], b[key] ) ) {
                return false;
            }
        } else if ( a[key] !== b[key] ) {
            return false;
        }
    }
    return true;
}

var num_errors = 0;
test_expr.forEach( function( e ) {
    let chatty = "undefined" === typeof e.verbose ? verbose : e.verbose;
    if ( chatty ) {
        console.log("Test expression: ", e.expr);
    }
    var ce, res;
    try {
        ce = lexp.compile( e.expr );
        try {
            res = lexp.run( ce, ctx );
            if ( "undefined" !== typeof e.expect ) {
                let failed = true;
                if ( Array.isArray( e.expect ) ) {
                    if ( Array.isArray( res ) ) {
                        failed = !compareArrays( e.expect, res );
                    }
                } else if ( null === e.expect ) {
                    failed = null !== res;
                } else if ( "object" === typeof e.expect ) {
                    if ( "object" === typeof res ) {
                        failed = !compareObjects( e.expect, res );
                    }
                } else if ( res === e.expect ) {
                    failed = false;
                }
                if ( chatty ) {
                    console.log( "     Result:", res );
                }
                if ( failed ) {
                    if ( !chatty ) {
                        console.error( "\nTest expression: ", e.expr );
                        console.error( "     Result:", res );
                    }
                    console.error("**** Unexpected result; got", typeof res, res, ", expected", typeof e.expect, e.expect);
                    ++num_errors;
                }
            } else {
                if ( chatty ) {
                    console.log( "     Result:", res );
                }
            }
        } catch ( err ) {
            if ( true === e.error || ( e.error instanceof Error && err instanceof e.error.constructor ) ) {
                /* Expecting error, got error. */
                if ( chatty ) {
                    console.log( "     Result: (expected error) ", String( err ) );
                }
            } else {
                if ( !chatty ) {
                    console.error( "\nTest expression: ", e.expr );
                }
                console.error("**** Eval error:", err );
                console.error("ce", JSON.stringify(ce) );
                ++num_errors;
            }
        }
    } catch ( err ) {
        if ( !chatty ) {
            console.error( "\nTest expression: ", e.expr );
        }
        console.error( "**** Compile error:", err );
        ++num_errors;
    }
});
( num_errors == 0 ? console.log : console.error )( "Test run complete.", test_expr.length, "tests,", num_errors, "errors." );
if ( 0 !== num_errors ) {
    process.exit( 1 );
}
