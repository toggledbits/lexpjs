/** lexpjs - Copyright (C) 2018,2021 Patrick H. Rigney, All Rights Reserved
 *  See https://github.com/toggledbits/lexpjs
 *
 *  This Software is open source offered under the MIT LICENSE. See https://opensource.org/licenses/MIT
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
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

const version = 21280;

const FEATURE_MONTH_BASE = 1;   /* 1 = months 1-12; set to 0 if you prefer JS semantics where 0=Jan,11=Dec */
const MAX_RANGE = 1000;         /* Maximum number of elements in a result range op result array */

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
        , "typeof"  : { nargs: 1, impl: (a) => null === a ? 'null' : ( Array.isArray(a) ? 'array' : typeof a ) }
/* FUTURE:
        , format
        , sort
        , dateadd
        , hsltorgb
        , rgbtohsl
*/
    };

    var D = false ? console.log : function() {};

    var get_context = function( vars ) {
        var c = { __lvar: vars || {}, __depth: 0, __tag: 'global', _func: {} };
        c.__global = c;
        return c
    };

    var push_context = function( ctx, tag ) {
        return {
            __global: ctx.__global || ctx,
            __parent: ctx,
            __depth: (ctx.__depth||0)+1,
            __lvar: {},
            __tag: tag
        };
    }

    var pop_context = function( ctx ) {
        return ctx.__parent || ctx;
    }

    function locate_context( key, ctx, subkey ) {
        while ( ctx ) {
            let w = subkey ? ctx[ subkey ] : ctx;
            if ( w && key in w ) {
                return ctx;
            }
            if ( ! ctx.__parent ) {
                break;
            }
            ctx = ctx.__parent;
        }
        return false;
    }

    /**
     * Scan up from the given context for a context with the given tag. If no tag is given,
     * the first tagged context encountered is returned.
     */
    function find_context_tag( ctx, tag ) {
        if ( ctx.__tag && ( ! tag || ctx.__tag === tag ) ) {
            return ctx;
        }
        if ( ctx.__parent ) {
            return find_context_tag( ctx.__parent, tag );
        }
        return false;
    }

    function is_atom( v, typ ) {
        return null !== v && "object" === typeof( v ) &&
            "undefined" !== typeof v.__atom &&
            ( !typ || v.__atom === typ );
    }

    function N( v ) {
        return "undefined" === typeof v ? null : v;
    }

    var run = function( ce, g_ctx ) {
        g_ctx = g_ctx || get_context();

        /* Resolve a VREF atom */
        function _resolve( a, ctx ) {
            /* Scope priority: local, context, external resolver */
            var res;
            let c = locate_context( a.name, ctx, '__lvar' );
            if ( c ) {
                res = c.__lvar[ a.name ];
            } else {
                c = locate_context( '_resolve', ctx, '_func' );
                if ( c ) {
                    res = c._func._resolve( a.name, ctx );
                }
            }
            return N(res);
        }

        function _run( e, ctx ) {
            if ( !is_atom( e ) ) {
                if ( Array.isArray( e ) ) {
                    /* Run each element within array */
                    let res = [];
                    let n = e.length;
                    for ( let k=0; k<n; ++k ) {
                        res[k] = _run( e[k], ctx );
                    }
                    return res;
                } else if ( null !== e && "object" === typeof e ) {
                    let res = {};
                    Object.keys( e ).forEach( key => {
                        res[ key ] = _run( e[ key ], ctx );
                    });
                    return res;
                }
                return e; /* return primitive as it is. */
            } else {
                /* Handle atom */
                if ( is_atom( e, 'list' ) ) {
                    let v = null;
                    e.expr.forEach( function( se ) {
                        v = _run( se, ctx );
                    });
                    return N(v);
                } else if ( is_atom( e, 'vref' ) ) {
                    return N( _resolve( e, ctx ) );
                } else if ( is_atom( e, 'binop' ) ) {
                    var v2 = e.v2;
                    var v1 = e.v1;
                    var v1eval, v2eval;
                    if ( "=" !== e.op ) {
                        v1eval = _run( v1, ctx );
                    }
                    if ( e.op !== "&&" && e.op !== "||" && e.op !== '??' && e.op !== '?#' ) {
                        v2eval = _run( v2, ctx );
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
                        v1eval = v1eval && _run( v2, ctx );
                    } else if (e.op == '||') {
                        /* short-cut evaluation */
                        v1eval = v1eval || _run( v2, ctx );
                    } else if (e.op == 'in' ) {
                        v1eval = v1eval in v2eval;
                    } else if (e.op == '??' ) {
                        v1eval = ( null === N(v1eval) ) ? _run( v2, ctx ) : v1eval;
                    } else if (e.op == '?#' ) {
                        v1eval = ( null === N(v1eval) || Number.isNaN(v1eval) || isNaN(v1eval) ) ? _run( v2, ctx ) : parseFloat( v1eval );
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
                            throw new RangeError( `Range exceeds maximum differential of ${MAX_RANGE}` );
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
                    } else if ( e.op == '=' ) {
                        /* Assignment */
                        if ( ! is_atom( v1, 'vref' ) || v1.name.startsWith( '__' ) || '_func' === v1.name ) {
                            throw new SyntaxError( `Invalid assignment target (${v1.name})` );
                        }
// D("run() assign",v2eval,"to",v1.name);
                        let c, res;
                        if ( e.global ) {
                            c = ctx.__global;
                        } else if ( e.local ) {
                            c = ctx;
                        } else {
                            c = locate_context( v1.name, ctx, '__lvar' ) || ctx;
                        }
                        let fc = locate_context( '_assign', ctx, '_func' );
                        if ( fc && "function" === typeof fc._func._assign ) {
                            /* If _assign returns undefined, the normal assignment will be performed. Otherwise, it is
                             * assumed that _assign has done it.
                             */
                            res = fc._func._assign( v1.name, v2eval, c, e );
                        }
                        if ( "undefined" === typeof res ) {
                            c.__lvar = c.__lvar || {};
                            c.__lvar[ v1.name ] = v2eval;
                            return v2eval;
                        }
                        return res;
                    } else {
                        D( e );
                        throw new Error( `BUG: unsupported op in compiled expression: ${String(e.op)}` );
                    }
                    return v1eval;
                } else if ( is_atom( e, 'unop' ) ) {
                    var veval = _run( e.val, ctx );
                    if (e.op == '-')
                        veval = -veval;
                    else if (e.op == '!')
                        veval = !veval;
                    else if (e.op == '~')
                        veval = ~veval;
                    else
                        throw new Error( `BUG: unsupported unop in compiled expression: ${String(e.op)}` );
                    return veval;
                } else if ( is_atom( e, 'deref' ) ) {
                    var scope = _run( e.context, ctx );
                    /* Watch for null-conditional operators */
                    if ( ( e.op === '?.' || e.op == '?[' ) && scope === null ) {
                        return null;
                    }
                    if ( "object" !== typeof scope || null === scope ) {
                        throw new ReferenceError( `Invalid reference to member ${String(e.member)} of ${String(scope)}` );
                    }
                    var member = _run( e.member, ctx );
                    /* ??? member must be primitive? */
                    var res = _run( scope[ member ], ctx );
                    return N(res);
                } else if ( is_atom( e, 'if' ) ) {
                    /* Special short-cut function */
                    var cond = _run( e.test, ctx );
                    var ifresult;
                    if ( cond ) {
                        ifresult = _run( e.tc, ctx );
                    } else if ( "undefined" !== typeof e.fc ) {
                        ifresult = _run( e.fc, ctx );
                    } else {
                        ifresult = null;
                    }
                    return N(ifresult);
                } else if ( is_atom( e, 'fref' ) ) {
                    // D('function ref ' + e.name + ' with ' + e.args.length + ' args');
                    var name = e.name;
                    var impl = false;
                    // Attached to context? Scan from current up.
                    let c = locate_context( name, ctx, '_func' );
                    if ( c ) {
                        impl = c._func[ name ];
                    }
                    if ( ! impl && nativeFuncs[ name ] ) {
                        impl = ( fctx, ...args ) => nativeFuncs[ name ].impl( ...args );
                    }
                    if ( ! impl ) {
                        throw new ReferenceError( `Undefined function (${name})` );
                    }

                    // Build argument list and go. Context is always first argument.
                    var a = [ ctx ];
                    e.args.forEach( function( se ) {
                        a.push( _run( se, ctx ) );
                    });
                    var r = impl.apply( null, a );
                    return N(r);
                } else if ( is_atom( e, 'iter' ) ) {
                    ctx.__lvar = ctx.__lvar || {};
                    let context = N( _run( e.context, ctx ) );
                    let res = [];
                    if ( null !== context ) {
                        // D(e);
                        if ( "object" !== typeof context ) {
                            context = [ context ];
                        }
                        // D("Iterate over",context,"using",e.value,"apply",e.exec);
                        let local_ctx = push_context( ctx );
                        try {
                            for ( [ key, value ] of Object.entries( context ) ) {
                                // D("Assigning",value,"to",e.value);
                                local_ctx.__lvar[ e.value ] = value;
                                if ( e.key ) {
                                    local_ctx.__lvar[ e.key ] = Array.isArray( context ) ? parseInt( key ) : key;
                                }
                                // D("Running",e.exec);
                                let v = _run( e.exec, local_ctx );
                                // D("result",v);
                                if ( v !== null ) {
                                    res.push( v );
                                }
                            }
                        } finally {
                            ctx = pop_context( local_ctx );
                        }
                    }
                    return res;
                } else if ( is_atom( e, 'search' ) ) {
                    let context = N( _run( e.context, ctx ) );
                    let res = null;
                    if ( null !== context ) {
                        ctx.__lvar = ctx.__lvar || {};
                        // D(e);
                        // D("Search",context,"using",e.value,"for",e.exec);
                        if ( "object" !== typeof context ) {
                            context = [ context ];
                        }
                        local_ctx = push_context( ctx );
                        try {
                            for ( const [key, value] of Object.entries( context ) ) {
                                // D("Assigning",value,"to",e.value);
                                local_ctx.__lvar[ e.value ] = value;
                                if ( e.key ) {
                                    local_ctx.__lvar[ e.key ] = key;
                                }
                                let v = _run( e.exec, local_ctx );
                                if ( !!v ) {
                                    res = value;
                                    break;
                                }
                            }
                        } finally {
                            ctx = pop_context( local_ctx );
                        }
                    }
                    return res;
                } else if ( is_atom( e, 'block' ) ) {
                    let res = null;
                    try {
                        ctx = push_context( ctx );
                        res = _run( e.block, ctx );
                    } finally {
                        ctx = pop_context( ctx );
                    }
                    return res;
                } else if ( is_atom( e, 'fdef' ) ) {
                    let seen = {};
                    /* e.args is list atom */
                    e.args.expr.forEach( (a,ix) => {
                        /* a is vref atom */
                        if ( ! is_atom( a, 'vref' ) ) {
                            throw new SyntaxError( `Invalid argument ${ix}/${e.args.length}, must be identifier` );
                        }
                        if ( seen[ a.name ] ) {
                            throw new SyntaxError( `Argument name conflict (${a.name})` );
                        }
                        seen[ a.name ] = true;
                    });
                    /* Define function; closure loads arguments values passed in to local variables in
                     * new sub-scope, then runs expression list.
                     */
                    ctx._func[ e.name ] = (ctx, ...args) => {
                        let res = null;
                        if ( args.length !== e.args.expr.length ) {
                            throw new ReferenceError( `Defined function "${e.name}" requires ${e.args.expr.length} arguments` );
                        }
                        ctx = push_context( ctx );
                        try {
                            /* Get each argument into its corresponding locally-scoped variable */
                            args.forEach( (arg,ix) => {
                                D( "set arg",ix,e.args.expr[ix].name,'=',arg );
                                ctx.__lvar[ e.args.expr[ ix ].name ] = _run( arg, ctx );
                            });
                            res = _run( e.list, ctx );
                        } finally {
                            ctx = pop_context( ctx );
                        }
                        return res;
                    };
                    return null;
                } else {
                    D("BUG: unsupported atom:", e);
                    throw new Error( `BUG: unsupported atom (${String(e.__atom)})` );
                }
            }
        } /* function _run() */

        D("lexp.run()", ce, g_ctx);
        var result = _run( ce, g_ctx );
        D("lexp.run() finished with", result);
        return result;
    };

    return {
        version: version,
        get_context: get_context,
        define_func_impl: function( ctx, name, impl ) {
            let __global = ctx.__global || ctx;
            __global._func = __global._func || {}
            __global._func[ name ] = impl;
        },
        define_var: function( ctx, name, val ) {
            ctx.__lvar = ctx.__lvar || {};
            ctx.__lvar[ name ] = N(val);
            return ctx.__lvar[ name ];
        },
        set_var: function( ctx, name, val ) {
            let c = locate_context( name, ctx, '__lvar' );
            if ( ! c ) {
                return define_var( ctx, name, val );
            }
            c.__lvar[ name ] = val;
        },
        get_var: function( ctx, name ) {
            let c = locate_context( name, ctx, '__lvar' );
            if ( c ) {
                return c.__lvar[ name ];
            }
            return undefined;
        },
        push_context: push_context,
        pop_context: pop_context,
        find_context_tag: find_context_tag,
        evaluate: function( expr, context ) {
            return run( parser.parse( expr ), context );
        },
        compile: function( expr ) {
            return parser.parse( expr );
        },
        run: run
    };
}));
