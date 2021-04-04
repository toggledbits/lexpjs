/** Grammar for lexpjs. Copyright (C) 2020 Patrick H. Rigney
 *  See https://github.com/toggledbits/lexpjs
 * 
 *  This Software is offered under the MIT LICENSE open source license. See https://opensource.org/licenses/MIT
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

/* Lexical analysis/rules. First come first served! */

%lex

%x STRD
%x STRS
%x STRB

%%

["]                                     { this.begin("STRD"); buffer = ""; }
[']                                     { this.begin("STRS"); buffer = ""; }
[`]                                     { this.begin("STRB"); buffer = ""; }
<STRD,STRS,STRB>\\x[0-9a-fA-F]{2}       { buffer += String.fromCharCode( parseInt( yytext.substring( 2 ), 16 ) ); }
<STRD,STRS,STRB>\\u[0-9a-fA-F]{4}       { buffer += String.fromCodePoint( parseInt( yytext.substring( 2 ), 16 ) ); }
<STRD,STRS,STRB>\\u\{[0-9a-fA-F]{1,6}\} { buffer += String.fromCodePoint( parseInt( yytext.slice( 3, -1 ), 16 ) ); }
<STRD,STRS,STRB>"\\0"                   { buffer += "\0"; }
<STRD,STRS,STRB>"\\'"                   { buffer += "'"; }
<STRD,STRS,STRB>"\\\""                  { buffer += '"'; }
<STRD,STRS,STRB>"\\`"                   { buffer += '`'; }
<STRD,STRS,STRB>"\\\\"                  { buffer += "\\"; }
<STRD,STRS,STRB>"\\n"                   { buffer += "\n"; }
<STRD,STRS,STRB>"\\r"                   { buffer += "\r"; }
<STRD,STRS,STRB>"\\v"                   { buffer += "\v"; }
<STRD,STRS,STRB>"\\t"                   { buffer += "\t"; }
<STRD,STRS,STRB>"\\b"                   { buffer += "\b"; }
<STRD,STRS,STRB>"\\f"                   { buffer += "\f"; }
<STRD,STRS,STRB>[\\](\r\n|\r|\n)\s*     { /* escape EOL: discard */ }
<STRD,STRS,STRB>\\.                     { buffer += yytext.charAt( 1 ); /* bogus escape => literal char */ }
<STRD,STRS,STRB>(\r\n|\r|\n)+           { buffer += yytext; }
<STRD,STRS,STRB><<EOF>>                 { return 'EOF_IN_STRING'; }
<STRD>["]                               { this.popState(); return 'QSTR'; }
<STRS>[']                               { this.popState(); return 'QSTR'; }
<STRB>[`]                               { this.popState(); return 'QSTR'; }
<STRD,STRS,STRB>.                       { buffer += yytext; }

\#[^\r\n]*              { /* skip comment */ }
\s+                     { /* skip whitespace */ }
\r                      { /* skip */ }
\n                      { /* skip */ }
","                     { return 'COMMA'; }
";"                     { return 'EXPRSEP'; }
"true"                  { return 'TRUE'; }
"false"                 { return 'FALSE'; }
"null"                  { return 'NULL'; }
"first"                 { return 'FIRST'; }
"with"                  { return 'WITH'; }
"each"                  { return 'EACH'; }
"NaN"                   { return 'NAN'; }
"Infinity"				{ return 'INF'; }
"if"                    { return 'IF'; }
"then"                  { return 'THEN'; }
"else"                  { return 'ELSE'; }
"endif"                 { return 'ENDIF'; }
"in"                    { return 'IN'; }
"done"                  { return 'DONE'; }
"do"                    { return 'DO'; }
"and"                   { return 'LAND'; }
"or"                    { return 'LOR'; }
"not"                   { return 'LNOT'; }
[A-Za-z_$][A-Za-z0-9_$]*\b  { return 'IDENTIFIER'; }
[0-9]+("."[0-9]+)?([eE][+-]?[0-9]+)?\b  {return 'NUMBER'; }
0x[0-9A-Fa-f]+\b        { return 'HEXNUM'; }
0o[0-7]+\b              { return 'OCTNUM'; }
0b[01]+\b               { return 'BINNUM'; }
":"                     { return 'COLON'; }
"**"                    { return 'POW'; }
"*"                     { return '*'; }
"/"                     { return '/'; }
"%"                     { return 'MOD'; }
"-"                     { return '-'; }
"+"                     { return '+'; }
">>>"					{ return '>>>' }
"<<"                    { return '<<'; }
">>"                    { return '>>'; }
"<="                    { return '<='; }
">="                    { return '>='; }
"<"                     { return '<'; }
">"                     { return '>'; }
"==="                   { return '==='; }
"=="                    { return '=='; }
"!=="                   { return '!=='; }
"!="                    { return '!='; }
"<>"                    { return '!='; }
"^"                     { return 'BXOR'; }
"&&"                    { return 'LAND'; }
"||"                    { return 'LOR'; }
"!"                     { return 'LNOT'; }
"&"                     { return 'BAND'; }
"|"                     { return 'BOR'; }
"~"                     { return 'BNOT'; }
"??"                    { return 'COALESCE'; }
"?."                    { return 'QDOT'; }
"?["                    { return 'QBRACKET'; }
"?"                     { return '?'; }
"="                     { return 'ASSIGN'; }
"."                     { return 'DOT'; }
"["                     { return '['; }
"]"                     { return ']'; }
"("                     { return '('; }
")"                     { return ')'; }
"{"                     { return 'LCURLY'; }
"}"                     { return 'RCURLY'; }
<<EOF>>                 { return 'EOF'; }

/lex

/* Operator associativity and precedence */

%right ASSIGN
%right FIRST EACH WITH
%left '?'
%left COLON
%left COALESCE
%left LOR
%left LAND
%left BOR
%left BXOR
%left BAND
%nonassoc '==' '===' '!=' '!=='
%nonassoc IN
%nonassoc '<' '<=' '>' '>='
%left '<<' '>>'
%left '+' '-'
%left '*' '/' MOD
%right POW
%left UMINUS
%right BNOT LNOT
%left DOT QDOT QBRACKET

%start expressions

%{
    var buffer = "", qsep = "";

    function is_atom( v, typ ) {
        return null !== v && "object" === typeof( v ) &&
            "undefined" !== typeof v.__atom &&
            ( !typ || v.__atom === typ );
    }

    function atom( t, vs ) {
        var a = { __atom: t };
        Object.keys(vs || {}).forEach( function( key ) {
            a[key] = vs[key];
        });
        return a;
    }

    function D( ...args ) {
        console.log( ...args );
    }
%}

%%

/* Here's the grammar. */

expressions
    : expr_list EOF
        { return $1; }
    ;

expr_list
    : expr_list COMMA e
        { $1.expr.push( $3 ); $$ = $1; }
    | expr_list EXPRSEP e
        { $1.expr.push( $3 ); $$ = $1; }
    | e
        { $$ = atom( 'list', { expr: [ $1 ] } ); }
    ;

/* arg_list - function arguments: expr_list or nothing */

arg_list
    : expr_list
        { $$ = $1; }
    |
        { $$ = atom( 'list', { expr: [] } ); }
    ;

/** A reference expression is an expression referring to a value or a member of a value (presumed to be an object or array).
 *  Certain expressions, such as function calls and parenthesized results, are considered reference expressions. This is a
 *  slight constraint to help disambiguate certain constructions that may otherwise be possible but usually aren't used
 *  (e.g. what does "A-OK"[3] mean?)
*/

ref_expr
    : IDENTIFIER
        { $$ = atom( 'vref', { name: $1 } ); }
    | ref_expr DOT IDENTIFIER
        { $$ = atom( 'deref', { context: $1, member: $3, locs: [@1, @3] } ); }
    | ref_expr '[' e ']'
        { $$ = atom( 'deref', { context: $1, member: $3, locs: [@1, @3] } ); }
    | ref_expr QDOT IDENTIFIER
        { $$ = atom( 'deref', { context: $1, member: $3, locs: [@1, @3], op: $2 } ); }
    | ref_expr QBRACKET e ']'
        { $$ = atom( 'deref', { context: $1, member: $3, locs: [@1, @3], op: $2 } ); }
    | IDENTIFIER '(' arg_list ')'
        { $$ = atom( 'fref', { name: $1, args: is_atom( $3, 'list') ? ($3).expr : [ $3 ], locs: [@1] } ); }
    | '(' e ')'
        { $$ = $2; }
    ;

quoted_string : QSTR { $$ = buffer; } ; /* creates necessary indirection (vs using QSTR below directly) */

dict_element
    : IDENTIFIER COLON e
        { $$ = { key: $1, value: $3 }; }
    | '[' quoted_string ']' COLON e
        { $$ = { key: $2, value: $5 }; }
    | quoted_string COLON e
        { $$ = { key: $1, value: $3 }; }
    ;

dict_elements
    : dict_elements COMMA dict_element
        { ($1)[($3).key] = ($3).value; $$ = $1; }
    | dict_element
        { $$ = { [($1).key]: ($1).value }; }
    ;

element_list
    : dict_elements
        { $$ = $1; }
    |
        { $$ = {}; }
    ;

array_elements
    : array_elements COMMA e
      { $1.push( $3 ); $$ = $1; }
    | e
      { $$ = [ $1 ]; }
    ;

/* Should this build a list atom? ??? */
array_list
    : array_elements
        { $$ = $1; }
    |
        { $$ = []; }
    ;

e
    : '-' e %prec UMINUS
        { $$ = atom( 'unop', { op: '-', val: $2 } ); }
    | LNOT e
        { $$ = atom( 'unop', { op: '!', val: $2 } ); }
    | BNOT e
        { $$ = atom( 'unop', { op: '~', val: $2 } ); }
    | e POW e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e '*' e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e '/' e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e MOD e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e '+' e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e '-' e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e '<<' e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e '>>' e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e '>>>' e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e BAND e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e BOR e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e BXOR e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e LAND e
        { $$ = atom( 'binop', { op: '&&', v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e LOR e
        { $$ = atom( 'binop', { op: '||', v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e '==' e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e '!=' e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e '===' e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e '!==' e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e IN e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e '<' e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e '<=' e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e '>' e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e '>=' e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e COALESCE e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e '?' e COLON e
        { $$ = atom( 'if', { test: $1, tc: $3, fc: $5, locs: [@1, @3, @5] } ); }
    | LCURLY element_list RCURLY
        { $$ = $2; }
    | '[' array_list ']'
        { $$ = $2; }
    | NUMBER
        { $$ = Number(yytext); }
    | HEXNUM
        { $$ = parseInt( yytext.substr( 2 ), 16 ); }
    | OCTNUM
        { $$ = parseInt( yytext.substr( 2 ), 8 ); }
    | BINNUM
        { $$ = parseInt( yytext.substr( 2 ), 2 ); }
    | quoted_string
        { $$ = $1; }
    | IF e THEN expr_list ELSE expr_list ENDIF
        { $$ = atom( 'if', { test: $2, tc: $4, fc: $6, locs: [@2, @4, @6] } ); }
    | IF e THEN expr_list ENDIF
        { $$ = atom( 'if', { test: $2, tc: $4, locs: [@2, @4] } ); }
    | TRUE
        { $$ = true; }
    | FALSE
        { $$ = false; }
    | NULL
        { $$ = null; }
    | NAN
        { $$ = NaN; }
	| INF
	    { $$ = Infinity; }
    | ref_expr
        { $$ = $1; }
    | IDENTIFIER ASSIGN e
        { $$ = atom( 'binop', { 'op': $2, v1: atom( 'vref', { name: $1 } ), v2: $3, locs: [@1, @3] } ); }
    | EACH IDENTIFIER IN e COLON e
        { $$ = atom( 'iter', { ident: $2, context: $4, exec: $6 } ); }
    | FIRST IDENTIFIER IN e WITH e
        { $$ = atom( 'search', { ident: $2, context: $4, exec: $6 } ); }
    | DO expr_list DONE
        { $$ = $2; }
    ;
