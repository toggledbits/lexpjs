/* Ref: https://github.com/umdjs/umd */
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
          abs : { nargs: 1, impl: function( v ) { return v >= 0 ? v : -v; } }
        , sign : { nargs: 1, impl: Math.sign }
        , floor : { nargs: 1, impl: Math.floor }
        , ceil : { nargs: 1, impl: Math.ceil }
        , round : { nargs: 2, impl: function( n, p ) { if (p == undefined) p = 0; return Math.floor( n * Math.pow(10, p) + 0.5 ) / Math.pow(10, p); } }
        , trunc : { nargs: 1, impl: Math.trunc }
        , cos : { nargs: 1, impl: Math.cos }
        , sin : { nargs: 1, impl: Math.sin }
        , tan : { nargs: 1, impl: Math.tan }
        , log : { nargs: 1, impl: Math.log }
        , exp : { nargs: 1, impl: Math.exp }
        , pow : { nargs: 2, impl: Math.pow }
        , sqrt : { nargs: 1, impl: Math.sqrt }
        , min : { nargs: 2, impl: function( n1, n2 ) { return (n1 <= n2 ? n1 : n2); } }
        , max : { nargs: 2, impl: function( n1, n2 ) { return (n1 >= n2 ? n1 : n2); } }
        , len : { nargs: 1, impl: function( s ) { return s.length; } }
        , substr : { nargs: 2, impl: function( s, p, l ) { s = String(s); if (l==undefined) l=s.length; return s.substr(p,l); } }
        , upper: { nargs: 1, impl: function( s ) { return String(s).toUpperCase(); } }
        , lower: { nargs: 1, impl: function( s ) { return String(s).toLowerCase(); } }
        , match: { nargs: 2, impl: function( s, p, n ) { var r = String(s).match( p ); return ( r === null ) ? null : r[n || 0]; } }
        , find: { nargs: 2, impl: function( s, p ) { var r = String(s).match( p ); return ( r === null ) ? -1 : r.index; } }
        , replace: { nargs: 3, impl: function( s, p, r ) { return String(s).replace( p, r ); } }
        , "int": { nargs: 1, impl: parseInt }
        , "float": { nargs: 1, impl: parseFloat }
        , str: { nargs: 1, impl: function( s ) { return String( s ); } }
        , time: { nargs: 0, impl: function() { return Date.now(); } }
        , dateparts: { nargs: 0, impl: function( t ) { var d = new Date(t); return { year: d.getFullYear(), month: d.getMonth()+1, day: d.getDate(),
            hour: d.getHours(), minute: d.getMinutes(), second: d.getSeconds(), weekday: d.getDay() }; } }
        , "isNaN": { nargs: 1, impl: function( n ) { return isNaN( n ); } }
        , isnull: { nargs: 1, impl: function( s ) { return "undefined" === typeof s || null === s; } }
        , keys: { nargs: 1, impl: Object.keys }
        , values: { nargs: 1, impl: Object.values }
        , join: { nargs: 2, impl: function( a, s ) { return a.join(s); } }
        , indexOf: { nargs: 2, impl: function( a, el ) { return a.indexOf( el ); } }
        , isArray: { nargs: 1, impl: Array.isArray }
        , isObject: { nargs: 1, impl: function( p ) { return "object" === typeof p && null !== p; } }
/* FUTURE: 
        , select: (see find below)
        , format:
        , each:
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

        function _resolve( a ) {
            if ( "undefined" !== typeof (ctx.__lvar || {})[a.name] ) {
                return ctx.__lvar[a.name];
            }
            if ( "undefined" === typeof ctx[a.name] ) {
                var msg = "Can't resolve " + String( a.name );
                if ( a.locs ) {
                    msg += " at " + String( a.locs );
                }
                throw new ReferenceError( msg );
            }
            return ctx[a.name];
        }

        function _run( e ) {
            if ( !is_atom( e ) ) {
                return e; /* return primitive as it is. */
            } else {
                /* Handle atom */
                if ( is_atom( e, 'list' ) ) {
                    var arr = [];
                    e.expr.forEach( function( se ) {
                        arr.push( _run( se ) );
                    });
                    return arr;
                } else if ( is_atom( e, 'vref' ) ) {
                    var vv = _resolve( e );
                    if ( "undefined" === typeof vv ) {
                        return null;
                    }
                    return vv;
                } else if ( is_atom( e, 'binop' ) ) {
                    var v2 = e.v2;
                    var v1 = e.v1;
                    var v1eval, v2eval;
                    if ( "=" !== e.op ) {
                        v1eval = _run( v1 );
                    }
                    if ( e.op !== "&&" && e.op !== "||" && e.op !== '&&' ) {
                        v2eval = _run( v2 );
                    }
                    D("binop v1=",v1,", v1eval=",v1eval,", v2=",v2,", v2eval=",v2);
                    if (e.op == '+') {
                        // Special case for plus (+): if either operand is string, treat as concat
                        if (typeof v1eval == "string" || typeof v2eval == "string")
                            v1eval = v1eval.toString() + v2eval.toString();
                        else
                            v1eval += v2eval;
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
                        v1eval = v1eval ? _run( v2 ) : false;
                    } else if (e.op == '||') {
                        /* short-cut evaluation */
                        v1eval = v1eval ? true : _run( v2 );
                    } else if (e.op == 'in' )
                        v1eval = v1eval in v2eval;
                    else if (e.op == '??' )
                        v1eval = ( null === v1eval || undefined === v1eval ) ? _run( v2 ) : v1eval;
                    else if (e.op == '=' ) {
                        /* Assignment */
                        if ( ! is_atom( v1, 'vref' ) ) {
                            throw new SyntaxError("Invalid assignment target");
                        }
                        if ( ! ( ctx.__lvar && "object" === typeof ctx.__lvar ) ) {
                            throw new Error("Assignments not permitted here; or did you mean to use \"==\" ?");
                        }
D("run() assign",v2eval,"to",v1.name);
                        ctx.__lvar[v1.name] = v2eval;
                        return v2eval;
                    } else {
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
                    if ( "object" !== typeof scope || null === scope ) {
                        throw new ReferenceError("Invalid reference to member "+String(e.member)+" of "+String(scope));
                    }
                    var res = scope[ e.member ];
                    if ( "undefined" === typeof res ) {
                        return null;
                    }
                    return res;
                } else if ( is_atom( e, 'if' ) ) {
                    /* Special short-cut function */
                    var cond = _run( e.test );
                    var ifresult;
                    if ( cond ) {
                        ifresult = _run( e.tc );
                    } else if ( e.fc ) {
                        ifresult = _run( e.fc );
                    } else {
                        ifresult = null;
                    }
                    if ( "undefined" === typeof ifresult ) {
                        return null;
                    }
                    return ifresult;
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
                    if ( "undefined" === typeof r ) {
                        return null;
                    }
                    return r;
                } else {
                    D("BUG: unsupported atom:", e);
                    throw new Error('BUG: unsupported atom');
                }
            }
        } /* function _run() */

        D("lexp.run()", ce, ctx);
        var result = _run( ce );
        D("lexp.run() finished with", result);
        /* Always return array */
        if ( !Array.isArray( result ) ) {
            result = [ result ];
        }
        return result;
    };

    return {
        compile: function( expr ) {
            return parser.parse( expr );
        },
        run: run,
        evaluate: function( expr, context ) {
            return run( parser.parse( expr ), context );
        }
    };
}));