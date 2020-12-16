//# sourceURL=lexp.js
/** This file is part of Reactor.
 *  Copyright (c) 2020 Patrick H. Rigney, All Rights Reserved.
 *  Reactor is not public domain or open source. Distribution or derivative works are expressly prohibited.
 */

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

    const VREF = 'vref',
          FREF = 'fref',
          UNOP = 'unop',
          BINOP = 'binop',
          LIST = 'list';

    const binops = [
          { "op":'.', "prec": -999 }

        , { "op":'**', "prec": 2 }

        , { "op":'*', "prec": 3 }
        , { "op":'/', "prec": 3 }
        , { "op":'%', "prec": 3 }

        , { "op":'+', "prec": 4 }
        , { "op":'-', "prec": 4 }

        , { "op":'<<', "prec": 5 }
        , { "op":'>>', "prec": 5 }

        , { "op":'in', "prec": 6 }
        , { "op":'<', "prec": 6 }
        , { "op":'<=', "prec": 6 }
        , { "op":'>', "prec": 6 }
        , { "op":'>=', "prec": 6 }

        , { "op":'==', "prec": 7 }
        , { "op":'<>', "prec": 7 }
        , { "op":'!=', "prec": 7 }

        , { "op":'&', "prec": 8 }

        , { "op":'^', "prec": 9 }

        , { "op":'|', "prec": 10 }

        , { "op":'&&', "prec": 11 }

        , { "op":'||', "prec": 12 }

        , { "op":'??', "prec": 13 }

        , { "op":'?', "prec": 14 } /* syntactic sugar for && */
        , { "op":':', "prec": 15 } /* syntactic sugar for || */

        , { "op":'=', "prec": 99 }
    ];
    const MAXPREC = 99; // value doesn't matter as long as it's >= any used in binops

    const reserved = { "true": true, "false": false, "null": null };

    const specialChars = { 'b': "\x08", 't': "\x09", 'n': "\x0a", 'v': "\x0b", 'f': "\x0c", 'r': "\x0d" };

    const nativeFuncs = {
          abs : { nargs: 1, impl: function( v ) { return v >= 0 ? v : -v; } }
        , sign : { nargs: 1, impl: function( n ) { return Math.sign(n); } }
        , floor : { nargs: 1, impl: function( n ) { return Math.floor(n); } }
        , ceil : { nargs: 1, impl: function( n ) { return Math.ceil(n); } }
        , round : { nargs: 2, impl: function( n, p ) { if (p == undefined) p = 0; return Math.floor( n * Math.pow(10, p) + 0.5 ) / Math.pow(10, p); } }
        , trunc : { nargs: 1, impl: function( n ) { return Math.trunc(n); } }
        , cos : { nargs: 1, impl: function( n ) { return Math.cos(n); } }
        , sin : { nargs: 1, impl: function( n ) { return Math.sin(n); } }
        , tan : { nargs: 1, impl: function( n ) { return Math.tan(n); } }
        , log : { nargs: 1, impl: function( n ) { return Math.log(n); } }
        , exp : { nargs: 1, impl: function( n ) { return Math.exp(n); } }
        , pow : { nargs: 2, impl: function( n, p ) { return Math.pow(n, p); } }
        , sqrt : { nargs: 1, impl: function( n ) { return Math.sqrt( n ); } }
        , min : { nargs: 2, impl: function( n1, n2 ) { return (n1 <= n2 ? n1 : n2); } }
        , max : { nargs: 2, impl: function( n1, n2 ) { return (n1 >= n2 ? n1 : n2); } }
        , len : { nargs: 1, impl: function( s ) { return String(s).length; } }
        , substr : { nargs: 3, impl: function( s, p, l ) { s = String(s); if (l==undefined) l=s.length; return s.substr(p,l); } }
        , upper: { nargs: 1, impl: function( s ) { return String(s).toUpperCase(); } }
        , lower: { nargs: 1, impl: function( s ) { return String(s).toLowerCase(); } }
        , match: { nargs: 2, impl: function( s, p, n ) { var r = String(s).match( p ); return ( r === null ) ? null : r[n || 0]; } }
        , find: { nargs: 2, impl: function( s, p ) { var r = String(s).match( p ); return ( r === null ) ? -1 : r.index; } }
        , replace: { nargs: 3, impl: function( s, p, r ) { return String(s).replace( p, r ); } }
        , "int": { nargs: 1, impl: function( s ) { return parseInt(s); } }
        , "float": { nargs: 1, impl: function( s ) { return parseFloat(s); } }
        , str: { nargs: 1, impl: function( s ) { return String( s ); } }
        , time: { nargs: 0, impl: function() { return Date.now(); } }
        , dateparts: { nargs: 0, impl: function( t ) { var d = new Date(t); return { year: d.getFullYear(), month: d.getMonth()+1, day: d.getDate(),
            hour: d.getHours(), minute: d.getMinutes(), second: d.getSeconds(), weekday: d.getDay() }; } }
        , array: { nargs: 0, impl: function( ...args ) { return args; } }
        , "isNaN": { nargs: 1, impl: function( n ) { return isNaN( n ); } }
        , isnull: { nargs: 1, impl: function( s ) { return "undefined" === typeof s || null === s; } }
        , if: { nargs: 2, impl: function( cond, texp, fexp ) { return (cond) ? texp : fexp; } }
    };

    var D = function( ...args ) {
        // console.log( ...args );
    };

    var is_atom = function( v, typ ) {
        return null !== v && "object" === typeof( v ) && "undefined" !== v.__atom &&
            ( !typ || v.__atom === typ );
    };

    var atom = function( t, vs ) {
        var a = { __atom: t };
        Object.keys(vs || {}).forEach( function( key ) {
            a[key] = vs[key];
        });
        return a;
    };

    var _comp = function( expr ) {
        var index = 0;
        var length = expr.length;

        var skip_white = function() {
            var s = expr.substr( index ).match( /^\s*/ );
            if ( s ) {
                index += s[0].length;
            }
        };

        // Starting from the current character position, peek as much of the stream as will match the provided regular expression.
        var peek = function( reg ) {
            var m = reg.exec( expr.substr( index ) );
            if ( m == undefined ) return undefined;
            return m[0];
        };

        // Scan for numeric value. Allow binary, octal and hex integers, and decimal/float.
        var scan_numeric = function( startch ) {
            // Peek and see if we're doing base conversion
            var s = peek( /^0(x[0-9a-f]+|[0-7]+)/i );
            if ( s != undefined ) {
                // Handle base-specific integer.
                return parseInt( s );
            }

            // Handle as decimal/float
            var str = peek( /^[0-9]+(\.[0-9]*)?([E][+-]?[0-9]+)?/i );
            if (str == undefined) return undefined;
            index += str.length;
            return parseFloat( str );
        };

        // Quoted literal string. Allow escaped quote (only).
        var scan_string = function( qchar ) {
            var str = "";
            var esc = false;
            while (1) {
                if (++index >= length) throw new SyntaxError('Unterminated string at ' + index);
                var ch = expr.charAt( index );
                if ( '\\' == ch ) {
                    esc = true;
                    continue;
                } else if ( esc && specialChars[ch] ) {
                    ch = specialChars[ch];
                } else if (ch == qchar && !esc) {
                    break;
                }
                str += ch;
                esc = false;
            }
            ++index; // skip closing quote
            return str;
        };

        // Scan function reference and parse/package argument list. Only called by scan_vref()
        var scan_funcref = function( name ) {
            var args = [];
            var parenLevel = 0;
            var subexp = "";
            while ( true ) {
                if ( ++index >= length ) throw new SyntaxError('Unexpected end of argument list at ' + index);
                var ch = expr.charAt( index );
                if ( ch == ')' && parenLevel-- == 0 ) {
                    // done. Now what?
                    if ( !subexp.match(/^\s*$/) ) {
                        var a = _comp( subexp );
                        args = a.expr;
                    }
                    ++index;
                    break;
                } else {
                    subexp += ch;
                    if (ch == '(') ++parenLevel;
                    /* ??? we should be watching for quoted strings here, too, may contain ( or ) */
                }
            }
            if ( nativeFuncs[name] && nativeFuncs[name].nargs != 0 && nativeFuncs[name].nargs > args.length)
                throw new ReferenceError('Native function ' + name + ' requires at least ' + nativeFuncs[name].nargs + ' arguments');
            return atom( FREF, { args: args, name: name, loc: index } );
        };

        // Scan variable reference. Allows dotted notation for simple traversal.
        var scan_vref = function( startch ) {
            var str = "";
            while ( index < length ) {
                var c = expr.charCodeAt( index );
                if ( ( c >= 65 && c <= 90 ) || ( c >= 97 && c <= 122 ) || (c >=48 && c <= 57) || c == 95 ) {
                        str += String.fromCharCode( c );
                        ++index;
                } else if ( c == 40 ) {
                    // Found a paren, continue processing as function reference
                    return scan_funcref( str );
                } else
                    break;
            }
            if ( "undefined" !== typeof reserved[str] ) return reserved[str];
            return str.length > 0 ? atom( VREF, { name: str, loc: index } ) : undefined;
        };

        // Scan nested expression. Pull it out and pass it to the compile (recursion).
        var scan_expr = function( startch ) {
            var str = "";
            // Scan for right bracket. Track nesting.
            var level = 0;
            while (1) {
                if ( ++index >= length ) throw new SyntaxError('Unmatched paren group at ' + index);
                var ch = expr.charAt( index );
                if (ch == ')' && level-- == 0) break;
                if (ch == '(') ++level;
                str += ch;
            }
            ++index; // skip closing paren
            return _comp( str ); // recurse
        };

        // Scan unary operators.
        var scan_unop = function( ch ) {
            if (ch == '-' || ch == '+' || ch == '!' || ch == '~') {
                // yes, it's a Unop
                if ( index >= length ) throw new SyntaxError('Unexpected end of expression parsing unop at ' + index);
                ++index; // skip unop
                var r = atom( LIST, { expr: [ atom( UNOP, { op : ch, loc: index } ) ] } );
                r.expr.unshift( scan_token() );
                return r;
            }
            return undefined;
        };

        // Scan binary operators. Find the longest matching one.
        var scan_binop = function() {
            skip_white();
            if ( index >= length ) return undefined;
            if ( "," === expr.charAt(index) ) {
                ++index;
                D("scan_binop EOS", expr.substr(index));
                return undefined;
            }

            var op = "";
            var mprec;
            while ( index < length ) {
                var ch = expr.charAt( index );
                var st = op + ch;
                var matched = false;
                for (var ix=0; ix<binops.length; ++ix) {
                    if ( binops[ix].op.substr(0, st.length) == st ) {
                        // matches something.
                        mprec = binops[ix].prec;
                        matched = true;
                        break;
                    }
                }
                if ( ! matched ) {
                    if ( st.length == 1 ) throw new SyntaxError('Expecting binary operator at ' + index); // On first char, have to match something.
                    break;
                }

                // keep looping to find the longest matching binop
                op = st;
                ++index;
            }
            return atom( BINOP, { op: op, prec: mprec, loc: index } );
        };

        // Scan our next token and return it.
        var scan_token = function() {
            skip_white();
            if ( index >= length ) return undefined;

            var ch = expr.charAt( index );
            if ( ch == '.' || (ch >= '0' && ch <= '9' ) ) {
                // Start of numeric value.
                return scan_numeric( ch );
            } else if ( ch == "'" || ch == '"' ) {
                // String literal.
                return scan_string( ch );
            } else if ( ch == '(' ) {
                // Nested expression.
                return scan_expr( ch );
            }

            // Check for unary operator.
            var unop = scan_unop( ch );
            if ( unop ) {
                return unop;
            }

            // Variable reference? (also checks special case of function reference)
            var vref = scan_vref( ch );
            if ( "undefined" !== typeof vref ) {
                return vref;
            }

            // Unrecognizable.
            throw new SyntaxError('Invalid token at ' + index + '(' + expr.substr(index) + ')');
        };

        // Parse expression to RPN: nested arrays of things to do later.
        var parse_rpn = function( lhs, lprec ) {
            var binop, rhs;
D("parse_rpn",lhs,lprec,expr.substr(index));
            // Mark our current position and get next binary operator
            var ilast = index;
            var lop = scan_binop();
            while ( lop && lop.prec <= lprec ) {
                // Lookahead operation is same or higher precedence (lower prec is higher precedence)
                binop = lop;
                rhs = scan_token();
D("parse_rpn rhs",rhs);
                if ( undefined === rhs ) throw new SyntaxError("Invalid token after op at " + ilast);

                // Mark our place again
                ilast = index;
D("parse_rpn rest is", expr.substr(index));
                lop = scan_binop();
                while ( lop && lop.prec < binop.prec ) {
                    // Lookahead binop has higher precedence, new subtree.
                    index = ilast;
                    rhs = parse_rpn( rhs, lop.prec);
                    ilast = index;
                    lop = scan_binop();
                }
                lhs = atom( LIST, { expr: [ lhs, rhs, binop ] } );
            }

            // Back to last binop and return current subtree.
            index = ilast;
            return lhs;
        };

        // Go! Fetch the initial token, and parse from next operator with default precedence.
        var ce = atom( LIST, { expr: [], source: expr } );
        while ( index < length ) {
D("_comp from", expr.substr(index));
            var token = scan_token();
            if ( undefined === token ) {
                break;
            }
            var a = parse_rpn( token, MAXPREC );
            ce.expr.push( a );
            ++index;
        }
        return ce;
    };

    // Public wrapper method.
    var compile = function( expr ) {
        var pk = _comp( expr );
        // D("lexp compiled expression",expr,"to",pk);
        return pk;
    };

    // Public method to execute the compiled expression. Allows a context to be passed in for variable references.
    // Also allows functions to be defined on the context or the compiled object itself.
    var run = function( ce, ctx, stack ) {
        ctx = ctx || {};
        stack = stack || [];
D(JSON.stringify(ce,null,2));

        function _resolve( a ) {
            if ( is_atom( a, VREF ) ) {
                if ( "undefined" !== typeof (ctx.__lvar || {})[a.name] ) {
                    return ctx.__lvar[a.name];
                }
                if ( "undefined" === typeof ctx[a.name] ) {
                    var msg = "Can't resolve " + String( a.name );
                    if ( a.loc ) {
                        msg += " at " + String( a.loc );
                    }
                    throw new ReferenceError( msg );
                }
                return ctx[a.name];
            }
            return a;
        }

        function _run( e ) {
            if ( !is_atom( e ) ) {
                /* Some primitive/literal; push to stack */
                stack.push(e);
            } else {
                /* Handle atom */
                if ( is_atom( e, LIST ) ) {
                    e.expr.forEach( function( se ) {
                        D("list atom running",se);
                        _run( se );
                        D("return from list atom",se,"stack is",stack);
                    });
                } else if ( is_atom( e, VREF ) ) {
                    /* Defer resolution; push back on stack. */
                    stack.push( e );
                } else if ( is_atom( e, BINOP ) ) {
                    var v2 = stack.pop();
                    var v1 = stack.pop();
                    var v1eval = v1;
                    if ( is_atom( v1, VREF ) ) {
                        v1eval = ctx[ v1.name ];
                        if ( "undefined" === typeof v1 ) {
                            throw new ReferenceError("Can't resolve " + v1.name);
                        }
                    }
                    var v2eval = v2;
                    if ( is_atom( v2, VREF ) ) {
                        v2eval = ctx[ v2.name ];
                        if ( "undefined" === typeof v2eval ) {
                            v2eval = null; /* temporary; other things happen later */
                        }
                    }
                    // D("binop v1=",v1,", v1eval=",v1eval,", v2=",v2,", v2eval=",v2eval);
                    if ( '.' === e.op ) {
                        if ( is_atom( v2, VREF ) ) {
                            v2eval = v2.name;
                        }
                        if ( null === v2eval ) {
                            throw new TypeError("Invalid accessor (null)");
                        }
                        if ( null === v1eval ) {
                            throw new ReferenceError("Can't get property " + String(v2eval) + " of null");
                        } else if ( "object" !== typeof v1eval ) {
                            throw new TypeError("Invalid operand for " + typeof v1eval);
                        }
                        v1eval = v1eval[v2eval];
                        if ( "undefined" === typeof v1eval ) {
                            v1eval = null;
                        }
                    } else if (e.op == '+') {
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
                    else if (e.op == '<>' || e.op == '!=')
                        v1eval = v1eval != v2eval;
                    else if (e.op == '<<' )
                        v1eval = v1eval << v2eval;
                    else if (e.op == '>>' )
                        v1eval = v1eval >> v2eval;
                    else if (e.op == '&&' || e.op == '?')
                        v1eval = v1eval && v2eval;
                    else if (e.op == '||' || e.op == ':')
                        v1eval = v1eval || v2eval;
                    else if (e.op == 'in' )
                        v1eval = v1eval in v2eval;
                    else if (e.op == '??' )
                        v1eval = ( null === v1eval || undefined === v1eval ) ? v2eval : v1eval;
                    else if (e.op == '=' ) {
                        if ( ! is_atom( v1, VREF ) ) {
                            throw new SyntaxError("Invalid assignment target");
                        }
                        if ( ! ( ctx.__lvar && "object" === typeof ctx.__lvar ) ) {
                            throw new Error("Assignments not permitted here; or did you mean to use \"==\" ?");
                        }
D("run() assign",v2eval,"to",v1.name);
                        ctx.__lvar[v1.name] = v2eval;
                        v1eval = v2eval;
                    } else {
                        throw new Error('BUG: unsupported op in compiled expression: ' + e.op);
                    }
                    stack.push(v1eval);
                } else if ( is_atom( e, UNOP ) ) {
                    var v = stack.pop();
                    var veval = v;
                    if ( is_atom( v, VREF ) ) {
                        veval = ctx[v.name];
                        if ( "undefined" === typeof( veval ) ) {
                            throw new Error("Can't resolve " + v.name);
                        }
                    }
                    if (e.op == '-')
                        stack.push(-veval);
                    else if (e.op == '+')
                        stack.push(veval);
                    else if (e.op == '!')
                        stack.push(!veval);
                    else if (e.op == '~')
                        stack.push(~veval);
                    else
                        throw new Error('BUG: unsupported unop in compiled expression: ' + e.op);
                } else if ( is_atom( e, FREF ) ) {
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
                    e.args.forEach( function( av ) {
                        D(e.name, "argument", av);
                        if ( is_atom( av ) ) {
                            _run( av ); /* pushes arg on stack -- ??? new stack for this??? */
                        } else {
                            stack.push( av );
                        }
                    });
                    D(e.name,"all args on stack:",stack);
                    var a = [];
                    e.args.forEach( function() {
                        var v = stack.pop();
                        if ( is_atom( v, VREF ) ) {
                            v = _resolve( v );
                        }
                        a.push( v );
                    });
                    var r = impl.apply( null, a );
                    stack.push( r );
                } else {
                    D("BUG: unsupported atom:", e);
                    throw new Error('BUG: unsupported atom');
                }
            }
            // D('_run is done, stack has ' + stack.length);
        } /* function _run() */

        if ( !is_atom( ce, LIST ) ) {
            throw new Error("Argument is not a compiled expression");
        }
        // D("lexp.run()", ce, ctx);
        _run( ce );
        D("lexp.run() is done", stack);
        if ( stack.length > 0 ) {
            var last = stack.pop();
            if ( is_atom( last, VREF ) ) {
                last = _resolve( last );
            }
            return last;
        }
        return null;
    };

    var evaluate = function( expr, context ) {
        return run( compile( expr ), context );
    };

    /* The exported... */
    return {
        compile: compile,
        run: run,
        evaluate: evaluate
    };

}));
