/* Grammar for lexpjs. Copyright (C) 2020 Patrick H. Rigney
 * See https://github.com/toggledbits/lexpjs
 */

/* Lexical analysis/rules. First come first served! */

%lex

%%
\s+                   {/* skip whitespace */}
\r                      { /* skip */ }
\n                      { /* skip */ }
","                     { return 'COMMA'; }
"true"                  { return 'TRUE'; }
"false"                 { return 'FALSE'; }
"null"                  { return 'NULL'; }
"NaN"                   { return 'NAN'; }
"if"                    { return 'IF'; }
"in"                    { return 'IN'; }
\"[^"]*\"               { return 'QSTR'; } /* NB Jison now support start conditions */
\'[^']*\'               { return 'QSTR'; }
\`[^']*\`               { return 'QSTR'; }
[A-Za-z$][A-Za-z0-9_$]*\b  { return 'IDENTIFIER'; }
[0-9]+("."[0-9]+)?([eE][+-]?[0-9]+)?\b  {return 'NUMBER'; }
0x[0-9A-Fa-f]+\b          { return 'HEXNUM'; }
0o[0-7]+\b                { return 'OCTNUM'; }
":"                     { return 'COLON'; }
"**"                    { return 'POW'; }
"*"                   {return '*';}
"/"                   {return '/';}
"%"                     { return 'MOD'; }
"-"                   {return '-';}
"+"                   {return '+';}
"<<"                    { return '<<'; }
">>"                    { return '>>'; }
"<"                     { return '<'; }
"<="                    { return '<='; }
">"                     { return '>'; }
">="                    { return '>='; }
"==="                   { return '==='; }
"=="                    { return '=='; }
"!=="                   { return '!=='; }
"!="                    { return '!='; }
"<>"                    { return '!='; }
"^"                   {return 'BXOR';}
"&&"                    { return 'LAND'; }
"||"                    { return 'LOR'; }
"&"                     { return 'BAND'; }
"|"                     { return 'BOR'; }
"!"                     { return 'NOT'; }
"??"                    { return 'COALESCE'; }
"?"                     { return '?'; }
"="                     { return 'ASSIGN'; }
"."                     { return 'DOT'; }
"["                     { return '['; }
"]"                     { return ']'; }
"("                   {return '(';}
")"                   {return ')';}
"{"                     return 'LCURLY';
"}"                     return 'RCURLY';
<<EOF>>               {return 'EOF';}

/lex

/* Operator associativity and precedence */

%precedence ASSIGN
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
%left DOT
%left UMINUS
%right NOT

%start expressions

%{
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
        {
            if ( is_atom( $1, 'list' ) ) {
                $1.expr.push( $3 );
                $$ = $1;
            } else {
                $$ = atom( 'list', { expr: [ $1, $3 ] } );
            }
        }
    | e
        { $$ = $1; }
    ;

ident
    : IDENTIFIER
        { $$ = $1; }
    | '[' QSTR ']'
        { $$ = $2.slice( 1, -1 ); }
    ;

ref_expr
    : ident
        { $$ = atom( 'vref', { name: $1 } ); }
    | ref_expr DOT IDENTIFIER
        { $$ = atom( 'deref', { context: $1, member: $3, locs: [@1, @3] } ); }
    | ref_expr '[' e ']'
        { $$ = atom( 'deref', { context: $1, member: $3, locs: [@1, @3] } ); }
    ;

array_elements
    : array_elements COMMA e
      { $1.push( $3 ); $$ = $1; }
    | e
      { $$ = [ $1 ]; }
    ;

dict_element
    : ident COLON e
        { $$ = { key: $1, value: $3 }; }
    ;

dict_elements
    : dict_elements COMMA dict_element
        { ($1)[($3).key] = ($3).value; $$ = $1; }
    | dict_element
        { $$ = { [($1).key]: ($1).value }; }
    ;

element_list
    : array_elements
        { $$ = $1; }
    | dict_elements
        { $$ = $1; }
    |
        { $$ = {}; }
    ;

e
    : '-' e %prec UMINUS
        { $$ = atom( 'unop', { op: '-', val: $2 } ); }
    | NOT e
        { $$ = atom( 'unop', { op: '!', val: $2 } ); }
    | IDENTIFIER ASSIGN e
        { $$ = atom( 'binop', { 'op': $2, v1: atom( 'vref', { name: $1 } ), v2: $3, locs: [@1, @3] } ); }
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
    | e BAND e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e BOR e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e BXOR e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e LAND e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
    | e LOR e
        { $$ = atom( 'binop', { op: $2, v1: $1, v2: $3, locs: [@1,@3] } ); }
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
    | NUMBER
        { $$ = Number(yytext); }
    | HEXNUM
        { $$ = parseInt( yytext.substr( 2 ), 16 ); }
    | OCTNUM
        { $$ = parseInt( yytext.substr( 2 ), 8 ); }
    | QSTR
        { $$ = yytext.slice( 1, -1 ); }
    | IF '(' e COMMA e COMMA e ')'
        { $$ = atom( 'if', { test: $3, tc: $5, fc: $7, locs: [@3, @5, @7] } ); }
    | IF '(' e COMMA e ')'
        { $$ = atom( 'if', { test: $3, tc: $5, locs: [@3, @5] } ); }
    | IDENTIFIER '(' expr_list ')'
        { $$ = atom( 'fref', { name: $1, args: is_atom( $3, 'list') ? ($3).expr : [ $3 ], locs: [@1] } ); }
    | TRUE
        { $$ = true; }
    | FALSE
        { $$ = false; }
    | NULL
        { $$ = null; }
    | NAN
        { $$ = NaN; }
    | ref_expr
        { $$ = $1; }
    | '(' e ')'
        { $$ = $2; }
    ;
