/**
 * $Id: lexp.js 179 2016-03-15 21:31:26Z patrick $
 */

define( [], function() {
	
	return lexp = (function() {
		'use strict'
		
		var stack = [];
		var node;
		
		var	VREF = 'vref',
			FREF = 'fref',
			UNOP = 'unop',
			BINOP = 'binop';
			
		var binops = [
			  { "op":'*', "prec":3 }
			, { "op":'/', "prec":3 }
			, { "op":'%', "prec":3 }
			, { "op":'+', "prec":4 }
			, { "op":'-', "prec":4 }
			, { "op":'<', "prec":6 }
			, { "op":'<=', "prec":6 }
			, { "op":'>', "prec":6 }
			, { "op":'>=', "prec":6 }
			, { "op":'==', "prec":7 }
			, { "op":'<>', "prec":7 }
			, { "op":'!=', "prec":7 }
			, { "op":'&', "prec":8 }
			, { "op":'^', "prec":9 }
			, { "op":'|', "prec":10 }
			, { "op":'=', "prec":14 }
		];
		var MAXPREC = 99; // value doesn't matter as long as it's >= any used in binops
		
		var reserved = { };
			
		var nativeFuncs = {
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
			, len : { nargs: 1, impl: function( s ) { return s.toString().length; } }
			, substr : { nargs: 3, impl: function( s, p, l ) { var s = s.toString(); if (l==undefined) l=s.length; return s.substr(p,l); } }
			, toupper: { nargs: 1, impl: function( s ) { return s.toString().toUpperCase(); } }
			, tolower: { nargs: 1, impl: function( s ) { return s.toString().toLowerCase(); } }
			, tonumber: { nargs: 1, impl: function( s ) { return parseFloat(s); } }
			, time: { nargs: 0, impl: function() { return Math.floor(new Date().getTime()/1000); } }
		};
		
		var _comp = function( expr ) {
			var index = 0;
			var length = expr.length;
			
			var skip_white = function() {
				var ch = expr.charCodeAt( index );
				while ( ch <= 32 && index < length ) ch = expr.charCodeAt( ++index );
			}

			// Starting from the current character position, peek as much of the stream as will match the provided regular expression.
			var peek = function( reg ) {
				var m = reg.exec( expr.substr( index ) );
				if ( m == undefined ) return undefined;
				return m[0];
			}

			// Scan for numeric value. Allow binary, octal and hex integers, and decimal/float.
			var scan_numeric = function( startch ) {
				// Peek and see if we're doing base conversion
				var s = peek( /^0(b[01]+|x[0-9a-f]+|[0-7]+)/i );
				if ( s != undefined ) {
					// Handle base-specific integer.
					var val = 0;
					index += s.length;		// advance
					s = s.toUpperCase();
					var ch = s.charCodeAt(1);
					var base;
					if (ch == 66) base = 2;
					else if (ch == 88) base = 16
					else base = 8;
					for (var ix=(base==8? 1 : 2); ix<s.length; ++ix) {
						ch = s.charCodeAt( ix ) - 48;
						if (ch > 9) ch -= 7;
						val = val * base + ch;
					}
					return val;
				}

				// Handle as decimal/float
				var str = peek( /^[0-9]+(\.[0-9]*)?([E][+-]?[0-9]+)?/i );
				if (str == undefined) return undefined;
				index += str.length;
				return parseFloat( str );
			}

			// Quoted literal string. Allow escaped quote (only).
			var scan_string = function( qchar ) {
				var str = "";
				var esc = false;
				while (1) {
					if (++index >= length) throw new SyntaxError('Unterminated string at ' + index);
					var ch = expr.charAt( index );
					if (ch == '\\') {
						esc = true;
						continue;
					} else if (ch == qchar && !esc) break;
					str += ch;
					esc = false;
				}
				++index; // skip closing quote
				return str;
			}

			// Scan function reference and parse/package argument list. Only called by scan_vref()
			var scan_funcref = function( name ) {
				var args = [];
				var parenLevel = 0;
				var subexp = "";
				while (1) {
					if ( ++index >= length ) throw new SyntaxError('Unexpected end of argument list at ' + index);
					var ch = expr.charAt( index );
					if ( ch == ')' && parenLevel-- == 0 ) {
						// done. Now what?
						if ( !subexp.match(/^\s*$/) )
							args.unshift( _comp( subexp ) );
						++index;
						break;
					} else if ( ch == ',' && parenLevel == 0 ) {
						// completed sub-expression.
						if ( subexp.match(/^\s*$/) ) 
							throw new SyntaxError('Invalid argument/sub-expression at ' + index);
						args.unshift( _comp( subexp ) );
						subexp = "";
					} else {
						subexp += ch;
						if (ch == '(') ++parenLevel;
					}
				}
				if ( nativeFuncs[name] && nativeFuncs[name].nargs != 0 && nativeFuncs[name].nargs > args.length)
					throw new ReferenceError('Native function ' + name + ' requires at least ' + nativeFuncs[name].nargs + ' arguments');
				return { type: FREF, args: args, name: name };
			}

			// Scan variable reference. Allows dotted notation for simple traversal.
			var scan_vref = function( startch ) {
				var str = "";
				var haveDot = false;
				while ( index < length ) {
					var c = expr.charCodeAt( index );
					if ( ( c >= 65 && c <= 90 ) || ( c >= 97 && c <= 122 ) || (c >=48 && c <= 57) || c == 95 || c == 46 ) {
							str += String.fromCharCode( c );
							if (c == 46) haveDot = true;
							++index;
					} else if ( c == 40 ) {
						// Found a paren, continue processing as function reference
						if ( haveDot ) throw new SyntaxError('Unexpected argument list after ' + str + ' at ' + index);
						return scan_funcref( str );
					} else
						break;
				}
				if ( !haveDot && reserved[str] ) return reserved[str];
				return str.length ? { type: VREF, name: str } : undefined;
			}

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
			}
			
			// Scan unary operators.
			var scan_unop = function( ch ) {
				if (ch == '-' || ch == '+' || ch == '!') {
					// yes, it's a Unop
					if ( index >= length ) throw new SyntaxError('Unexpected end of expression parsing unop at ' + index);
					++index; // skip unop
					var r = [ { type: UNOP, op : ch } ];
					r.unshift( scan_token() );
					return r;
				}
				return undefined;
			}
			
			// Scan binary operators. Find the longest matching one.
			var scan_binop = function() {
				skip_white();
				if ( index >= length ) return undefined;
				
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
				return { type: BINOP, op: op, prec: mprec };
			}

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
				if ( vref ) {
					return vref;
				}
				
				// Unrecognizable.
				throw new SyntaxError('Invalid token at ' + index);
			}

			// Parse expression to RPN: nested arrays of things to do later.
			var parse_rpn = function( lhs, lprec ) {
				var binop, rhs;
		
				// Mark our current position and get next binary operator
				var ilast = index;
				var lop = scan_binop();
				while (lop !== undefined && lop.prec <= lprec) {
					// Lookahead operation is same or higher precedence (lower prec is higher precedence)
					binop = lop;
					rhs = scan_token();
					if (rhs === undefined) throw new SyntaxError("Invalid token after op at " + ilast);
					
					// Mark our place again
					ilast = index;
					lop = scan_binop();
					while (lop !== undefined && lop.prec < binop.prec) {
						// Lookahead binop has higher precedence, new subtree.
						index = ilast;
						rhs = parse_rpn( rhs, lop.prec);
						ilast = index;
						lop = scan_binop();
					}
					lhs = [ lhs, rhs, binop ];
				}
				
				// Back to last binop and return current subtree.
				index = ilast;
				return lhs;
			}

			// Go! Fetch the initial token, and parse from next operator with default precedence.
			return [ parse_rpn( scan_token(), MAXPREC) ];
		}
		
		// Public wrapper method.
		var compile = function( expr ) {
			return { rpn: _comp( expr ) };
		}

		// Public method to execute the compiled expression. Allows a context to be passed in for variable references.
		// Also allows functions to be defined on the context or the compiled object itself.
		var run = function( ce, ctx ) {
			var stack = [];

			function _getcontext( name ) {
				var p = name.split('.');
				var node = ctx;
				while ( p.length ) {
					var next = p.shift();
					if ( typeof node[next] != "undefined" )
						node = node[next];
					else
						throw new ReferenceError( 'Undefined value at ' + next + ' in ' + name );
				}
				return node;
			}
						
			function _run( arr ) {
				var index = 0;
				var length = arr.length;
				while ( index < length ) {
					var e = arr[index++];
					// console.log('_run looking at element ' + index + ' of ' + length + ', a ' + typeof e);
					if ( typeof e == "number" || typeof e == "string" )
						stack.push(e);
					else if (e.type) {
						if (e.type == VREF) {
							stack.push( _getcontext( e.name ) );
						} else if (e.type == BINOP) {
							var v2 = stack.pop();
							var v1 = stack.pop();
							if (e.op == '+') {
								// Special case for plus (+): if either operand is string, treat as concat
								if (typeof v1 == "string" || typeof v2 == "string")
									v1 = v1.toString() + v2.toString();
								else
									v1 += v2;
							}
							else if (e.op == '-')
								v1 -= v2;
							else if (e.op == '*')
								v1 *= v2;
							else if (e.op == '/')
								v1 /= v2;
							else if (e.op == '%')
								v1 %= v2;
							else if (e.op == '&')
								v1 &= v2;
							else if (e.op == '|')
								v1 |= v2;
							else if (e.op == '^')
								v1 ^= v2;
							else if (e.op == '>')
								v1 = v1 > v2 ? 1 : 0;
							else if (e.op == '>=')
								v1 = v1 >= v2 ? 1 : 0;
							else if (e.op == '<')
								v1 = v1 < v2 ? 1 : 0;
							else if (e.op == '<=')
								v1 = v1 <= v2 ? 1 : 0;
							else if (e.op == '=' || e.op == '==')
								v1 = v1 == v2 ? 1 : 0;
							else if (e.op == '<>' || e.op == '!=')
								v1 = v1 != v2 ? 1 : 0;
							else 
								throw new InternalError('BUG: unsupported op in compiled expression: ' + e.op);
							stack.push(v1);
						} else if (e.type == UNOP) {
							var v = stack.pop();
							if (e.op == '-')
								stack.push(-v);
							else if (e.op == '+')
								stack.push(v);
							else if (e.op == '!')
								stack.push(v == 0 ? 1 : 0);
							else
								throw new InternalError('BUG: unsupported unop in compiled expression: ' + e.op);
						} else if (e.type == FREF) {
							// console.log('function ref ' + e.name + ' with ' + e.args.length + ' args');
							var name = e.name;
							var impl = undefined;
							if ( nativeFuncs[name] ) {
								// Native function implementation
								impl = nativeFuncs[name].impl;
							} else if (typeof ce[name] == "function") {
								// Attached to compiled expression
								impl = ce[name];
							} else if ( ctx['_func'] && typeof ctx['_func'][name] == "function" ) {
								// Attached to context
								impl = ctx['_func'][name];
							} else 
								throw new ReferenceError('Undefined function: ' + name);
								
							// Build argument list.
							for (var ix=0; ix<e.args.length; ++ix) _run( e.args[ix] );
							var a = [];
							for (var ix=0; ix<e.args.length; ++ix) a.push( stack.pop() );
							var r = impl.apply( this, a );
							stack.push( r );
						} else
							throw new InternalError('BUG: unsupported element type: ' + e.type);
					} else if ( Array.isArray(e) )
						_run( e );
					else
						throw new InternalError('BUG: unrecognized element at ' + index + ', is a ' + typeof e);
				}
				// console.log('_run is done, stack has ' + stack.length);
			}
			
			_run( ce.rpn );
			// console.log('run() is done, stack has ' + stack.length + ' (exactly 1 is expected)');
			// console.log('the result is ' + stack[0]);
			return stack.length > 0 ? stack.pop() : undefined;
		}
		
		var evaluate = function( expr, context ) {
			return run( compile( expr ), context );
		}
				
		
		return {
			compile: compile,
			run: run,
			evaluate: evaluate
		}

	})();
	
});