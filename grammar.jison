/** Grammar for lexpjs. Copyright (C) 2020,2021,2024 Patrick H. Rigney
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
 *
 *  NOTA BENE: REQUIRED MODIFICATION TO JISON-LEX FOR UNICODE IDENTIFIERS: See README-lexer.md.
 *             If you don't need Unicode-friendly identifiers, use the non-Unicode lex pattern.
 *             Search for "IDENTIFIER" (ALL CAPS) in this file to find the relevant lines.
 */

/* Lexical analysis/rules. First come first served! */

%lex

%x STRD
%x STRS
%x STRB
%x CMNT

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

[/][*]                                  { this.begin("CMNT"); }
<CMNT>(\r\n|\r|\n)+                     { /* discard */ }
<CMNT><<EOF>>                           { return 'EOF_IN_COMMENT'; }
<CMNT>[*][/]                            { this.popState(); /* discard */ }
<CMNT>.                                 { /* discard */ }

\s+                     { /* skip whitespace */ }
\r                      { /* skip */ }
\n                      { /* skip */ }
","                     { return 'COMMA'; }
";"                     { return 'EXPRSEP'; }
"local"                 { return 'LOCAL'; }
"global"                { return 'GLOBAL'; }
"define"                { return 'DEF'; }
"true"                  { return 'TRUE'; }
"false"                 { return 'FALSE'; }
"null"                  { return 'NULL'; }
"first"                 { return 'FIRST'; }
"with"                  { return 'WITH'; }
"each"                  { return 'EACH'; }
"NaN"                   { return 'NAN'; }
"Infinity"              { return 'INF'; }
"pi"\b                  { return 'PI'; }
"if"                    { return 'IF'; }
"then"                  { return 'THEN'; }
"elif"                  { return 'ELIF'; }
"elsif"                 { return 'ELIF'; }
"elseif"                { return 'ELIF'; }
"else"                  { return 'ELSE'; }
"endif"                 { return 'ENDIF'; }
"case"                  { return 'CASE'; }
"when"                  { return 'WHEN'; }
"end"                   { return 'END'; }
"in"                    { return 'IN'; }
"done"                  { return 'DONE'; }
"do"                    { return 'DO'; }
"and"                   { return 'LAND'; }
"or"                    { return 'LOR'; }
"not"                   { return 'LNOT'; }

/* NOTE: Only ONE of the two patterns that follow should be uncommented. */
/* Use this line if you don't want/need Unicode-friendly identifiers. */
/* [A-Za-z_$][A-Za-z0-9_$]*\b  { return 'IDENTIFIER'; } */
/* Use this line for Unicode-friendly identifiers. */
[\p{Alphabetic}_$][\p{Alphabetic}0-9_$]*\b  { return 'IDENTIFIER'; }

[0-9]+("."[0-9]*)?([eE][+-]?[0-9]+)?\b  { return 'NUMBER'; }
0x[0-9A-Fa-f]+\b        { return 'HEXNUM'; }
0o[0-7]+\b              { return 'OCTNUM'; }
0b[01]+\b               { return 'BINNUM'; }
\.\.                    { return 'RANGE'; }
":"                     { return 'COLON'; }
"**"                    { return 'POW'; }
"*"                     { return '*'; }
"/"                     { return '/'; }
"%"                     { return 'MOD'; }
"-"                     { return '-'; }
"+"                     { return '+'; }
">>>"                   { return '>>>'; }
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
"?#"                    { return 'COALESCENAN' }
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
\#[^\r\n]*              { /* skip comment */ }
<<EOF>>                 { return 'EOF'; }

/lex

/* Operator associativity and precedence */

%right ASSIGN
%right DEF LOCAL GLOBAL
%right FIRST EACH WITH
%right '?'
%right COLON
%left COALESCE COALESCENAN
%left LOR
%left LAND
%left BOR
%left BXOR
%left BAND
%nonassoc '==' '===' '!=' '!=='
%nonassoc IN
%nonassoc '<' '<=' '>' '>='
%left RANGE
%left '<<' '>>' '>>>'
%left '+' '-'
%left '*' '/' MOD
%right POW
%left UMINUS
%right BNOT LNOT
%left DOT QDOT QBRACKET

%start expressions

%{
    /* Grammar 25083 */

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
        // console.log( ...args );
    }
%}

%%

/* Here's the grammar. */

expressions
    : expr_list EOF
        { return $1; }
    ;

