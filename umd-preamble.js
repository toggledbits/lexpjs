/** lexpjs - Copyright (C) 2018,2021 Patrick H. Rigney, All Rights Reserved
 *  See https://github.com/toggledbits/lexpjs
 *
 *  This Software is open source offered under the MIT LICENSE. See https://opensource.org/licenses/MIT
 *
s *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 *  documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 *  the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 *  to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 *  the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 *  THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 *  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

const version = 21224;

const FEATURE_MONTH_BASE = 1;       /* 1 = months 1-12; set to 0 if you prefer JS semantics where 0=Jan,11=Dec */
const MAX_RANGE = 1000;          /* Maximum number of elements in a result range op result array */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.lexp = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

/* --------------------------------- generated grammar (DO NOT EDIT) ------------------------------- */

@@@

/* --------------------------------- lexp executive ------------------------------- */

    const f_min = function( ...args ) {
        let res = null;
        let n = args.length;
        for ( let i=0; i<n; i++ ) {
            let v = args[ i ];
            if ( Array.isArray( v ) ) {
                v = f_min.apply( null, v );
                if ( null !== v && ( null === res || v < res ) ) {
                    res = v;
                }
            } else if ( "number" === typeof v ) {
                if ( null === res || v < res ) {
                    res = v;
                }
            }
        }
        return res;
    }

    const f_max = function( ...args ) {
        let res = null;
        let n = args.length;
        for ( let i=0; i<n; i++ ) {
            let v = args[ i ];
            if ( Array.isArray( v ) ) {
                v = f_max.apply( null, v );
                if ( null !== v && ( null === res || v > res ) ) {
                    res = v;
                }
            } else if ( "number" === typeof v ) {
                if ( null === res || v > res ) {
                    res = v;
                }
            }
        }
        return res;
    }

    const nativeFuncs = {
          abs       : { nargs: 1, impl: (v) => v >= 0 ? v : -v }
        , sign      : { nargs: 1, impl: Math.sign }
        , floor     : { nargs: 1, impl: Math.floor }
        , ceil      : { nargs: 1, impl: Math.ceil }
        , round     : { nargs: 2, impl: function( n, p ) { return Math.round( n * Math.pow(10, p || 0) ) / Math.pow(10, p || 0); } }
        , trunc     : { nargs: 1, impl: Math.trunc }
        , cos       : { nargs: 1, impl: Math.cos }
        , sin       : { nargs: 1, impl: Math.sin }
        , tan       : { nargs: 1, impl: Math.tan }
        , log       : { nargs: 1, impl: Math.log }
        , exp       : { nargs: 1, impl: Math.exp }
        , pow       : { nargs: 2, impl: Math.pow }
        , sqrt      : { nargs: 1, impl: Math.sqrt }
        , random    : { nargs: 0, impl: Math.random }
        , min       : { nargs: 1, impl: function( ...args ) { return f_min( null, ...args ); } }
        , max       : { nargs: 1, impl: function( ...args ) { return f_max( null, ...args ); } }
        , len       : { nargs: 1, impl: (s) => s.length }
        , substr    : { nargs: 2, impl: function( s, p, l ) { s = String(s); if (l==undefined) l=s.length; return s.substr(p,l); } }
        , upper     : { nargs: 1, impl: (s) => String(s).toUpperCase() }
        , lower     : { nargs: 1, impl: (s) => String(s).toLowerCase() }
        , match     : { nargs: 2, impl: function( s, p, n, f ) { let r = String(s).match( new RegExp( p, f ) ); return ( r === null ) ? null : r[n || 0]; } }
        , find      : { nargs: 2, impl: function( s, p, f ) { let r = String(s).match( new RegExp( p, f ) ); return ( r === null ) ? -1 : r.index; } }
        , replace   : { nargs: 3, impl: function( s, p, r, f ) { return String(s).replace( new RegExp( p, f ), r ); } }
        , rtrim     : { nargs: 1, impl: (s) => String(s).replace( /\s+$/, "" ) }
        , ltrim     : { nargs: 1, impl: (s) => String(s).replace( /^\s+/, "" ) }
        , trim      : { nargs: 1, impl: (s) => String(s).trim() }
        , split     : { nargs: 2, impl: (s,p,n) => String(s).split( p, n ) }
        , "int"     : { nargs: 1, impl: parseInt }
        , "float"   : { nargs: 1, impl: parseFloat }
        , "bool"    : { nargs: 1, impl: function( s ) { return !!s && null === String(s).match( /^\s*(0|no|off|false)\s*$/i ); } }
        , str       : { nargs: 1, impl: (s) => String(s) }
        , hex       : { nargs: 1, impl: (n) => Number( n ).toString( 16 ) }
        , time      : { nargs: 0, impl: function(...args) {
            if ( args.length > 1 && "number" === typeof( args[1] ) ) { args[1] -= FEATURE_MONTH_BASE; }
            return new Date(...args).getTime() } }
        , dateparts : { nargs: 0, impl: function( t ) { let d = new Date(t); return { year: d.getFullYear(), month: d.getMonth()+FEATURE_MONTH_BASE, day: d.getDate(),
            hour: d.getHours(), minute: d.getMinutes(), second: d.getSeconds(), weekday: d.getDay() }; } }
        , "isNaN"   : { nargs: 1, impl: (n) => Number.isNaN(n) || isNaN(n) }
        , isnull    : { nargs: 1, impl: (s) => "undefined" === typeof s || null === s }
        , isInfinity: { nargs: 1, impl: (s) => !isFinite(s) }
        , keys      : { nargs: 1, impl: Object.keys }
        , values    : { nargs: 1, impl: Object.values }
        , clone     : { nargs: 1, impl: (a) => JSON.parse( JSON.stringify( a ) ) }
        , join      : { nargs: 2, impl: (a,s) => a.join(s) }
        , list      : { nargs: 0, impl: function( ...args ) { return args; } }
        , indexOf   : { nargs: 2, impl: (a,el) => a.indexOf( el ) }
        , count     : { nargs: 1, impl: function( a ) { let n=0; Array.isArray( a ) ? a.forEach( el => { ( "undefined" !== typeof el && null !== el ) ? ++n : n } ) : n; return n; } }
        , sum       : { nargs: 1, impl: function( a ) { let n=0; Array.isArray( a ) ? a.forEach( el => { ( "number" === typeof el ) ? n += el : 0 } ) : 0; return n; } }
        , concat    : { nargs: 2, impl: (a,b) => (a||[]).concat(b||[]) }
        , slice     : { nargs: 2, impl: (a,s,e) => (a||[]).slice( s, e ) }
        , insert    : { nargs: 2, impl: (a,p,...el) => { a.splice( p, 0, ...el ); return a; } }
        , remove    : { nargs: 2, impl: (a,s,n) => { a.splice( s, "undefined" === typeof n ? 1 : n ); return a; } }
        , push      : { nargs: 2, impl: (a,v,n) => { a = a || []; a.push(v); if ( n && a.length > n ) a.splice( 0, a.length-n ); return a; } }
        , pop       : { nargs: 1, impl: (a) => a.pop() }
        , unshift   : { nargs: 2, impl: (a,v,n) => { a = a || []; a.unshift(v); if ( n && a.length > n ) a.splice( n, a.length-n ); return a; } }
        , shift     : { nargs: 1, impl: (a) => a.shift() }
        , isArray   : { nargs: 1, impl: Array.isArray }
        , isObject  : { nargs: 1, impl: (p) => null !== p && "object" === typeof p }
        , toJSON    : { nargs: 1, impl: JSON.stringify }
        , parseJSON : { nargs: 1, impl: JSON.parse }
        , btoa      : { nargs: 1, impl: (b) => Buffer.from( b, "utf-8" ).toString( "base64" ) }
        , atob      : { nargs: 1, impl: (a) => Buffer.from( a, "base64" ).toString( "utf-8" ) }
        , urlencode : { nargs: 1, impl: encodeURIComponent }
        , urldecode : { nargs: 1, impl: decodeURIComponent }
/* FUTURE:
        , format
        , sort
        , dateadd
        , hsltorgb
        , rgbtohsl
*/
    };

    var D = false ? console.log : function() {};

    var run = function( ce, ctx ) {
        ctx = ctx || {};

        function is_atom( v, typ ) {
            return null !== v && "object" === typeof( v ) &&
                "undefined" !== typeof v.__atom &&
                ( !typ || v.__atom === typ );
        }

        function N( v ) {
            return "undefined" === typeof v ? null : v;
        }

        /* Resolve a VREF atom */
        function _resolve( a ) {
            /* Scope priority: local, context, external resolver */
            var res;
            if ( "undefined" !== typeof (ctx.__lvar || {})[a.name] ) {
                res = ctx.__lvar[a.name];
            } else if ( "undefined" !== typeof ctx[a.name] ) {
                res = ctx[a.name];
            } else if ( "function" === typeof (ctx._func || {})._resolve ) {
                res = ctx._func._resolve( a.name, ctx );
            }
            return N(res);
        }

        function _run( e ) {
            if ( !is_atom( e ) ) {
                if ( Array.isArray( e ) ) {
                    /* Run each element within array */
                    let res = [];
                    let n = e.length;
                    for ( let k=0; k<n; ++k ) {
                        res[k] = _run( e[k] );
                    }
                    return res;
                } else if ( null !== e && "object" === typeof e ) {
                    let res = {};
                    Object.keys( e ).forEach( key => {
                        res[ key ] = _run( e[ key ] );
                    });
                    return res;
                }
                return e; /* return primitive as it is. */
            } else {
                /* Handle atom */
                if ( is_atom( e, 'list' ) ) {
                    let v = null;
                    e.expr.forEach( function( se ) {
                        v = _run( se );
                    });
                    return N(v);
                } else if ( is_atom( e, 'vref' ) ) {
                    return N( _resolve( e ) );
                } else if ( is_atom( e, 'binop' ) ) {
                    var v2 = e.v2;
                    var v1 = e.v1;
                    var v1eval, v2eval;
                    if ( "=" !== e.op ) {
                        v1eval = _run( v1 );
                    }
                    if ( e.op !== "&&" && e.op !== "||" && e.op !== '??' && e.op !== '?#' ) {
                        v2eval = _run( v2 );
                    }
                    // D("binop v1=",v1,", v1eval=",v1eval,", v2=",v2,", v2eval=",v2);
                    if (e.op == '+') {
                        // Special case for plus (+): if either operand is string, treat as concat
                        if ( "string" === typeof v1eval || "string" === typeof v2eval ) {
                            v1eval = ( null === v1eval ? "" : v1eval.toString() ) + ( null === v2eval ? "" : v2eval.toString() );
                        } else {
                            v1eval += v2eval;
                        }
                    }
                    else if (e.op == '-')
                        v1eval -= v2eval;
                    else if (e.op == '*')
                        v1eval *= v2eval;
                    else if (e.op == '/')
                        v1eval /= v2eval;
                    else if (e.op == '**')
                        v1eval = v1eval**v2eval;
                    else if (e.op == '%')
                        v1eval %= v2eval;
                    else if (e.op == '&')
                        v1eval &= v2eval;
                    else if (e.op == '|')
                        v1eval |= v2eval;
                    else if (e.op == '^')
                        v1eval ^= v2eval;
                    else if (e.op == '>')
                        v1eval = v1eval > v2eval;
                    else if (e.op == '>=')
                        v1eval = v1eval >= v2eval;
                    else if (e.op == '<')
                        v1eval = v1eval < v2eval;
                    else if (e.op == '<=')
                        v1eval = v1eval <= v2eval;
                    else if (e.op == '==')
                        v1eval = v1eval == v2eval;
                    else if (e.op == '===')
                        v1eval = v1eval === v2eval;
                    else if (e.op == '!=')
                        v1eval = v1eval != v2eval;
                    else if (e.op == '!==')
                        v1eval = v1eval !== v2eval;
                    else if (e.op == '<<' )
                        v1eval = v1eval << v2eval;
                    else if (e.op == '>>' )
                        v1eval = v1eval >> v2eval;
                    else if (e.op == '>>>' )
                        v1eval = v1eval >>> v2eval;
                    else if (e.op == '&&') {
                        /* short-cut evaluation */
                        v1eval = v1eval && _run( v2 );
                    } else if (e.op == '||') {
                        /* short-cut evaluation */
                        v1eval = v1eval || _run( v2 );
                    } else if (e.op == 'in' ) {
                        v1eval = v1eval in v2eval;
                    } else if (e.op == '??' ) {
                        v1eval = ( null === N(v1eval) ) ? _run( v2 ) : v1eval;
                    } else if (e.op == '?#' ) {
                        v1eval = ( null === N(v1eval) || Number.isNaN(v1eval) || isNaN(v1eval) ) ? _run( v2 ) : parseFloat( v1eval );
                    } else if ( ".." === e.op ) {
                        /* Range op */
                        let res = [];
                        if ( "number" !== typeof v1eval || "number" !== typeof v2eval ) {
                            throw new TypeError( "Non-numeric operand to range operator" );
                        }
                        let n = Math.floor( v1eval );
                        v2eval = Math.floor( v2eval );
                        let l = Math.abs( v2eval - n ) + 1;
                        if ( l > MAX_RANGE ) {
                            throw new Error("Range exceeds maximum differential of " + String(MAX_RANGE) );
                        }
                        if ( v2eval >= n ) {
                            while ( n <= v2eval ) {
                                res.push( n++ );
                            }
                        } else {
                            while ( n >= v2eval ) {
                                res.push( n-- );
                            }
                        }
                        v1eval = res;
                    } else if (e.op == '=' ) {
                        /* Assignment */
                        if ( ! is_atom( v1, 'vref' ) ) {
                            throw new SyntaxError("Invalid assignment target");
                        }
                        if ( ! ( ctx.__lvar && "object" === typeof ctx.__lvar ) ) {
                            throw new Error("Assignments not permitted here; or did you mean to use \"==\" ?");
                        }
// D("run() assign",v2eval,"to",v1.name);
                        ctx.__lvar[v1.name] = v2eval;
                        return v2eval;
                    } else {
                        D( e );
                        throw new Error('BUG: unsupported op in compiled expression: ' + e.op);
                    }
                    return v1eval;
                } else if ( is_atom( e, 'unop' ) ) {
                    var veval = _run( e.val );
                    if (e.op == '-')
                        veval = -veval;
                    else if (e.op == '!')
                        veval = !veval;
                    else if (e.op == '~')
                        veval = ~veval;
                    else
                        throw new Error('BUG: unsupported unop in compiled expression: ' + e.op);
                    return veval;
                } else if ( is_atom( e, 'deref' ) ) {
                    var scope = _run( e.context );
                    /* Watch for null-conditional operators */
                    if ( ( e.op === '?.' || e.op == '?[' ) && scope === null ) {
                        return null;
                    }
                    if ( "object" !== typeof scope || null === scope ) {
                        throw new ReferenceError("Invalid reference to member "+String(e.member)+" of "+String(scope));
                    }
                    var member = _run( e.member );
                    /* ??? member must be primitive? */
                    var res = _run( scope[ member ] );
                    return N(res);
                } else if ( is_atom( e, 'if' ) ) {
                    /* Special short-cut function */
                    var cond = _run( e.test );
                    var ifresult;
                    if ( cond ) {
                        ifresult = _run( e.tc );
                    } else if ( "undefined" !== typeof e.fc ) {
                        ifresult = _run( e.fc );
                    } else {
                        ifresult = null;
                    }
                    return N(ifresult);
                } else if ( is_atom( e, 'fref' ) ) {
                    // D('function ref ' + e.name + ' with ' + e.args.length + ' args');
                    var name = e.name;
                    var impl = undefined;
                    if ( nativeFuncs[name] ) {
                        // Native function implementation
                        impl = nativeFuncs[name].impl;
                    } else if ( ctx._func && "function" === typeof ctx._func[name] ) {
                        // Attached to context
                        impl = ctx._func[name];
                    } else {
                        throw new ReferenceError('Undefined function: ' + name);
                    }

                    // Build argument list.z
                    var a = [];
                    e.args.forEach( function( se ) {
                        a.push( _run( se ) );
                    });
                    var r = impl.apply( null, a );
                    return N(r);
                } else if ( is_atom( e, 'iter' ) ) {
                    ctx.__lvar = ctx.__lvar || {};
                    let context = N( _run( e.context ) );
                    let res = [];
                    if ( null !== context ) {
                        // D(e);
                        if ( "object" !== typeof context ) {
                            context = [ context ];
                        }
                        // D("Iterate over",context,"using",e.value,"apply",e.exec);
                        for ( [ key, value ] of Object.entries( context ) ) {
                            // D("Assigning",value,"to",e.value);
                            ctx.__lvar[ e.value ] = value;
                            if ( e.key ) {
                                ctx.__lvar[ e.key ] = Array.isArray( context ) ? parseInt( key ) : key;
                            }
                            // D("Running",e.exec);
                            let v = _run( e.exec );
                            // D("result",v);
                            if ( v !== null ) {
                                res.push( v );
                            }
                        }
                    }
                    return res;
                } else if ( is_atom( e, 'search' ) ) {
                    let context = N( _run( e.context ) );
                    let res = null;
                    if ( null !== context ) {
                        ctx.__lvar = ctx.__lvar || {};
                        // D(e);
                        // D("Search",context,"using",e.value,"for",e.exec);
                        if ( "object" !== typeof context ) {
                            context = [ context ];
                        }
                        for ( const [key, value] of Object.entries( context ) ) {
                            // D("Assigning",value,"to",e.value);
                            ctx.__lvar[ e.value ] = value;
                            if ( e.key ) {
                                ctx.__lvar[ e.key ] = key;
                            }
                            let v = _run( e.exec );
                            if ( !!v ) {
                                res = value;
                                break;
                            }
                        }
                    }
                    return res;
                } else {
                    D("BUG: unsupported atom:", e);
                    throw new Error('BUG: unsupported atom ' + String(e.__atom));
                }
            }
        } /* function _run() */

        D("lexp.run()", ce, ctx);
        var result = _run( ce );
        D("lexp.run() finished with", result);
        return result;
    };

    return {
        version: version,
        compile: function( expr ) {
            return parser.parse( expr );
        },
        run: run,
        evaluate: function( expr, context ) {
            return run( parser.parse( expr ), context );
        }
    };
}));
