/* Ref: https://github.com/umdjs/umd */

const version = 21082;

const FEATURE_MONTH_BASE = 1;       /* 1 = months 1-12; set to 0 if you prefer JS semantics where 0=Jan,11=Dec */

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
        , min       : { nargs: 2, impl: Math.min } /* ??? should take arrays, too */
        , max       : { nargs: 2, impl: Math.max } /* ??? should take arrays, too */
        , len       : { nargs: 1, impl: (s) => s.length }
        , substr    : { nargs: 2, impl: function( s, p, l ) { s = String(s); if (l==undefined) l=s.length; return s.substr(p,l); } }
        , upper     : { nargs: 1, impl: (s) => String(s).toUpperCase() }
        , lower     : { nargs: 1, impl: (s) => String(s).toLowerCase() }
        , match     : { nargs: 2, impl: function( s, p, n, f ) { var r = String(s).match( new RegExp( p, f ) ); return ( r === null ) ? null : r[n || 0]; } }
        , find      : { nargs: 2, impl: function( s, p, f ) { var r = String(s).match( new RegExp( p, f ) ); return ( r === null ) ? -1 : r.index; } }
        , replace   : { nargs: 3, impl: function( s, p, r, f ) { return String(s).replace( new RegExp( p, f ), r ); } }
        , rtrim     : { nargs: 1, impl: (s) => String(s).replace( /\s+$/, "" ) }
        , ltrim     : { nargs: 1, impl: (s) => String(s).replace( /^\s+/, "" ) }
        , trim      : { nargs: 1, impl: (s) => String(s).trim() }
        , split     : { nargs: 2, impl: (s,p,n) => String(s).split( p, n ) }
        , "int"     : { nargs: 1, impl: parseInt }
        , "float"   : { nargs: 1, impl: parseFloat }
        , "bool"    : { nargs: 1, impl: function( s ) { return ! ( s === 0 || s === false || s === "" || null !== String(s).match( /^\s*(0|no|off|false)\s*$/i ) ); } }
        , str       : { nargs: 1, impl: (s) => String(s) }
        , time      : { nargs: 0, impl: function(...args) { if ( args.length > 1 && "number" === typeof( args[1] ) ) { args[1] -= FEATURE_MONTH_BASE; } return new Date(...args).getTime() } }
        , dateparts : { nargs: 0, impl: function( t ) { var d = new Date(t); return { year: d.getFullYear(), month: d.getMonth()+FEATURE_MONTH_BASE, day: d.getDate(),
            hour: d.getHours(), minute: d.getMinutes(), second: d.getSeconds(), weekday: d.getDay() }; } }
        , "isNaN"   : { nargs: 1, impl: (n) => Number.isNaN(n) || isNaN(n) }
        , isnull    : { nargs: 1, impl: (s) => "undefined" === typeof s || null === s }
        , keys      : { nargs: 1, impl: Object.keys }
        , values    : { nargs: 1, impl: Object.values }
        , join      : { nargs: 2, impl: (a,s) => a.join(s) }
        , list      : { nargs: 0, impl: function( ...args ) { return args; } }
        , indexOf   : { nargs: 2, impl: (a,el) => a.indexOf( el ) }
        , count     : { nargs: 1, impl: function( a ) { let n=0; Array.isArray( a ) ? a.forEach( el => { ( "undefined" !== typeof el && null !== el ) ? ++n : n } ) : n; return n; } }
        , sum       : { nargs: 1, impl: function( a ) { let n=0; Array.isArray( a ) ? a.forEach( el => { ( "number" === typeof el ) ? n += el : 0 } ) : 0; return n; } }
        , concat    : { nargs: 2, impl: (a,b) => (a||[]).concat(b||[]) }
        , slice     : { nargs: 2, impl: (a,s,e) => (a||[]).slice( s, e ) }
        , insert    : { nargs: 2, impl: (a,p,...el) => { a.splice( p, 0, ...el ); return a; } }
        , remove    : { nargs: 2, impl: (a,s,n) => { a.splice( s, "undefined" === typeof n ? 1 : n ); return a; } }
        , push      : { nargs: 2, impl: (a,v,n) => { a.push(v); if ( n && a.length > n ) a.splice( 0, a.length-n ); return a } }
        , pop       : { nargs: 1, impl: (a) => a.pop() }
        , unshift   : { nargs: 2, impl: (a,v,n) => { a.unshift(v); if ( n && a.length > n ) a.splice( n, a.length-n ); return a } }
        , shift   : { nargs: 1, impl: (a) => a.shift() }
        , isArray   : { nargs: 1, impl: Array.isArray }
        , isObject  : { nargs: 1, impl: (p) => "object" === typeof p && null !== p }
        , toJSON    : { nargs: 1, impl: JSON.stringify }
        , parseJSON : { nargs: 1, impl: JSON.parse }
/* FUTURE:
        , select: (see find below)
        , format:
        , map:
        , reduce:
        , every:
        , some:
        , pop:
        , push:
        , shift:
        , unshift:
        , sort:
        , concat:
        , filter:
        , find:
        , slice:
        , splice:
        , dateadd
        , hsltorgb
        , rgbtohsl
*/
    };

    var D = function() {}; /* console.log; /* */

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
                    let n = e.length;
                    for ( let k=0; k<n; ++k ) {
                        e[k] = _run( e[k] );
                    }
                    return e;
                } else if ( null !== e && "object" === typeof e ) {
                    for ( let key in e ) {
                        if ( e.hasOwnProperty( key ) ) {
                            e[ key ] = _run( e[ key ] );
                        }
                    }
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
                    if ( e.op !== "&&" && e.op !== "||" && e.op !== '??' ) {
                        v2eval = _run( v2 );
                    }
                    D("binop v1=",v1,", v1eval=",v1eval,", v2=",v2,", v2eval=",v2);
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
                    D('function ref ' + e.name + ' with ' + e.args.length + ' args');
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

                    // Build argument list.
                    var a = [];
                    e.args.forEach( function( se ) {
                        a.push( _run( se ) );
                    });
                    var r = impl.apply( null, a );
                    return N(r);
                } else if ( is_atom( e, 'iter' ) ) {
                    ctx.__lvar = ctx.__lvar || {};
                    var context = _run( e.context );
                    var res = [];
                    // D(e);
                    if ( ! Array.isArray( context ) ) {
                        if ( "object" !== typeof context ) {
                            context = [ context ];
                        } else {
                            context = Object.values( context );
                        }
                    }
                    // D("Iterate over",context,"using",e.ident,"apply",e.exec);
                    context.forEach( element => {
                        // D("Assigning",element,"to",e.ident);
                        ctx.__lvar[ e.ident ] = element;
                        let v = _run( e.exec );
                        // D("result",v);
                        if ( v !== null ) {
                            res.push( v );
                        }
                    });
                    return res;
                } else if ( is_atom( e, 'search' ) ) {
                    ctx.__lvar = ctx.__lvar || {};
                    var context = _run( e.context );
                    var res = null
                    // D(e);
                    // D("Search",context,"using",e.ident,"for",e.exec);
                    if ( ! Array.isArray( context ) ) {
                        if ( "object" !== typeof context ) {
                            context = [ context ];
                        } else {
                            context = Object.values( context );
                        }
                    } else {
                        context = { ...context };
                    }
                    while ( context.length > 0 ) {
                        let element = context.shift();
                        // D("Assigning",element,"to",e.ident);
                        ctx.__lvar[ e.ident ] = element;
                        let v = _run( e.exec );
                        if ( !!v ) {
                            res = element;
                            break;
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