elif_list
    : elif_list ELIF e THEN expr_list
        { $1.push( { test: $3, tc: $5 } ); $$ = $1; }
    | ELIF e THEN expr_list
        { $$ = [ { test: $2, tc: $4 } ]; }
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
    | '[' ref_expr ']' COLON e
        { $$ = { key: $2, value: $5 }; }
    | quoted_string COLON e
        { $$ = { key: $1, value: $3 }; }
    ;

dict_elements
    : dict_elements COMMA dict_element
        { $1.push( $3 ); $$ = $1; }
    | dict_element
        { $$ = [ $1 ]; }
    ;

element_list
    : dict_elements
        { $$ = $1; }
    |
        { $$ = []; }
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

assignment
    : GLOBAL IDENTIFIER ASSIGN e
        { $$ = atom( 'binop', { 'op': $3, v1: atom( 'vref', { name: $2 } ), v2: $4, global: true, locs: [@2, @4] } ); }
    | LOCAL IDENTIFIER ASSIGN e
        { $$ = atom( 'binop', { 'op': $3, v1: atom( 'vref', { name: $2 } ), v2: $4, local: true, locs: [@2, @4] } ); }
    | ref_expr ASSIGN e
        { $$ = atom( 'binop', { 'op': $2, v1: $1, v2: $3, locs: [@1, @3] } ); }
    ;

when_list
    : when_list WHEN e COLON e ELSE e
        { $1.expr.push( atom( 'if', { test: $3, tc: $5, fc: $7, locs: [@3, @5, @7] } ) ); $$ = $1; }
    | when_list WHEN e COLON e
        { $1.expr.push( atom( 'if', { test: $3, tc: $5, locs: [@3, @5] } ) ); $$ = $1; }
    | WHEN e COLON e ELSE e
        { $$ = atom( 'list', { expr: [ atom( 'if', { test: $2, tc: $4, fc: $6, locs: [@2, @4, @5] } ) ] } ); }
    | WHEN e COLON e
        { $$ = atom( 'list', { expr: [ atom( 'if', { test: $2, tc: $4, locs: [@2, @4] } ) ] } ); }
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
    | e RANGE e
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
    | e COALESCENAN e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e '?' e COLON e
        { $$ = atom( 'if', { test: $1, tc: $3, fc: $5, locs: [@1, @3, @5] } ); }
    | LCURLY element_list RCURLY
        { $$ = atom( 'dict', { elements: $2 } ); }
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
    | IF e THEN expr_list elif_list ELSE expr_list ENDIF
        { $$ = atom( 'if', { test: $2, tc: $4, alts: $5, fc: $7, locs: [@2, @4, @5, @7] } ); }
    | IF e THEN expr_list elif_list ENDIF
        { $$ = atom( 'if', { test: $2, tc: $4, alts: $5, locs: [@2, @4, @5] } ); }
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
    | PI
        { $$ = Math.PI; }
    | ref_expr
        { $$ = $1; }
    | assignment
        { $$ = $1; }
    | EACH IDENTIFIER COMMA IDENTIFIER IN e COLON e
        { $$ = atom( 'iter', { value: $2, key: $4, context: $6, exec: $8 } ); }
    | EACH IDENTIFIER IN e COLON e
        { $$ = atom( 'iter', { value: $2, context: $4, exec: $6 } ); }
    | FIRST IDENTIFIER COMMA IDENTIFIER IN e WITH e COLON e
        { $$ = atom( 'search', { value: $2, key: $4, context: $6, exec: $8, result: $10 } ); }
    | FIRST IDENTIFIER IN e WITH e COLON e
        { $$ = atom( 'search', { value: $2, context: $4, exec: $6, result: $8 } ); }
    | FIRST IDENTIFIER COMMA IDENTIFIER IN e WITH e
        { $$ = atom( 'search', { value: $2, key: $4, context: $6, exec: $8 } ); }
    | FIRST IDENTIFIER IN e WITH e
        { $$ = atom( 'search', { value: $2, context: $4, exec: $6 } ); }
    | DO expr_list DONE
        { $$ = atom( 'block', { block: $2 } ); }
    | DEF IDENTIFIER '(' arg_list ')' e
        { $$ = atom( 'fdef', { name: $2, args: $4, list: $6 } ); }
    | CASE when_list END
        { $$ = atom( 'case', { when_list: $2 } ); }
    ;
